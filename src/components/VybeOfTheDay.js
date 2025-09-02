import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Wand2, Star } from "lucide-react";
import { toast } from "sonner";
import useShopEffects from "@/hooks/useShopEffects";

const VybeOfTheDay = () => {
  const [currentQuote, setCurrentQuote] = useState("Your energy introduces you before you even speak ✨");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReflected, setIsReflected] = useState(false);
  
  const { rewardCoins, triggerConfetti, confettiEnabled } = useShopEffects();
  
  useEffect(() => {
    const today = new Date().toDateString();
    const hasReflected = localStorage.getItem(`vybeReflection_${today}`);
    setIsReflected(!!hasReflected);
  }, []);

  const vybeQuotes = [
    "Your energy introduces you before you even speak ✨",
    "Level up your mindset, level up your life 🚀",
    "Small steps daily = massive changes yearly 💫",
    "Your vibe attracts your tribe 🌟",
    "Progress over perfection, always 🎯",
    "Be the main character in your own story 🎬",
    "Consistency beats perfection every time ⚡",
    "Your future self will thank you for starting today 🌟",
    "Growth happens outside your comfort zone 🚀",
    "Discipline is freedom in disguise 💎"
  ];

  const getRandomQuote = () => {
    const randomQuote = vybeQuotes[Math.floor(Math.random() * vybeQuotes.length)];
    setCurrentQuote(randomQuote);
  };

  const generateAIQuote = async () => {
    setIsGenerating(true);
    try {
      const aiQuotes = [
        "Transform obstacles into stepping stones for greatness ⚡",
        "Your potential is infinite, your excuses are limited 🌟",
        "Every master was once a beginner who refused to quit 💫",
        "Success whispers to those who dare to listen 🚀",
        "Your comeback story starts with your next decision ✨",
        "Champions are made in the moments no one is watching 🏆",
        "Embrace the grind, celebrate the shine 💎",
        "Your mindset is your superpower, use it wisely 🧠",
        "Excellence isn't a skill, it's an attitude 🎯",
        "Dream big, work smart, stay humble 🌈"
      ];
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const aiQuote = aiQuotes[Math.floor(Math.random() * aiQuotes.length)];
      setCurrentQuote(aiQuote);
      toast.success("New AI-generated vybe created!");
    } catch (error) {
      toast.error("Failed to generate new vybe");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReflect = async () => {
    if (isReflected) {
      toast.success("Already reflected today!");
      return;
    }

    setIsReflected(true);
    const today = new Date().toDateString();
    localStorage.setItem(`vybeReflection_${today}`, "true");
    
    await rewardCoins(3, "daily_reflection");
    if (confettiEnabled) triggerConfetti();
    toast.success("Reflection complete • +3 coins");
  };

  return jsxs(Card, { className: "vyral-card animate-slide-up bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30", children: [
    jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      jsxs("h3", { className: "text-lg font-semibold vyral-text-glow flex items-center gap-2", children: [
        jsx(Sparkles, { className: "w-5 h-5 text-accent animate-glow-pulse" }),
        "Vybe of the Day"
      ] }),
      jsxs("div", { className: "flex gap-2", children: [
        jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground hover:text-accent",
            onClick: getRandomQuote,
            children: jsx(RefreshCw, { className: "w-4 h-4" })
          }
        ),
        jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground hover:text-primary",
            onClick: generateAIQuote,
            disabled: isGenerating,
            children: jsx(Wand2, { className: `w-4 h-4 ${isGenerating ? "animate-spin" : ""}` })
          }
        )
      ] })
    ] }),
    jsx("blockquote", { className: "text-foreground/90 italic text-center py-4 px-2 border-l-4 border-primary bg-card/50 rounded-r-lg transition-all duration-300", children: currentQuote }),
    jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
      jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted-foreground", children: [
        jsx("div", { className: "w-2 h-2 bg-primary rounded-full animate-glow-pulse" }),
        "Reflect to earn coins!"
      ] }),
      jsx(Button, { size: "sm", onClick: handleReflect, disabled: isReflected, className: isReflected ? "vyral-button-secondary" : "vyral-button-primary", children: jsxs("span", { className: "flex items-center gap-1", children: [
        jsx(Star, { className: "w-4 h-4" }),
        isReflected ? "Reflected" : "Reflect"
      ] }) })
    ] })
  ] });
};

export default VybeOfTheDay;