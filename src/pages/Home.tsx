import React, { useState, useEffect } from 'react';
import { GlassCard, SectionTitle, Badge } from '../components/UI';
import { Trophy, Calendar, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Standing, Match, Season } from '../types';

export function Home() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [latestResult, setLatestResult] = useState<Match | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seasonsRes = await fetch('/api/seasons');
        const seasons = await seasonsRes.json();
        const active = seasons.find((s: Season) => s.status === 'active') || seasons[0];
        setActiveSeason(active);

        if (active) {
          const standingsRes = await fetch(`/api/standings/${active.id}`);
          setStandings(await standingsRes.json());

          const matchesRes = await fetch(`/api/matches?season_id=${active.id}`);
          const matches: Match[] = await matchesRes.json();
          
          const upcoming = matches.filter(m => m.status === 'scheduled').sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())[0];
          setNextMatch(upcoming || null);

          const completed = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())[0];
          setLatestResult(completed || null);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-3xl overflow-hidden glass flex items-center px-8 md:px-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover opacity-30"
            alt="Esports Arena"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <Badge variant="success">LIVE SEASON</Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mt-4 mb-6 leading-none">
            {activeSeason?.name || "KOFA Season 1"}
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-lg">
            Experience the ultimate eFootball tournament management. Individual skill, real competition, one champion.
          </p>
          <div className="flex gap-4">
            <Link to="/standings" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              View Standings
            </Link>
            <Link to="/fixtures" className="px-8 py-3 glass hover:bg-white/10 text-white font-bold rounded-xl transition-all">
              Fixtures
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Standings */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <div className="flex justify-between items-end mb-6">
              <SectionTitle title="Standings" subtitle="Current Ranking" />
              <Link to="/standings" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline mb-8">
                Full Table <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/10">
                    <th className="pb-4 font-medium">Pos</th>
                    <th className="pb-4 font-medium">Player</th>
                    <th className="pb-4 font-medium text-center">P</th>
                    <th className="pb-4 font-medium text-center">GD</th>
                    <th className="pb-4 font-medium text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.slice(0, 5).map((player, idx) => (
                    <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono text-sm text-white/50">{idx + 1}</td>
                      <td className="py-4">
                        <Link to={`/players/${player.id}`} className="flex items-center gap-3 hover:text-emerald-400 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            {player.photo_url ? <img src={player.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-4 h-4 text-white/30" />}
                          </div>
                          <span className="font-semibold">{player.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 text-center font-mono text-sm">{player.played}</td>
                      <td className="py-4 text-center font-mono text-sm text-white/50">{player.gd > 0 ? `+${player.gd}` : player.gd}</td>
                      <td className="py-4 text-center font-bold text-emerald-400">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard>
              <SectionTitle title="Top Performers" subtitle="Best Wins" />
              <div className="space-y-4">
                {standings.sort((a, b) => b.won - a.won).slice(0, 5).map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-serif italic text-white/20 group-hover:text-emerald-400/50 transition-colors">0{idx + 1}</span>
                      <div>
                        <p className="font-bold leading-none">{player.name}</p>
                        <p className="text-xs text-white/40 mt-1">{player.gaming_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-mono font-bold">{player.won}</p>
                      <p className="text-[10px] uppercase tracking-tighter text-white/30">Wins</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-0 overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-700">
                <Trophy className="w-12 h-12 text-black/20 absolute -right-2 -top-2 rotate-12" />
                <h3 className="text-xl font-bold text-black">Hall of Fame</h3>
                <p className="text-black/60 text-sm">Previous Champions</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Badge variant="success">S1</Badge>
                    <span className="font-bold">Alex Hunter</span>
                  </div>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-center text-[10px] uppercase tracking-widest text-white/20 py-2">More coming soon</p>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Column: Next Match & Latest Result */}
        <div className="space-y-8">
          <GlassCard className="bg-gradient-to-br from-blue-600/20 to-emerald-500/20 border-emerald-500/30">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Next Match</span>
            </div>
            {nextMatch ? (
              <div className="text-center">
                <p className="text-xs text-white/40 mb-4">{format(new Date(nextMatch.match_date), 'PPP p')}</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full glass flex items-center justify-center overflow-hidden">
                      {nextMatch.player1_photo ? <img src={nextMatch.player1_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-8 h-8 text-white/20" />}
                    </div>
                    <p className="text-sm font-bold truncate w-full">{nextMatch.player1_name}</p>
                  </div>
                  <div className="text-2xl font-black text-white/20">VS</div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full glass flex items-center justify-center overflow-hidden">
                      {nextMatch.player2_photo ? <img src={nextMatch.player2_photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-8 h-8 text-white/20" />}
                    </div>
                    <p className="text-sm font-bold truncate w-full">{nextMatch.player2_name}</p>
                  </div>
                </div>
                <Link to="/fixtures" className="block w-full mt-8 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold transition-all text-center">
                  Match Details
                </Link>
              </div>
            ) : (
              <p className="text-white/40 text-center py-8">No upcoming matches</p>
            )}
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-white/50" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Latest Result</span>
            </div>
            {latestResult ? (
              <div className="text-center">
                <p className="text-xs text-white/40 mb-4">{format(new Date(latestResult.match_date), 'PPP')}</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold truncate">{latestResult.player1_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black">{latestResult.player1_score}</span>
                    <span className="text-xl text-white/20">-</span>
                    <span className="text-3xl font-black">{latestResult.player2_score}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold truncate">{latestResult.player2_name}</p>
                  </div>
                </div>
                <Link to="/results" className="block w-full mt-8 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold transition-all text-center">
                  All Results
                </Link>
              </div>
            ) : (
              <p className="text-white/40 text-center py-8">No results yet</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
