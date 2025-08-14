import { jsx, jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Gamepad2, TrendingUp, Zap, Heart, Coffee, Brain, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import useShopEffects from "@/hooks/useShopEffects";
const QuickActions = ({ onDailyGoal, onVybeStrike, onVybeTree }) => {
  const { rewardCoins, triggerConfetti, confettiEnabled } = useShopEffects();

  const quickEarnActions = [
    {
      icon: Heart,
      label: "Breathing",
      description: "2-min deep breath",
      onClick: async () => {
        await rewardCoins(1, "quick_breathing");
        if (confettiEnabled) triggerConfetti();
        toast.success("Deep breath completed • +1 coin");
      },
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Coffee,
      label: "Hydrate",
      description: "Drink water",
      onClick: async () => {
        await rewardCoins(1, "quick_hydrate");
        if (confettiEnabled) triggerConfetti();
        toast.success("Stay hydrated! • +1 coin");
      },
      gradient: "from-teal-500 to-green-500"
    },
    {
      icon: Zap,
      label: "Stretch",
      description: "Quick body stretch",
      onClick: async () => {
        await rewardCoins(1, "quick_stretch");
        if (confettiEnabled) triggerConfetti();
        toast.success("Body feels better! • +1 coin");
      },
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Brain,
      label: "Focus",
      description: "5-min task sprint",
      onClick: async () => {
        await rewardCoins(3, "quick_focus");
        if (confettiEnabled) triggerConfetti();
        toast.success("Focus session complete! • +3 coins");
      },
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const mainActions = [
    {
      icon: Target,
      label: "Daily Goal",
      description: "Set today's focus",
      onClick: onDailyGoal,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Gamepad2,
      label: "VybeStrike",
      description: "Level up challenge",
      onClick: onVybeStrike,
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      label: "VybeTree",
      description: "Check progress",
      onClick: onVybeTree,
      gradient: "from-orange-500 to-yellow-500"
    }
  ];
  return /* @__PURE__ */ jsxs(Card, { className: "vyral-card animate-slide-up", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold vyral-text-glow", children: "Quick Actions" }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }) })
    ] }),
    
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Earn Coins" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: quickEarnActions.map((action, index) => {
          const Icon = action.icon;
          return /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              className: "h-16 p-3 flex flex-col items-center gap-1 hover:bg-secondary/50 group transition-all duration-300 hover:scale-105",
              onClick: action.onClick,
              style: {
                animationDelay: `${index * 50}ms`
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: `p-1.5 rounded-md bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-200`, children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 text-white" }) }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-foreground", children: action.label }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: action.description })
                ] })
              ]
            },
            action.label
          );
        }) })
      ] }),
      
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Main Actions" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: mainActions.map((action, index) => {
          const Icon = action.icon;
          return /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              className: "h-20 p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 group transition-all duration-300 hover:scale-105",
              onClick: action.onClick,
              style: {
                animationDelay: `${index * 100 + 200}ms`
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-200`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-white" }) }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: action.label }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: action.description })
                ] })
              ]
            },
            action.label
          );
        }) })
      ] })
    ] })
  ] });
};
var QuickActions_default = QuickActions;
export {
  QuickActions_default as default
};
