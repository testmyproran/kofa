import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle, Badge } from '../components/UI';
import { Plus, Trash2, Edit2, Check, X, Users, Trophy, Calendar, Shield } from 'lucide-react';
import { Player, Season, Match, cn } from '../types';
import { format } from 'date-fns';

const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

export function Admin() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'seasons' | 'players' | 'matches'>('seasons');
  
  // Form States
  const [newSeason, setNewSeason] = useState({ name: '', type: 'league' as const });
  const [newPlayer, setNewPlayer] = useState({ name: '', gaming_id: '', photo_url: '' });
  const [newMatch, setNewMatch] = useState({ 
    season_id: 0, 
    player1_id: 0, 
    player2_id: 0, 
    match_date: getLocalISOString()
  });
  
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [matchScores, setMatchScores] = useState({ player1_score: 0, player2_score: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sRes, pRes, mRes] = await Promise.all([
      fetch('/api/seasons'),
      fetch('/api/players'),
      fetch('/api/matches')
    ]);
    const [sData, pData, mData] = await Promise.all([sRes.json(), pRes.json(), mRes.json()]);
    setSeasons(sData);
    setPlayers(pData);
    setMatches(mData);
    if (sData.length > 0) setNewMatch(prev => ({ ...prev, season_id: sData[0].id }));
    if (pData.length > 1) setNewMatch(prev => ({ ...prev, player1_id: pData[0].id, player2_id: pData[1].id }));
  };

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSeason)
    });
    setNewSeason({ name: '', type: 'league' });
    fetchData();
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer)
    });
    setNewPlayer({ name: '', gaming_id: '', photo_url: '' });
    fetchData();
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMatch.season_id === 0 || newMatch.player1_id === 0 || newMatch.player2_id === 0) {
      alert("Please select a season and both players!");
      return;
    }
    if (newMatch.player1_id === newMatch.player2_id) {
      alert("A player cannot play against themselves!");
      return;
    }
    await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMatch)
    });
    fetchData();
  };

  const handleUpdateResult = async (matchId: number) => {
    await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...matchScores, status: 'completed' })
    });
    setEditingMatch(null);
    fetchData();
  };

  const handleDeleteSeason = async (id: number) => {
    if (!confirm('Are you sure? This will delete all matches in this season.')) return;
    await fetch(`/api/seasons/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeletePlayer = async (id: number) => {
    if (!confirm('Are you sure? This will delete all matches for this player.')) return;
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/matches/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="space-y-8 pb-12">
      <SectionTitle title="Admin Dashboard" subtitle="Manage KOFA Tournament" />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['seasons', 'players', 'matches'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl font-bold transition-all capitalize",
              activeTab === tab ? "bg-emerald-500 text-black" : "glass hover:bg-white/10 text-white/60"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'seasons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Trophy className="w-5 h-5 text-emerald-400" /> Create Season</h3>
            <form onSubmit={handleCreateSeason} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 uppercase font-bold mb-1 block">Season Name</label>
                <input 
                  className="w-full glass bg-white/5 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="e.g. Season 1"
                  value={newSeason.name}
                  onChange={e => setNewSeason({...newSeason, name: e.target.value})}
                />
              </div>
              <button className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-all">Create Season</button>
            </form>
          </GlassCard>
          <div className="lg:col-span-2 space-y-4">
            {seasons.map(s => (
              <GlassCard key={s.id} className="flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-lg">{s.name}</h4>
                  <Badge variant={s.status === 'active' ? 'success' : 'default'}>{s.status}</Badge>
                </div>
                <button onClick={() => handleDeleteSeason(s.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /> Add Player</h3>
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <input 
                className="w-full glass bg-white/5 rounded-xl px-4 py-3 outline-none"
                placeholder="Player Name"
                value={newPlayer.name}
                onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
              />
              <input 
                className="w-full glass bg-white/5 rounded-xl px-4 py-3 outline-none"
                placeholder="Gaming ID"
                value={newPlayer.gaming_id}
                onChange={e => setNewPlayer({...newPlayer, gaming_id: e.target.value})}
              />
              <input 
                className="w-full glass bg-white/5 rounded-xl px-4 py-3 outline-none"
                placeholder="Photo URL"
                value={newPlayer.photo_url}
                onChange={e => setNewPlayer({...newPlayer, photo_url: e.target.value})}
              />
              <button className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-all">Add Player</button>
            </form>
          </GlassCard>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map(p => (
              <GlassCard key={p.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center overflow-hidden">
                    {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-6 h-6 text-white/20" />}
                  </div>
                  <div>
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-xs text-white/40">{p.gaming_id}</p>
                  </div>
                </div>
                <button onClick={() => handleDeletePlayer(p.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="space-y-8">
          <GlassCard>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-400" /> Schedule Match</h3>
            <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select 
                className="glass bg-white/5 rounded-xl px-4 py-3 outline-none"
                value={newMatch.season_id}
                onChange={e => setNewMatch({...newMatch, season_id: parseInt(e.target.value)})}
              >
                <option value={0}>Season</option>
                {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select 
                className="glass bg-white/5 rounded-xl px-4 py-3 outline-none"
                value={newMatch.player1_id}
                onChange={e => setNewMatch({...newMatch, player1_id: parseInt(e.target.value)})}
              >
                <option value={0}>Player 1</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select 
                className="glass bg-white/5 rounded-xl px-4 py-3 outline-none"
                value={newMatch.player2_id}
                onChange={e => setNewMatch({...newMatch, player2_id: parseInt(e.target.value)})}
              >
                <option value={0}>Player 2</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input 
                type="datetime-local"
                className="glass bg-white/5 rounded-xl px-4 py-3 outline-none text-white"
                value={newMatch.match_date}
                onChange={e => setNewMatch({...newMatch, match_date: e.target.value})}
              />
              <button className="md:col-span-4 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-all">Schedule Match</button>
            </form>
          </GlassCard>

          <div className="space-y-4">
            {matches.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()).map(m => (
              <GlassCard key={m.id} className="flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-xs text-white/40 mb-1">{format(new Date(m.match_date), 'PPP p')}</p>
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <span className="font-bold">{m.player1_name}</span>
                    <span className="text-white/20">VS</span>
                    <span className="font-bold">{m.player2_name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {editingMatch === m.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        className="w-12 glass bg-white/10 rounded-lg p-1 text-center font-bold"
                        value={matchScores.player1_score}
                        onChange={e => setMatchScores({ ...matchScores, player1_score: parseInt(e.target.value) })}
                      />
                      <span className="text-white/20">-</span>
                      <input 
                        type="number" 
                        className="w-12 glass bg-white/10 rounded-lg p-1 text-center font-bold"
                        value={matchScores.player2_score}
                        onChange={e => setMatchScores({ ...matchScores, player2_score: parseInt(e.target.value) })}
                      />
                      <button onClick={() => handleUpdateResult(m.id)} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded-lg">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingMatch(null)} className="p-1 text-red-400 hover:bg-red-400/10 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black">{m.status === 'completed' ? `${m.player1_score} - ${m.player2_score}` : 'VS'}</div>
                      <button 
                        onClick={() => {
                          setEditingMatch(m.id);
                          setMatchScores({ player1_score: m.player1_score || 0, player2_score: m.player2_score || 0 });
                        }}
                        className="p-1 text-white/20 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <Badge variant={m.status === 'completed' ? 'success' : 'default'}>{m.status}</Badge>
                  <button onClick={() => handleDeleteMatch(m.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
