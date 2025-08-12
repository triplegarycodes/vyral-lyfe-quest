import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
const StatBar = ({ label, value, maxValue, color = "primary" }) => {
  const percentage = Math.min(value / maxValue * 100, 100);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
        value,
        "/",
        maxValue
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "vyral-stat-bar", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "vyral-stat-fill transition-all duration-300 ease-out",
        style: { width: `${percentage}%` }
      }
    ) })
  ] });
};
const VyralStats = () => {
  const [stats, setStats] = useState({
    wCore: 50,
    mirrorMind: 50,
    realFeels: 50,
    vybeChek: 50,
    moralus: 50,
    comebackSeason: 50,
    clutchUp: 50,
    headSpace: 50,
    sceneSense: 50,
    level: 1,
    totalXp: 0
  });
  useEffect(() => {
    loadStats();
    const channel = supabase.channel("profile_changes").on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles"
      },
      () => {
        loadStats();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (profile) {
        setStats({
          wCore: profile.w_core_stat || 50,
          mirrorMind: profile.mirror_mind_stat || 50,
          realFeels: profile.real_feels_stat || 50,
          vybeChek: profile.vybe_chek_stat || 50,
          moralus: profile.moralus_stat || 50,
          comebackSeason: profile.comeback_season_stat || 50,
          clutchUp: profile.clutch_up_stat || 50,
          headSpace: profile.head_space_stat || 50,
          sceneSense: profile.scene_sense_stat || 50,
          level: profile.level || 1,
          totalXp: profile.total_xp || 0
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "vyral-card animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold vyral-text-glow", children: "Your Vybe Stats" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Level ",
        stats.level,
        " \u2022 ",
        stats.totalXp,
        " XP"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsx(StatBar, { label: "W-Core", value: stats.wCore, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "MirrorMind", value: stats.mirrorMind, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "RealFeels", value: stats.realFeels, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "VybeChek", value: stats.vybeChek, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "Moralus", value: stats.moralus, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "Comeback", value: stats.comebackSeason, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "ClutchUp", value: stats.clutchUp, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "HeadSpace", value: stats.headSpace, maxValue: 100 }),
      /* @__PURE__ */ jsx(StatBar, { label: "SceneSense", value: stats.sceneSense, maxValue: 100 })
    ] })
  ] });
};
var VyralStats_default = VyralStats;
export {
  VyralStats_default as default
};
