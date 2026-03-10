import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassCard, SectionTitle, Badge } from '../components/UI';
import { Users, Trophy, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { Player, Match } from '../types';
import { format } from 'date-fns';

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const playerRes = await fetch(`/api/players/${id}`);
        const playerData = await playerRes.json();
        setPlayer(playerData);
        setMatches(playerData.matches || []);
      } catch (error) {
        console.error("Error fetching player profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerData();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-white/40">Loading player profile...</div>;
  if (!player) return <div className="py-20 text-center text-white/40">Player not found.</div>;

  const stats = {
    played: matches.length,
    won: matches.filter(m => {
      if (m.player1_id === player.id) return m.player1_score > m.player2_score;
      return m.player2_score > m.player1_score;
    }).length,
    lost: matches.filter(m => {
      if (m.player1_id === player.id) return m.player1_score < m.player2_score;
      return m.player2_score < m.player1_score;
    }).length,
    drawn: matches.filter(m => m.player1_score === m.player2_score).length,
    gf: matches.reduce((acc, m) => acc + (m.player1_id === player.id ? m.player1_score : m.player2_score), 0),
    ga: matches.reduce((acc, m) => acc + (m.player1_id === player.id ? m.player2_score : m.player1_score), 0),
  };

  return (
    <div className="space-y-8 pb-12">
      <Link to="/players" className="inline-flex items-center gap-2 text-white/40 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Players
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Header */}
        <div className="lg:col-span-1 space-y-8">
          <GlassCard className="text-center">
            <div className="w-32 h-32 rounded-full glass mx-auto mb-6 p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                {player.photo_url ? (
                  <img src={player.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Users className="w-16 h-16 text-white/20" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
            <p className="text-emerald-400 font-mono tracking-widest uppercase text-sm mb-6">{player.gaming_id}</p>
            
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-2xl font-black">{stats.played}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Played</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">{stats.won}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Wins</p>
              </div>
              <div>
                <p className="text-2xl font-black text-red-400">{stats.lost}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Losses</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle title="Performance" subtitle="Goal Statistics" />
            <div className="space-y-6 mt-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/40">Goals Scored</span>
                  <span className="font-bold">{stats.gf}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.gf / (stats.gf + stats.ga || 1)) * 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/40">Goals Conceded</span>
                  <span className="font-bold">{stats.ga}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats.ga / (stats.gf + stats.ga || 1)) * 100)}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm text-white/40">Goal Difference</span>
                <span className={`text-xl font-black ${stats.gf - stats.ga >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.gf - stats.ga > 0 ? `+${stats.gf - stats.ga}` : stats.gf - stats.ga}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Match History */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <SectionTitle title="Match History" subtitle="Recent Results" />
            <div className="space-y-4 mt-8">
              {matches.length > 0 ? matches.map((match) => {
                const isPlayer1 = match.player1_id === player.id;
                const opponentName = isPlayer1 ? match.player2_name : match.player1_name;
                const opponentPhoto = isPlayer1 ? match.player2_photo : match.player1_photo;
                const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
                const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
                const result = playerScore > opponentScore ? 'W' : playerScore < opponentScore ? 'L' : 'D';

                return (
                  <div key={match.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        result === 'W' ? 'bg-emerald-500 text-black' : 
                        result === 'L' ? 'bg-red-500 text-white' : 
                        'bg-white/20 text-white'
                      }`}>
                        {result}
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">{format(new Date(match.match_date), 'PPP')}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">vs {opponentName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-2xl font-black">{playerScore} - {opponentScore}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full glass overflow-hidden hidden sm:block">
                        {opponentPhoto ? <img src={opponentPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-5 h-5 text-white/20 m-2.5" />}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-12 text-center text-white/20">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No matches played yet.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
