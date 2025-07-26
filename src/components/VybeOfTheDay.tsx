import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

const VybeOfTheDay = () => {
  const vybeQuotes = [
    "Your energy introduces you before you even speak ✨",
    "Level up your mindset, level up your life 🚀",
    "Small steps daily = massive changes yearly 💫",
    "Your vibe attracts your tribe 🌟",
    "Progress over perfection, always 🎯"
  ];

  const randomQuote = vybeQuotes[Math.floor(Math.random() * vybeQuotes.length)];

  return (
    <Card className="vyral-card animate-slide-up bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold vyral-text-glow flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent animate-glow-pulse" />
          Vybe of the Day
        </h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <blockquote className="text-foreground/90 italic text-center py-4 px-2 border-l-4 border-primary bg-card/50 rounded-r-lg">
        {randomQuote}
      </blockquote>
      
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
          Keep the vybe alive!
        </div>
      </div>
    </Card>
  );
};

export default VybeOfTheDay;