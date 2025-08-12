import { jsx, jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Brain, Smile, Meh, Frown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useShopEffects from "@/hooks/useShopEffects";
const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [weekData, setWeekData] = useState([]);
  const moods = [
    { id: "amazing", icon: Smile, label: "Amazing", color: "text-green-400" },
    { id: "good", icon: Heart, label: "Good", color: "text-blue-400" },
    { id: "okay", icon: Meh, label: "Okay", color: "text-yellow-400" },
    { id: "low", icon: Frown, label: "Low", color: "text-orange-400" },
    { id: "stressed", icon: Zap, label: "Stressed", color: "text-red-400" }
  ];
  useEffect(() => {
    loadMoodData();
  }, []);
  const loadMoodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = /* @__PURE__ */ new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
      });
      const start = dates[0].toISOString().split("T")[0];
      const end = dates[6].toISOString().split("T")[0];
      const { data, error } = await supabase.from("mood_entries").select("mood, date").eq("user_id", user.id).gte("date", start).lte("date", end);
      if (error) {
        console.error("Error loading moods:", error);
        return;
      }
      const map = /* @__PURE__ */ new Map();
      data?.forEach((entry) => {
        map.set(entry.date, entry.mood);
      });
      setWeekData(
        dates.map((d) => ({
          day: d.toLocaleDateString(void 0, { weekday: "short" }).slice(0, 3),
          mood: map.get(d.toISOString().split("T")[0]) || ""
        }))
      );
      setSelectedMood(map.get(end) || "");
    } catch (error) {
      console.error("Error fetching mood data:", error);
    }
  };
  const handleMoodSelect = async (moodId) => {
    setSelectedMood(moodId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await supabase.from("mood_entries").delete().eq("user_id", user.id).eq("date", today);
      const { error } = await supabase.from("mood_entries").insert({ user_id: user.id, mood: moodId, date: today });
      if (error) {
        toast.error("Failed to save mood");
        return;
      }
      const { rewardCoins, triggerConfetti, confettiEnabled, moodInsightsPro } = useShopEffects();
      await rewardCoins(5, "mood_checkin");
      if (confettiEnabled) triggerConfetti();
      if (moodInsightsPro) {
        toast.success("Mood saved \u2022 +5 coins \u2022 Insights updated");
      } else {
        toast.success("Mood saved \u2022 +5 coins");
      }
      loadMoodData();
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "vyral-card animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-primary" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold vyral-text-glow", children: "Mood Check" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "How are you feeling today?" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: moods.map((mood) => {
          const Icon = mood.icon;
          return /* @__PURE__ */ jsxs(
            Button,
            {
              variant: selectedMood === mood.id ? "default" : "ghost",
              size: "sm",
              className: `flex flex-col gap-1 h-16 ${selectedMood === mood.id ? "vyral-button-primary" : "hover:bg-secondary/50"}`,
              onClick: () => handleMoodSelect(mood.id),
              children: [
                /* @__PURE__ */ jsx(Icon, { className: `w-5 h-5 ${mood.color}` }),
                /* @__PURE__ */ jsx("span", { className: "text-xs", children: mood.label })
              ]
            },
            mood.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "This week's vybe:" }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-between items-end h-16 bg-card/50 rounded-lg p-2", children: weekData.map((day, index) => {
          const mood = moods.find((m) => m.id === day.mood);
          const height = day.mood ? day.mood === "amazing" ? "h-12" : day.mood === "good" ? "h-8" : day.mood === "okay" ? "h-6" : "h-4" : "h-2";
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `w-3 rounded-sm transition-all duration-300 ${height} ${day.mood ? "bg-gradient-to-t from-primary to-primary-glow" : "bg-border"}`
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: day.day })
          ] }, day.day);
        }) })
      ] })
    ] })
  ] });
};
var MoodTracker_default = MoodTracker;
export {
  MoodTracker_default as default
};
