import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Trophy, Star, Zap } from "lucide-react";
import VybeStryks from "./VybeStrykes";
import { useState } from "react";

interface GoalsViewProps {
  onBack: () => void;
}

const GoalsView = ({ onBack }: GoalsViewProps) => {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return <VybeStryks onBack={() => setShowGame(false)} />;
  }

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
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold vyral-text-glow">Goals & Challenges</h1>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="vyral-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">VybeStryks</h2>
                <p className="text-sm text-muted-foreground">Test your decision-making skills</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowGame(true)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Play VybeStryks
            </Button>
          </Card>

          <Card className="vyral-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Daily Challenges</h2>
                <p className="text-sm text-muted-foreground">Complete tasks to earn XP</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm">Track your mood today</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm">Add a sticky note</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm">Complete a VybeStryk</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="vyral-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Personal Goals</h2>
                <p className="text-sm text-muted-foreground">Set and track your objectives</p>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Goal tracking coming soon!</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoalsView;