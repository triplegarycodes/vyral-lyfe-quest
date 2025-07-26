import VyralStats from "@/components/VyralStats";
import VybeOfTheDay from "@/components/VybeOfTheDay";
import MoodTracker from "@/components/MoodTracker";
import QuickActions from "@/components/QuickActions";
import Lyfeboard from "@/components/Lyfeboard";
import { Button } from "@/components/ui/button";
import { Zap, User, Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold vyral-text-glow">Vyral</h1>
                <p className="text-xs text-muted-foreground">Level up in life, make it vyral</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
                <span className="text-muted-foreground">Level 3</span>
                <span className="text-primary font-medium">1,247 XP</span>
              </div>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Lyfeboard />
            <VybeOfTheDay />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <VyralStats />
            <MoodTracker />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
