import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("kofa.db");
db.pragma('foreign_keys = ON');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'archived'
    type TEXT DEFAULT 'league' -- 'league', 'knockout'
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gaming_id TEXT UNIQUE,
    photo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER,
    player1_id INTEGER,
    player2_id INTEGER,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed'
    match_date DATETIME,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES players(id) ON DELETE CASCADE
  );

  -- Seed Data
  INSERT OR IGNORE INTO seasons (id, name, status, type) VALUES (1, 'KOFA Season 1', 'active', 'league');
  
  INSERT OR IGNORE INTO players (id, name, gaming_id, photo_url) VALUES 
  (1, 'Alex Hunter', 'ALEX_H', 'https://picsum.photos/seed/p1/200'),
  (2, 'Marcus Rashford', 'MR10', 'https://picsum.photos/seed/p2/200'),
  (3, 'Kylian Mbappe', 'KM7', 'https://picsum.photos/seed/p3/200'),
  (4, 'Erling Haaland', 'EH9', 'https://picsum.photos/seed/p4/200');

  INSERT OR IGNORE INTO matches (id, season_id, player1_id, player2_id, player1_score, player2_score, status, match_date) VALUES 
  (1, 1, 1, 2, 2, 1, 'completed', '2026-03-01 18:00:00'),
  (2, 1, 3, 4, 0, 0, 'scheduled', '2026-03-15 20:00:00');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Seasons
  app.get("/api/seasons", (req, res) => {
    const seasons = db.prepare("SELECT * FROM seasons ORDER BY id DESC").all();
    res.json(seasons);
  });

  app.post("/api/seasons", (req, res) => {
    const { name, type } = req.body;
    const info = db.prepare("INSERT INTO seasons (name, type) VALUES (?, ?)").run(name, type);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/seasons/:id", (req, res) => {
    db.prepare("DELETE FROM seasons WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Players
  app.get("/api/players", (req, res) => {
    const players = db.prepare("SELECT * FROM players").all();
    res.json(players);
  });

  app.get("/api/players/:id", (req, res) => {
    const player = db.prepare("SELECT * FROM players WHERE id = ?").get(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });
    
    const matches = db.prepare(`
      SELECT m.*, 
             p1.name as player1_name, p1.photo_url as player1_photo,
             p2.name as player2_name, p2.photo_url as player2_photo
      FROM matches m
      JOIN players p1 ON m.player1_id = p1.id
      JOIN players p2 ON m.player2_id = p2.id
      WHERE m.player1_id = ? OR m.player2_id = ?
      ORDER BY m.match_date DESC
    `).all(req.params.id, req.params.id);
    
    res.json({ ...player, matches });
  });

  app.post("/api/players", (req, res) => {
    const { name, gaming_id, photo_url } = req.body;
    const info = db.prepare("INSERT INTO players (name, gaming_id, photo_url) VALUES (?, ?, ?)").run(name, gaming_id, photo_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/players/:id", (req, res) => {
    const { name, gaming_id, photo_url } = req.body;
    db.prepare("UPDATE players SET name = ?, gaming_id = ?, photo_url = ? WHERE id = ?").run(name, gaming_id, photo_url, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/players/:id", (req, res) => {
    db.prepare("DELETE FROM players WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Matches
  app.get("/api/matches", (req, res) => {
    const { season_id } = req.query;
    let query = `
      SELECT m.*, 
             p1.name as player1_name, p1.photo_url as player1_photo,
             p2.name as player2_name, p2.photo_url as player2_photo
      FROM matches m
      JOIN players p1 ON m.player1_id = p1.id
      JOIN players p2 ON m.player2_id = p2.id
    `;
    const params = [];
    if (season_id) {
      query += " WHERE m.season_id = ?";
      params.push(season_id);
    }
    query += " ORDER BY m.match_date DESC";
    const matches = db.prepare(query).all(...params);
    res.json(matches);
  });

  app.post("/api/matches", (req, res) => {
    const { season_id, player1_id, player2_id, match_date } = req.body;
    const info = db.prepare("INSERT INTO matches (season_id, player1_id, player2_id, match_date) VALUES (?, ?, ?, ?)").run(season_id, player1_id, player2_id, match_date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/matches/:id", (req, res) => {
    const { id } = req.params;
    const { player1_score, player2_score, status } = req.body;
    db.prepare("UPDATE matches SET player1_score = ?, player2_score = ?, status = ? WHERE id = ?").run(player1_score, player2_score, status, id);
    res.json({ success: true });
  });

  app.delete("/api/matches/:id", (req, res) => {
    db.prepare("DELETE FROM matches WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Standings Calculation
  app.get("/api/standings/:season_id", (req, res) => {
    const players = db.prepare("SELECT * FROM players").all();
    const matches = db.prepare("SELECT * FROM matches WHERE season_id = ? AND status = 'completed'").all(req.params.season_id);
    
    const standings = players.map(player => {
      const stats = {
        id: player.id,
        name: player.name,
        photo_url: player.photo_url,
        gaming_id: player.gaming_id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0
      };

      matches.forEach(match => {
        const s1 = match.player1_score || 0;
        const s2 = match.player2_score || 0;
        
        if (match.player1_id === player.id) {
          stats.played++;
          stats.gf += s1;
          stats.ga += s2;
          if (s1 > s2) {
            stats.won++;
            stats.points += 3;
          } else if (s1 === s2) {
            stats.drawn++;
            stats.points += 1;
          } else {
            stats.lost++;
          }
        } else if (match.player2_id === player.id) {
          stats.played++;
          stats.gf += s2;
          stats.ga += s1;
          if (s2 > s1) {
            stats.won++;
            stats.points += 3;
          } else if (s2 === s1) {
            stats.drawn++;
            stats.points += 1;
          } else {
            stats.lost++;
          }
        }
      });

      stats.gd = stats.gf - stats.ga;
      return stats;
    });

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    res.json(standings);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
