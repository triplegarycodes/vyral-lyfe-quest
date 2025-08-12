import { jsx, jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TreePine } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
const VybeTreeView = ({ onBack }) => {
  const [stats, setStats] = useState({
    w_core_stat: 50,
    mirror_mind_stat: 50,
    real_feels_stat: 50,
    vybe_chek_stat: 50,
    moralus_stat: 50,
    comeback_season_stat: 50,
    clutch_up_stat: 50,
    head_space_stat: 50,
    scene_sense_stat: 50,
    level: 1,
    total_xp: 0
  });
  useEffect(() => {
    loadStats();
    const channel = supabase.channel("profile-changes").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles" },
      () => loadStats()
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (profile) {
      setStats({
        w_core_stat: profile.w_core_stat || 50,
        mirror_mind_stat: profile.mirror_mind_stat || 50,
        real_feels_stat: profile.real_feels_stat || 50,
        vybe_chek_stat: profile.vybe_chek_stat || 50,
        moralus_stat: profile.moralus_stat || 50,
        comeback_season_stat: profile.comeback_season_stat || 50,
        clutch_up_stat: profile.clutch_up_stat || 50,
        head_space_stat: profile.head_space_stat || 50,
        scene_sense_stat: profile.scene_sense_stat || 50,
        level: profile.level || 1,
        total_xp: profile.total_xp || 0
      });
    }
  };
  const TreeNode = ({ label, value, x, y, color }) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "absolute transform -translate-x-1/2 -translate-y-1/2",
      style: { left: `${x}%`, top: `${y}%` },
      children: [
        /* @__PURE__ */ jsx("div", { className: `relative w-16 h-16 rounded-full ${color} flex items-center justify-center border-4 border-background shadow-lg`, children: /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-sm", children: value }) }),
        /* @__PURE__ */ jsx("div", { className: "text-center mt-2 text-xs font-medium text-foreground", children: label })
      ]
    }
  );
  const TreeBranch = ({ x1, y1, x2, y2 }) => /* @__PURE__ */ jsx(
    "svg",
    {
      className: "absolute inset-0 w-full h-full pointer-events-none",
      style: { zIndex: 0 },
      children: /* @__PURE__ */ jsx(
        "line",
        {
          x1: `${x1}%`,
          y1: `${y1}%`,
          x2: `${x2}%`,
          y2: `${y2}%`,
          stroke: "hsl(var(--border))",
          strokeWidth: "3",
          className: "opacity-60"
        }
      )
    }
  );
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
        /* @__PURE__ */ jsx(TreePine, { className: "w-6 h-6 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold vyral-text-glow", children: "VybeTree" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "vyral-card p-6 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-foreground", children: [
        "Level ",
        stats.level
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        stats.total_xp,
        " XP Total"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "vyral-card p-6 h-96 relative overflow-hidden mb-4", children: [
      /* @__PURE__ */ jsx(TreeBranch, { x1: 50, y1: 85, x2: 25, y2: 65 }),
      /* @__PURE__ */ jsx(TreeBranch, { x1: 50, y1: 85, x2: 75, y2: 65 }),
      /* @__PURE__ */ jsx(TreeBranch, { x1: 25, y1: 65, x2: 15, y2: 45 }),
      /* @__PURE__ */ jsx(TreeBranch, { x1: 25, y1: 65, x2: 35, y2: 45 }),
      /* @__PURE__ */ jsx(TreeBranch, { x1: 75, y1: 65, x2: 65, y2: 45 }),
      /* @__PURE__ */ jsx(TreeBranch, { x1: 75, y1: 65, x2: 85, y2: 45 }),
      /* @__PURE__ */ jsx(TreeBranch, { x1: 50, y1: 85, x2: 50, y2: 25 }),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "Level",
          value: stats.level,
          x: 50,
          y: 85,
          color: "bg-gradient-to-r from-purple-500 to-indigo-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "W-Core",
          value: stats.w_core_stat,
          x: 25,
          y: 65,
          color: "bg-gradient-to-r from-blue-500 to-cyan-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "Mirror",
          value: stats.mirror_mind_stat,
          x: 75,
          y: 65,
          color: "bg-gradient-to-r from-purple-500 to-pink-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "RealFeels",
          value: stats.real_feels_stat,
          x: 15,
          y: 45,
          color: "bg-gradient-to-r from-green-500 to-emerald-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "VybeChek",
          value: stats.vybe_chek_stat,
          x: 35,
          y: 45,
          color: "bg-gradient-to-r from-orange-500 to-red-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "ClutchUp",
          value: stats.clutch_up_stat,
          x: 65,
          y: 45,
          color: "bg-gradient-to-r from-yellow-500 to-orange-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "Comeback",
          value: stats.comeback_season_stat,
          x: 85,
          y: 45,
          color: "bg-gradient-to-r from-indigo-500 to-purple-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "Wisdom",
          value: Math.floor((stats.moralus_stat + stats.head_space_stat + stats.scene_sense_stat) / 3),
          x: 50,
          y: 25,
          color: "bg-gradient-to-r from-amber-500 to-yellow-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "Moralus",
          value: stats.moralus_stat,
          x: 25,
          y: 20,
          color: "bg-gradient-to-r from-rose-500 to-pink-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "HeadSpace",
          value: stats.head_space_stat,
          x: 50,
          y: 10,
          color: "bg-gradient-to-r from-teal-500 to-cyan-500"
        }
      ),
      /* @__PURE__ */ jsx(
        TreeNode,
        {
          label: "SceneSense",
          value: stats.scene_sense_stat,
          x: 75,
          y: 20,
          color: "bg-gradient-to-r from-violet-500 to-purple-500"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Your skills grow stronger as you navigate life's challenges" })
  ] }) });
};
var VybeTreeView_default = VybeTreeView;
export {
  VybeTreeView_default as default
};
