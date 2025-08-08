import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, TreePine, Target } from "lucide-react";

interface GameNavigationProps {
  currentGame: 'vybestryke' | 'vybetree' | 'lyfegoals' | null;
  onGameChange: (game: 'vybestryke' | 'vybetree' | 'lyfegoals' | null) => void;
}

const GameNavigation = ({ currentGame, onGameChange }: GameNavigationProps) => {
  const games = [
    {
      id: 'vybestryke' as const,
      label: 'VybeStryke',
      description: 'Test your decisions',
      icon: Gamepad2,
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'vybetree' as const,
      label: 'VybeTree',
      description: 'Grow your skills',
      icon: TreePine,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'lyfegoals' as const,
      label: 'LyfeGoals',
      description: 'Achieve greatness',
      icon: Target,
      gradient: 'from-blue-500 to-purple-500'
    }
  ];

  if (!currentGame) return null;

  return (
    <Card className="vyral-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold vyral-text-glow">Games</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onGameChange(null)}
          className="text-muted-foreground hover:text-primary"
        >
          Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {games.map((game) => {
          const Icon = game.icon;
          const isActive = currentGame === game.id;
          
          return (
            <Button
              key={game.id}
              variant="ghost"
              onClick={() => onGameChange(game.id)}
              className={`h-16 p-4 flex items-center gap-4 hover:bg-secondary/50 group transition-all duration-300 hover:scale-105 ${
                isActive ? "bg-primary/10 border border-primary/20" : ""
              }`}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${game.gradient} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-foreground">{game.label}</div>
                <div className="text-xs text-muted-foreground">{game.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default GameNavigation;