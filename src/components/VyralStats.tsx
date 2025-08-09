import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
}

const StatBar = ({ label, value, maxValue }: StatBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm font-medium text-vy.neon mb-1">
        <span>{label}</span>
        <span>
          {value}/{maxValue}
        </span>
      </div>
      <div className="h-2 bg-vy.bg/40 rounded-full">
        <div
          className="h-full rounded-full bg-gradient-to-r from-vy.neon via-vy.pop to-vy.gold shadow-[0_0_6px_#41F3FF] transition-[width] duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const VyralStats = () => {
  const [stats, setStats] = useState({
    wCore: 50,
    mirrorMind: 50,
    realFeels: 50,
    vybeChek: 50,
    moralus: 50,
    comebackSeason: 50,
    clutchUp: 50,
    headSpace: 50,
    sceneSense: 50,
    level: 1,
    totalXp: 0
  });

  useEffect(() => {
    loadStats();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setStats({
          wCore: profile.w_core_stat || 50,
          mirrorMind: profile.mirror_mind_stat || 50,
          realFeels: profile.real_feels_stat || 50,
          vybeChek: profile.vybe_chek_stat || 50,
          moralus: profile.moralus_stat || 50,
          comebackSeason: profile.comeback_season_stat || 50,
          clutchUp: profile.clutch_up_stat || 50,
          headSpace: profile.head_space_stat || 50,
          sceneSense: profile.scene_sense_stat || 50,
          level: profile.level || 1,
          totalXp: profile.total_xp || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <Card className="vyral-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold vyral-text-glow">Your Vybe Stats</h3>
        <div className="text-sm text-muted-foreground">
          Level {stats.level} • {stats.totalXp} XP
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatBar label="W-Core" value={stats.wCore} maxValue={100} />
        <StatBar label="MirrorMind" value={stats.mirrorMind} maxValue={100} />
        <StatBar label="RealFeels" value={stats.realFeels} maxValue={100} />
        <StatBar label="VybeChek" value={stats.vybeChek} maxValue={100} />
        <StatBar label="Moralus" value={stats.moralus} maxValue={100} />
        <StatBar label="Comeback" value={stats.comebackSeason} maxValue={100} />
        <StatBar label="ClutchUp" value={stats.clutchUp} maxValue={100} />
        <StatBar label="HeadSpace" value={stats.headSpace} maxValue={100} />
        <StatBar label="SceneSense" value={stats.sceneSense} maxValue={100} />
      </div>
    </Card>
  );
};

export default VyralStats;