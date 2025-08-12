import { jsx, jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Gamepad2, TrendingUp } from "lucide-react";
const QuickActions = ({ onDailyGoal, onVybeStrike, onVybeTree }) => {
  const actions = [
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
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: actions.map((action, index) => {
      const Icon = action.icon;
      return /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          className: "h-20 p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 group transition-all duration-300 hover:scale-105",
          onClick: action.onClick,
          style: {
            animationDelay: `${index * 100}ms`
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
  ] });
};
var QuickActions_default = QuickActions;
export {
  QuickActions_default as default
};
