import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle, Badge } from '../components/UI';
import { Users, Trophy } from 'lucide-react';
import { Match, Season } from '../types';
import { format } from 'date-fns';

export function Results() {
  const [matches, setMatches] = useState<Match[]>([]);
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
      const fetchMatches = async () => {
        const res = await fetch(`/api/matches?season_id=${selectedSeason}`);
        const data: Match[] = await res.json();
        setMatches(data.filter(m => m.status === 'completed'));
      };
      fetchMatches();
    }
  }, [selectedSeason]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionTitle title="Match Results" subtitle="Past Outcomes" />
        <select 
          className="glass bg-white/5 rounded-xl px-4 py-2 outline-none"
          value={selectedSeason}
          onChange={e => setSelectedSeason(parseInt(e.target.value))}
        >
          {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {matches.length > 0 ? matches.map(match => (
          <GlassCard key={match.id} hover className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs text-white/40 mb-1">{format(new Date(match.match_date), 'PPP')}</p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                    {match.player1_photo ? <img src={match.player1_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-4 h-4 text-white/20" />}
                  </div>
                  <span className={`font-bold ${match.player1_score > match.player2_score ? 'text-emerald-400' : ''}`}>{match.player1_name}</span>
                </div>
                <span className="text-white/20">VS</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                    {match.player2_photo ? <img src={match.player2_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-4 h-4 text-white/20" />}
                  </div>
                  <span className={`font-bold ${match.player2_score > match.player1_score ? 'text-emerald-400' : ''}`}>{match.player2_name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <span className={`text-4xl font-black ${match.player1_score > match.player2_score ? 'text-emerald-400' : 'text-white/40'}`}>{match.player1_score}</span>
                <span className="text-2xl text-white/20">-</span>
                <span className={`text-4xl font-black ${match.player2_score > match.player1_score ? 'text-emerald-400' : 'text-white/40'}`}>{match.player2_score}</span>
              </div>
              <Badge variant="success">FT</Badge>
            </div>
          </GlassCard>
        )) : (
          <GlassCard className="py-20 text-center">
            <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No match results found for this season.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
