import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";
const VybeOfTheDay = () => {
  const [currentQuote, setCurrentQuote] = useState("Your energy introduces you before you even speak \u2728");
  const [isGenerating, setIsGenerating] = useState(false);
  const vybeQuotes = [
    "Your energy introduces you before you even speak \u2728",
    "Level up your mindset, level up your life \u{1F680}",
    "Small steps daily = massive changes yearly \u{1F4AB}",
    "Your vibe attracts your tribe \u{1F31F}",
    "Progress over perfection, always \u{1F3AF}",
    "Be the main character in your own story \u{1F3AC}",
    "Consistency beats perfection every time \u26A1",
    "Your future self will thank you for starting today \u{1F31F}",
    "Growth happens outside your comfort zone \u{1F680}",
    "Discipline is freedom in disguise \u{1F48E}"
  ];
  const getRandomQuote = () => {
    const randomQuote = vybeQuotes[Math.floor(Math.random() * vybeQuotes.length)];
    setCurrentQuote(randomQuote);
  };
  const generateAIQuote = async () => {
    setIsGenerating(true);
    try {
      const aiQuotes = [
        "Transform obstacles into stepping stones for greatness \u26A1",
        "Your potential is infinite, your excuses are limited \u{1F31F}",
        "Every master was once a beginner who refused to quit \u{1F4AB}",
        "Success whispers to those who dare to listen \u{1F680}",
        "Your comeback story starts with your next decision \u2728",
        "Champions are made in the moments no one is watching \u{1F3C6}",
        "Embrace the grind, celebrate the shine \u{1F48E}",
        "Your mindset is your superpower, use it wisely \u{1F9E0}",
        "Excellence isn't a skill, it's an attitude \u{1F3AF}",
        "Dream big, work smart, stay humble \u{1F308}"
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
  return /* @__PURE__ */ jsxs(Card, { className: "vyral-card animate-slide-up bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold vyral-text-glow flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-accent animate-glow-pulse" }),
        "Vybe of the Day"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground hover:text-accent",
            onClick: getRandomQuote,
            children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground hover:text-primary",
            onClick: generateAIQuote,
            disabled: isGenerating,
            children: /* @__PURE__ */ jsx(Wand2, { className: `w-4 h-4 ${isGenerating ? "animate-spin" : ""}` })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("blockquote", { className: "text-foreground/90 italic text-center py-4 px-2 border-l-4 border-primary bg-card/50 rounded-r-lg transition-all duration-300", children: currentQuote }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary rounded-full animate-glow-pulse" }),
      "Keep the vybe alive!"
    ] }) })
  ] });
};
var VybeOfTheDay_default = VybeOfTheDay;
export {
  VybeOfTheDay_default as default
};
