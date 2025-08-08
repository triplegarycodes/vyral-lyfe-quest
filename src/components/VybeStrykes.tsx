import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Scenario {
  id: number;
  title: string;
  description: string;
  choices: string[];
  correctChoice: number;
  statImpacts: {
    focus: number;
    energy: number;
    empathy: number;
    confidence: number;
  };
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Late Night Loop",
    description: "It's midnight. You're doom-scrolling instead of sleeping. A test is tomorrow.",
    choices: [
      "Keep scrolling, you can't sleep anyway",
      "Put phone away and try meditation",
      "Study for the test instead",
      "Text friends about tomorrow"
    ],
    correctChoice: 1,
    statImpacts: { focus: 5, energy: -5, empathy: 0, confidence: 5 }
  },
  {
    id: 2,
    title: "Pop Quiz Panic",
    description: "You're hit with a surprise quiz in your hardest class. You only studied for a different subject.",
    choices: [
      "Panic and leave the quiz blank",
      "Try your best with what you know",
      "Look at your neighbor's paper",
      "Ask the teacher for extra time"
    ],
    correctChoice: 1,
    statImpacts: { focus: 10, energy: 0, empathy: 0, confidence: 10 }
  },
  {
    id: 3,
    title: "Group Chat Blowup",
    description: "Your group chat is imploding with drama and your name gets mentioned.",
    choices: [
      "Jump in and defend yourself",
      "Leave the group chat",
      "Address it privately with individuals",
      "Screenshot everything for evidence"
    ],
    correctChoice: 2,
    statImpacts: { focus: 5, energy: 0, empathy: 10, confidence: 5 }
  }
];

interface VybeStryksProps {
  onBack: () => void;
}

const VybeStryks = ({ onBack }: VybeStryksProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [characterReaction, setCharacterReaction] = useState("");
  const { toast } = useToast();

  const scenario = scenarios[currentScenario];

  const updateStats = async (impacts: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            focus_stat: Math.max(0, Math.min(100, (profile.focus_stat || 0) + impacts.focus)),
            energy_stat: Math.max(0, Math.min(100, (profile.energy_stat || 0) + impacts.energy)),
            empathy_stat: Math.max(0, Math.min(100, (profile.empathy_stat || 0) + impacts.empathy)),
            confidence_stat: Math.max(0, Math.min(100, (profile.confidence_stat || 0) + impacts.confidence)),
            total_xp: (profile.total_xp || 0) + 10
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const handleChoice = async (choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
    
    const isCorrect = choiceIndex === scenario.correctChoice;
    const impacts = isCorrect ? scenario.statImpacts : {
      focus: Math.floor(scenario.statImpacts.focus / 2),
      energy: Math.floor(scenario.statImpacts.energy / 2),
      empathy: Math.floor(scenario.statImpacts.empathy / 2),
      confidence: Math.floor(scenario.statImpacts.confidence / 2)
    };

    if (isCorrect) {
      setScore(score + 1);
      setCharacterReaction("Great choice! You're learning to handle life's challenges! 🌟");
    } else {
      setCharacterReaction("That's okay, we all make mistakes. Every choice is a learning opportunity! 💫");
    }

    await updateStats(impacts);

    toast({
      title: isCorrect ? "Excellent Choice!" : "Learning Moment",
      description: isCorrect ? "Your stats have improved!" : "Keep trying, you'll get better!",
    });

    setTimeout(() => {
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setSelectedChoice(null);
        setCharacterReaction("");
      } else {
        setGameComplete(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setSelectedChoice(null);
    setScore(0);
    setGameComplete(false);
    setCharacterReaction("");
  };

  if (gameComplete) {
    return (
      <Card className="vyral-card animate-fade-in text-center p-8">
        <div className="space-y-6">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold vyral-text-glow">Game Complete!</h2>
          <p className="text-lg">You scored {score} out of {scenarios.length}</p>
          <div className="space-y-3">
            <Button onClick={resetGame} className="vyral-button-primary">
              Play Again
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back to Games
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="vyral-card animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold vyral-text-glow">VybeStryks</h2>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Scenario {currentScenario + 1} of {scenarios.length}
            </span>
            <Progress value={(currentScenario / scenarios.length) * 100} className="flex-1" />
            <span className="text-sm font-medium">Score: {score}</span>
          </div>

          <div className="text-center space-y-4">
            <div className="text-4xl animate-float">🧠</div>
            {characterReaction && (
              <div className="p-4 bg-primary/10 rounded-lg animate-bounce-in">
                <p className="text-sm italic">{characterReaction}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center" style={{ fontFamily: 'serif' }}>
              {scenario.title}
            </h3>
            <p className="text-center text-muted-foreground" style={{ fontFamily: 'serif' }}>
              {scenario.description}
            </p>

            <div className="grid gap-3">
              {scenario.choices.map((choice, index) => (
                <Button
                  key={index}
                  variant={selectedChoice === index ? 
                    (index === scenario.correctChoice ? "default" : "destructive") : 
                    "outline"
                  }
                  onClick={() => handleChoice(index)}
                  disabled={selectedChoice !== null}
                  className="h-auto p-4 text-left justify-start whitespace-normal hover:scale-105 transition-all duration-200"
                >
                  <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                  {choice}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VybeStryks;