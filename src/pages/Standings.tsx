import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle } from '../components/UI';
import { Users } from 'lucide-react';
import { Standing, Season } from '../types';
import { Link } from 'react-router-dom';

export function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(0);

  useEffect(() => {
    const fetchSeasons = async () => {
      const res = await fetch('/api/seasons');
      const data = await res.json();
      setSeasons(data);
      if (data.length > 0) setSelectedSeason(data[0].id);
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      const fetchStandings = async () => {
        const res = await fetch(`/api/standings/${selectedSeason}`);
        setStandings(await res.json());
      };
      fetchStandings();
    }
  }, [selectedSeason]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionTitle title="League Table" subtitle="Standings & Rankings" />
        <select 
          className="glass bg-white/5 rounded-xl px-4 py-2 outline-none"
          value={selectedSeason}
          onChange={e => setSelectedSeason(parseInt(e.target.value))}
        >
          {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <GlassCard className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="p-6 font-medium">Pos</th>
                <th className="p-6 font-medium">Player</th>
                <th className="p-6 font-medium text-center">P</th>
                <th className="p-6 font-medium text-center">W</th>
                <th className="p-6 font-medium text-center">D</th>
                <th className="p-6 font-medium text-center">L</th>
                <th className="p-6 font-medium text-center">GF</th>
                <th className="p-6 font-medium text-center">GA</th>
                <th className="p-6 font-medium text-center">GD</th>
                <th className="p-6 font-medium text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((player, idx) => (
                <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-6 font-mono text-sm text-white/50">{idx + 1}</td>
                  <td className="p-6">
                    <Link to={`/players/${player.id}`} className="flex items-center gap-4 hover:text-emerald-400 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {player.photo_url ? <img src={player.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-5 h-5 text-white/30" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{player.name}</span>
                        <span className="text-xs text-white/40">{player.gaming_id}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="p-6 text-center font-mono">{player.played}</td>
                  <td className="p-6 text-center font-mono">{player.won}</td>
                  <td className="p-6 text-center font-mono">{player.drawn}</td>
                  <td className="p-6 text-center font-mono">{player.lost}</td>
                  <td className="p-6 text-center font-mono text-white/50">{player.gf}</td>
                  <td className="p-6 text-center font-mono text-white/50">{player.ga}</td>
                  <td className="p-6 text-center font-mono font-bold">{player.gd > 0 ? `+${player.gd}` : player.gd}</td>
                  <td className="p-6 text-center">
                    <span className="text-xl font-black text-emerald-400">{player.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
