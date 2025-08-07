import { Button } from "@/components/ui/button";
import { Home, Heart, Users, LogOut } from "lucide-react";

interface BottomNavigationProps {
  currentView: 'dashboard' | 'venting' | 'social';
  onViewChange: (view: 'dashboard' | 'venting' | 'social') => void;
  onSignOut: () => void;
}

const BottomNavigation = ({ currentView, onViewChange, onSignOut }: BottomNavigationProps) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'venting' as const, label: 'Venting', icon: Heart },
    { id: 'social' as const, label: 'Social', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive 
                  ? "text-primary bg-primary/10 animate-bounce-in" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 hover:scale-105 hover:animate-wiggle"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;