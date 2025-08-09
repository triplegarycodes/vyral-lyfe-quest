import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TreePine } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VybeTreeViewProps {
  onBack: () => void;
}

interface UserStats {
  w_core_stat: number;
  mirror_mind_stat: number;
  real_feels_stat: number;
  vybe_chek_stat: number;
  moralus_stat: number;
  comeback_season_stat: number;
  clutch_up_stat: number;
  head_space_stat: number;
  scene_sense_stat: number;
  level: number;
  total_xp: number;
}

const VybeTreeView = ({ onBack }: VybeTreeViewProps) => {
  const [stats, setStats] = useState<UserStats>({
    w_core_stat: 50,
    mirror_mind_stat: 50,
    real_feels_stat: 50,
    vybe_chek_stat: 50,
    moralus_stat: 50,
    comeback_season_stat: 50,
    clutch_up_stat: 50,
    head_space_stat: 50,
    scene_sense_stat: 50,
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
      .maybeSingle();

    if (profile) {
      setStats({
        w_core_stat: profile.w_core_stat || 50,
        mirror_mind_stat: profile.mirror_mind_stat || 50,
        real_feels_stat: profile.real_feels_stat || 50,
        vybe_chek_stat: profile.vybe_chek_stat || 50,
        moralus_stat: profile.moralus_stat || 50,
        comeback_season_stat: profile.comeback_season_stat || 50,
        clutch_up_stat: profile.clutch_up_stat || 50,
        head_space_stat: profile.head_space_stat || 50,
        scene_sense_stat: profile.scene_sense_stat || 50,
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

        <Card className="vyral-card p-6 h-96 relative overflow-hidden mb-4">
          {/* Tree branches */}
          <TreeBranch x1={50} y1={85} x2={25} y2={65} />
          <TreeBranch x1={50} y1={85} x2={75} y2={65} />
          <TreeBranch x1={25} y1={65} x2={15} y2={45} />
          <TreeBranch x1={25} y1={65} x2={35} y2={45} />
          <TreeBranch x1={75} y1={65} x2={65} y2={45} />
          <TreeBranch x1={75} y1={65} x2={85} y2={45} />
          <TreeBranch x1={50} y1={85} x2={50} y2={25} />

          {/* Root - Level */}
          <TreeNode 
            label="Level" 
            value={stats.level} 
            x={50} 
            y={85} 
            color="bg-gradient-to-r from-purple-500 to-indigo-500" 
          />

          {/* Core stats tier */}
          <TreeNode 
            label="W-Core" 
            value={stats.w_core_stat} 
            x={25} 
            y={65} 
            color="bg-gradient-to-r from-blue-500 to-cyan-500" 
          />
          <TreeNode 
            label="Mirror" 
            value={stats.mirror_mind_stat} 
            x={75} 
            y={65} 
            color="bg-gradient-to-r from-purple-500 to-pink-500" 
          />

          {/* Emotional stats */}
          <TreeNode 
            label="RealFeels" 
            value={stats.real_feels_stat} 
            x={15} 
            y={45} 
            color="bg-gradient-to-r from-green-500 to-emerald-500" 
          />
          <TreeNode 
            label="VybeChek" 
            value={stats.vybe_chek_stat} 
            x={35} 
            y={45} 
            color="bg-gradient-to-r from-orange-500 to-red-500" 
          />

          {/* Action stats */}
          <TreeNode 
            label="ClutchUp" 
            value={stats.clutch_up_stat} 
            x={65} 
            y={45} 
            color="bg-gradient-to-r from-yellow-500 to-orange-500" 
          />
          <TreeNode 
            label="Comeback" 
            value={stats.comeback_season_stat} 
            x={85} 
            y={45} 
            color="bg-gradient-to-r from-indigo-500 to-purple-500" 
          />

          {/* Top tier - Wisdom */}
          <TreeNode 
            label="Wisdom" 
            value={Math.floor((stats.moralus_stat + stats.head_space_stat + stats.scene_sense_stat) / 3)} 
            x={50} 
            y={25} 
            color="bg-gradient-to-r from-amber-500 to-yellow-500" 
          />

          {/* Floating wisdom stats */}
          <TreeNode 
            label="Moralus" 
            value={stats.moralus_stat} 
            x={25} 
            y={20} 
            color="bg-gradient-to-r from-rose-500 to-pink-500" 
          />
          <TreeNode 
            label="HeadSpace" 
            value={stats.head_space_stat} 
            x={50} 
            y={10} 
            color="bg-gradient-to-r from-teal-500 to-cyan-500" 
          />
          <TreeNode 
            label="SceneSense" 
            value={stats.scene_sense_stat} 
            x={75} 
            y={20} 
            color="bg-gradient-to-r from-violet-500 to-purple-500" 
          />
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Your skills grow stronger as you navigate life's challenges
        </div>
      </div>
    </div>
  );
};

export default VybeTreeView;