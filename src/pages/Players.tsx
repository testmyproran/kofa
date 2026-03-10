import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle } from '../components/UI';
import { Users, Search } from 'lucide-react';
import { Player } from '../types';
import { Link } from 'react-router-dom';

export function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/players').then(r => r.json()).then(setPlayers);
  }, []);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.gaming_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionTitle title="Players" subtitle="Tournament Participants" />
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search players..." 
            className="w-full glass bg-white/5 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map(player => (
          <GlassCard key={player.id} hover className="group">
            <Link to={`/players/${player.id}`} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full glass mb-4 p-1 group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                  {player.photo_url ? (
                    <img src={player.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Users className="w-10 h-10 text-white/20" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{player.name}</h3>
              <p className="text-white/40 text-sm mb-4">{player.gaming_id}</p>
              
              <div className="w-full pt-4 border-t border-white/5 flex justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/60 group-hover:text-emerald-400 transition-colors">View Profile</span>
              </div>
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
