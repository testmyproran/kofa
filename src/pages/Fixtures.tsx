import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle, Badge } from '../components/UI';
import { Users, Calendar, Clock } from 'lucide-react';
import { Match, Season } from '../types';
import { format } from 'date-fns';

export function Fixtures() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(0);

  const getMatchStatus = (match: Match) => {
    if (match.status === 'completed') return { label: 'Completed', variant: 'success' as const };
    
    const matchDate = new Date(match.match_date);
    const now = new Date();
    const diffMs = now.getTime() - matchDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 0 && diffHours < 2) {
      return { label: 'Live', variant: 'warning' as const };
    } else if (diffHours < 0) {
      return { label: 'Scheduled', variant: 'default' as const };
    } else {
      return { label: 'Pending Result', variant: 'danger' as const };
    }
  };

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
        // Sort matches by date: Live first, then Scheduled, then Completed
        const sorted = data.sort((a, b) => {
          const statusA = getMatchStatus(a).label;
          const statusB = getMatchStatus(b).label;
          
          const priority = { 'Live': 0, 'Scheduled': 1, 'Pending Result': 2, 'Completed': 3 };
          return (priority[statusA as keyof typeof priority] || 4) - (priority[statusB as keyof typeof priority] || 4) 
                 || new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
        });
        setMatches(sorted);
      };
      fetchMatches();
    }
  }, [selectedSeason]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionTitle title="Upcoming Fixtures" subtitle="Match Schedule" />
        <select 
          className="glass bg-white/5 rounded-xl px-4 py-2 outline-none"
          value={selectedSeason}
          onChange={e => setSelectedSeason(parseInt(e.target.value))}
        >
          {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(match => {
            const status = getMatchStatus(match);
            return (
              <GlassCard key={match.id} hover className="flex flex-col items-center text-center relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    {format(new Date(match.match_date), 'PPP p')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full glass flex items-center justify-center overflow-hidden">
                      {match.player1_photo ? <img src={match.player1_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-8 h-8 text-white/20" />}
                    </div>
                    <p className="font-bold text-sm truncate w-full">{match.player1_name}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    {match.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">{match.player1_score}</span>
                        <span className="text-white/20">-</span>
                        <span className="text-2xl font-black text-white">{match.player2_score}</span>
                      </div>
                    ) : (
                      <div className="text-xl font-black text-white/10 italic">VS</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full glass flex items-center justify-center overflow-hidden">
                      {match.player2_photo ? <img src={match.player2_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-8 h-8 text-white/20" />}
                    </div>
                    <p className="font-bold text-sm truncate w-full">{match.player2_name}</p>
                  </div>
                </div>
                
                {status.label === 'Live' && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-400 animate-pulse uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    Match is currently live
                  </div>
                )}
                
                <button className="mt-6 text-xs font-bold text-emerald-400 hover:underline">Match Details</button>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="py-20 text-center">
          <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40">No upcoming matches scheduled for this season.</p>
        </GlassCard>
      )}
    </div>
  );
}
