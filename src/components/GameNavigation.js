import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, TreePine, Target } from "lucide-react";
const GameNavigation = ({ currentGame, onGameChange }) => {
  const games = [
    {
      id: "vybestryke",
      label: "VybeStryke",
      description: "Test your decisions",
      icon: Gamepad2,
      gradient: "from-red-500 to-orange-500"
    },
    {
      id: "vybetree",
      label: "VybeTree",
      description: "Grow your skills",
      icon: TreePine,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "lyfegoals",
      label: "LyfeGoals",
      description: "Achieve greatness",
      icon: Target,
      gradient: "from-blue-500 to-purple-500"
    }
  ];
  if (!currentGame) return null;
  return /* @__PURE__ */ jsxs(Card, { className: "vyral-card animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold vyral-text-glow", children: "Games" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => onGameChange(null),
          className: "text-muted-foreground hover:text-primary",
          children: "Back"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: games.map((game) => {
      const Icon = game.icon;
      const isActive = currentGame === game.id;
      return /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => onGameChange(game.id),
          className: `h-16 p-4 flex items-center gap-4 hover:bg-secondary/50 group transition-all duration-300 hover:scale-105 ${isActive ? "bg-primary/10 border border-primary/20" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg bg-gradient-to-r ${game.gradient} group-hover:scale-110 transition-transform duration-200`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-left flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: game.label }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: game.description })
            ] })
          ]
        },
        game.id
      );
    }) })
  ] });
};
var GameNavigation_default = GameNavigation;
export {
  GameNavigation_default as default
};
