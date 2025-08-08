import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TreePine } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VybeTreeViewProps {
  onBack: () => void;
}

interface UserStats {
  focus_stat: number;
  energy_stat: number;
  empathy_stat: number;
  confidence_stat: number;
  level: number;
  total_xp: number;
}

const VybeTreeView = ({ onBack }: VybeTreeViewProps) => {
  const [stats, setStats] = useState<UserStats>({
    focus_stat: 0,
    energy_stat: 0,
    empathy_stat: 0,
    confidence_stat: 0,
    level: 1,
    total_xp: 0
  });

  useEffect(() => {
    loadStats();
    
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      setStats({
        focus_stat: profile.focus_stat || 0,
        energy_stat: profile.energy_stat || 0,
        empathy_stat: profile.empathy_stat || 0,
        confidence_stat: profile.confidence_stat || 0,
        level: profile.level || 1,
        total_xp: profile.total_xp || 0
      });
    }
  };

  const TreeNode = ({ label, value, x, y, color }: { label: string; value: number; x: number; y: number; color: string }) => (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={`relative w-16 h-16 rounded-full ${color} flex items-center justify-center border-4 border-background shadow-lg`}>
        <span className="text-white font-bold text-sm">{value}</span>
      </div>
      <div className="text-center mt-2 text-xs font-medium text-foreground">{label}</div>
    </div>
  );

  const TreeBranch = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        stroke="hsl(var(--border))"
        strokeWidth="3"
        className="opacity-60"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold vyral-text-glow">VybeTree</h1>
          </div>
        </div>

        <Card className="vyral-card p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Level {stats.level}</h2>
            <p className="text-sm text-muted-foreground">{stats.total_xp} XP Total</p>
          </div>
        </Card>

        <Card className="vyral-card p-6 h-96 relative overflow-hidden">
          {/* Tree branches */}
          <TreeBranch x1={50} y1={85} x2={30} y2={65} />
          <TreeBranch x1={50} y1={85} x2={70} y2={65} />
          <TreeBranch x1={30} y1={65} x2={50} y2={45} />
          <TreeBranch x1={70} y1={65} x2={50} y2={45} />
          <TreeBranch x1={50} y1={45} x2={50} y2={25} />

          {/* Root - Level */}
          <TreeNode 
            label="Level" 
            value={stats.level} 
            x={50} 
            y={85} 
            color="bg-gradient-to-r from-purple-500 to-indigo-500" 
          />

          {/* First tier - Energy & Focus */}
          <TreeNode 
            label="Energy" 
            value={stats.energy_stat} 
            x={30} 
            y={65} 
            color="bg-gradient-to-r from-orange-500 to-red-500" 
          />
          <TreeNode 
            label="Focus" 
            value={stats.focus_stat} 
            x={70} 
            y={65} 
            color="bg-gradient-to-r from-blue-500 to-cyan-500" 
          />

          {/* Second tier - Combined growth */}
          <TreeNode 
            label="Growth" 
            value={Math.floor((stats.energy_stat + stats.focus_stat) / 2)} 
            x={50} 
            y={45} 
            color="bg-gradient-to-r from-green-500 to-emerald-500" 
          />

          {/* Top tier - Empathy & Confidence */}
          <TreeNode 
            label="Wisdom" 
            value={Math.floor((stats.empathy_stat + stats.confidence_stat) / 2)} 
            x={50} 
            y={25} 
            color="bg-gradient-to-r from-yellow-500 to-orange-500" 
          />

          {/* Floating stats */}
          <TreeNode 
            label="Empathy" 
            value={stats.empathy_stat} 
            x={20} 
            y={30} 
            color="bg-gradient-to-r from-pink-500 to-rose-500" 
          />
          <TreeNode 
            label="Confidence" 
            value={stats.confidence_stat} 
            x={80} 
            y={30} 
            color="bg-gradient-to-r from-violet-500 to-purple-500" 
          />
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Your skills grow stronger as you progress through your journey
        </div>
      </div>
    </div>
  );
};

export default VybeTreeView;