import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, BookOpen, Gamepad2, TrendingUp } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Target,
      label: "Daily Goal",
      description: "Set today's focus",
      onClick: () => console.log("Goal"),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Gamepad2,
      label: "VybeStrike",
      description: "Level up challenge",
      onClick: () => console.log("Game"),
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      label: "VybeTree",
      description: "Check progress",
      onClick: () => console.log("Tree"),
      gradient: "from-orange-500 to-yellow-500"
    },
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
              className="h-20 p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 group transition-all duration-300 hover:scale-105"
              onClick={action.onClick}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;