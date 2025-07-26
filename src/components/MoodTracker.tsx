import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Brain, Smile, Meh, Frown } from "lucide-react";
import { useState } from "react";

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  
  const moods = [
    { id: "amazing", icon: Smile, label: "Amazing", color: "text-green-400" },
    { id: "good", icon: Heart, label: "Good", color: "text-blue-400" },
    { id: "okay", icon: Meh, label: "Okay", color: "text-yellow-400" },
    { id: "low", icon: Frown, label: "Low", color: "text-orange-400" },
    { id: "stressed", icon: Zap, label: "Stressed", color: "text-red-400" },
  ];

  const weekData = [
    { day: "Mon", mood: "good" },
    { day: "Tue", mood: "amazing" },
    { day: "Wed", mood: "okay" },
    { day: "Thu", mood: "good" },
    { day: "Fri", mood: "amazing" },
    { day: "Sat", mood: "good" },
    { day: "Sun", mood: "" }, // Today
  ];

  return (
    <Card className="vyral-card animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold vyral-text-glow">Mood Check</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col gap-1 h-16 ${
                    selectedMood === mood.id 
                      ? "vyral-button-primary" 
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <Icon className={`w-5 h-5 ${mood.color}`} />
                  <span className="text-xs">{mood.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">This week's vybe:</p>
          <div className="flex justify-between items-end h-16 bg-card/50 rounded-lg p-2">
            {weekData.map((day, index) => {
              const mood = moods.find(m => m.id === day.mood);
              const height = day.mood ? 
                (day.mood === "amazing" ? "h-12" : 
                 day.mood === "good" ? "h-8" : 
                 day.mood === "okay" ? "h-6" : "h-4") : "h-2";
              
              return (
                <div key={day.day} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-3 rounded-sm transition-all duration-300 ${height} ${
                      day.mood ? "bg-gradient-to-t from-primary to-primary-glow" : "bg-border"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MoodTracker;