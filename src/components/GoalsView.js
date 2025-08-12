import { jsx, jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Trophy, Star, Zap } from "lucide-react";
import VybeStryks from "./VybeStrykes";
import { useState } from "react";
const GoalsView = ({ onBack }) => {
  const [showGame, setShowGame] = useState(false);
  if (showGame) {
    return /* @__PURE__ */ jsx(VybeStryks, { onBack: () => setShowGame(false) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-background to-muted/30 p-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: onBack,
          className: "p-2",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Target, { className: "w-6 h-6 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold vyral-text-glow", children: "Goals & Challenges" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "vyral-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500", children: /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "VybeStryks" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Test your decision-making skills" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => setShowGame(true),
            className: "w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white",
            children: "Play VybeStryks"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "vyral-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500", children: /* @__PURE__ */ jsx(Trophy, { className: "w-6 h-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Daily Challenges" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Complete tasks to earn XP" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-muted/50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Track your mood today" }),
            /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-yellow-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-muted/50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Add a sticky note" }),
            /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-yellow-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-muted/50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Complete a VybeStryk" }),
            /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-yellow-500" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "vyral-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500", children: /* @__PURE__ */ jsx(Target, { className: "w-6 h-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Personal Goals" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Set and track your objectives" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Target, { className: "w-12 h-12 mx-auto mb-4 opacity-50" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Goal tracking coming soon!" })
        ] })
      ] })
    ] })
  ] }) });
};
var GoalsView_default = GoalsView;
export {
  GoalsView_default as default
};
