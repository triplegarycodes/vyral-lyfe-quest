import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center animate-float">
            <Zap className="w-12 h-12 text-white animate-glow-pulse" />
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -left-2 w-3 h-3 bg-primary/30 rounded-full animate-bounce delay-100" />
          <div className="absolute -top-1 -right-3 w-2 h-2 bg-secondary/40 rounded-full animate-bounce delay-300" />
          <div className="absolute -bottom-2 left-2 w-2 h-2 bg-accent/50 rounded-full animate-bounce delay-500" />
        </div>

        {/* App Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold vyral-text-glow bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Vyral
          </h1>
          <p className="text-muted-foreground animate-slide-up">
            Level up in life, make it vyral
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto space-y-3">
          <div className="vyral-stat-bar h-3 bg-muted">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {progress < 100 ? `Loading... ${progress}%` : "Ready to level up!"}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;