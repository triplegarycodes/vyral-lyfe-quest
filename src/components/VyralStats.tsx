import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

const StatBar = ({ label, value, maxValue, color = "primary" }: StatBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{value}/{maxValue}</span>
      </div>
      <div className="vyral-stat-bar">
        <div 
          className="vyral-stat-fill transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const VyralStats = () => {
  const [stats, setStats] = useState({
    focus: 0,
    energy: 0,
    empathy: 0,
    confidence: 0,
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
        .select('focus_stat, energy_stat, empathy_stat, confidence_stat, level, total_xp')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setStats({
          focus: profile.focus_stat || 0,
          energy: profile.energy_stat || 0,
          empathy: profile.empathy_stat || 0,
          confidence: profile.confidence_stat || 0,
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
      <div className="space-y-4">
        <StatBar label="Focus" value={stats.focus} maxValue={100} />
        <StatBar label="Energy" value={stats.energy} maxValue={100} />
        <StatBar label="Empathy" value={stats.empathy} maxValue={100} />
        <StatBar label="Confidence" value={stats.confidence} maxValue={100} />
      </div>
    </Card>
  );
};

export default VyralStats;