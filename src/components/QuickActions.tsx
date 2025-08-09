import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Gamepad2, TrendingUp } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Target,
      label: "Daily Goal",
      description: "Set today's focus",
      onClick: () => console.log("Goal")
    },
    {
      icon: Gamepad2,
      label: "VybeStrike",
      description: "Level up challenge",
      onClick: () => console.log("Game")
    },
    {
      icon: TrendingUp,
      label: "VybeTree",
      description: "Check progress",
      onClick: () => console.log("Tree")
    }
  ];

  return (
    <Card className="vyral-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold vyral-text-glow">Quick Actions</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              className="h-20 p-4 flex flex-col items-center gap-2 bg-gradient-to-br from-vy.pop to-vy.neon rounded-2xl shadow-lg text-vy.ink transform transition-transform duration-300 hover:rotate-2 hover:scale-105 hover:shadow-xl"
              onClick={action.onClick}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <Icon className="w-5 h-5" />
              <div className="text-center">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;