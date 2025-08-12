import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import VyralStats from "@/components/VyralStats";
import VybeOfTheDay from "@/components/VybeOfTheDay";
import MoodTracker from "@/components/MoodTracker";
import QuickActions from "@/components/QuickActions";
import Lyfeboard from "@/components/Lyfeboard";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import SignInScreen from "@/components/SignInScreen";
import VentingScreen from "@/components/VentingScreen";
import SocialScreen from "@/components/SocialScreen";
import BottomNavigation from "@/components/BottomNavigation";
import LoadingScreen from "@/components/LoadingScreen";
import GameNavigation from "@/components/GameNavigation";
import VybeStryks from "@/components/VybeStrykes";
import VybeTreeView from "@/components/VybeTreeView";
import GoalsView from "@/components/GoalsView";
import VShop from "@/components/VShop";
import { Button } from "@/components/ui/button";
import { Zap, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const Index = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [currentGame, setCurrentGame] = useState(null);
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2e3);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session2) => {
        setSession(session2);
        setUser(session2?.user ?? null);
        setLoading(false);
      }
    );
    supabase.auth.getSession().then(({ data: { session: session2 } }) => {
      setSession(session2);
      setUser(session2?.user ?? null);
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimer);
    };
  }, []);
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
        setCurrentView("dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };
  useEffect(() => {
    document.title = "Vyral \u2022 Level up your day";
    const desc = "Vyral: a playful, productivity\u2011meets\u2011wellness toolkit for students.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);
  if (loading || showLoadingScreen) {
    return /* @__PURE__ */ jsx(LoadingScreen, {});
  }
  if (!user || !session) {
    return /* @__PURE__ */ jsx(SignInScreen, { onSignIn: () => {
    } });
  }
  const renderContent = () => {
    if (currentView === "venting") {
      return /* @__PURE__ */ jsx(VentingScreen, {});
    }
    if (currentView === "social") {
      return /* @__PURE__ */ jsx(SocialScreen, {});
    }
    if (currentView === "vybestryke") {
      return /* @__PURE__ */ jsx(GoalsView, { onBack: () => setCurrentView("dashboard") });
    }
    if (currentView === "vybetree") {
      return /* @__PURE__ */ jsx(VybeTreeView, { onBack: () => setCurrentView("dashboard") });
    }
    if (currentView === "vshop") {
      return /* @__PURE__ */ jsx(VShop, {});
    }
    if (currentGame === "vybestryke") {
      return /* @__PURE__ */ jsx(VybeStryks, { onBack: () => setCurrentGame(null) });
    }
    if (currentGame === "vybetree") {
      return /* @__PURE__ */ jsxs("div", { className: "vyral-card text-center p-8", children: [
        /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4", children: "\u{1F333}" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "VybeTree" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Coming Soon! Track your growth and achievements." }),
        /* @__PURE__ */ jsx(Button, { onClick: () => setCurrentGame(null), className: "vyral-button-primary", children: "Back to Dashboard" })
      ] });
    }
    if (currentGame === "lyfegoals") {
      return /* @__PURE__ */ jsxs("div", { className: "vyral-card text-center p-8", children: [
        /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4", children: "\u{1F3AF}" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "LyfeGoals" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Coming Soon! Set and achieve your life goals." }),
        /* @__PURE__ */ jsx(Button, { onClick: () => setCurrentGame(null), className: "vyral-button-primary", children: "Back to Dashboard" })
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: "0.1s" }, children: /* @__PURE__ */ jsx(Lyfeboard, {}) }),
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: "0.2s" }, children: /* @__PURE__ */ jsx(VybeOfTheDay, {}) }),
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: "0.25s" }, children: /* @__PURE__ */ jsx(GameNavigation, { currentGame, onGameChange: setCurrentGame }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: "0.3s" }, children: /* @__PURE__ */ jsx(VyralStats, {}) }),
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: "0.4s" }, children: /* @__PURE__ */ jsx(MoodTracker, {}) }),
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: "0.5s" }, children: /* @__PURE__ */ jsx(
          QuickActions,
          {
            onDailyGoal: () => setCurrentView("vybestryke"),
            onVybeStrike: () => setCurrentGame("vybestryke"),
            onVybeTree: () => setCurrentView("vybetree")
          }
        ) })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background pb-20", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center animate-glow-pulse hover:animate-wiggle transition-all duration-300", children: /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold vyral-text-glow hover:scale-105 transition-transform duration-300 cursor-default", children: "Vyral" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Level up in life, make it vyral" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary rounded-full animate-glow-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Level 3" }),
          /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "1,247 XP" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", title: user.email || "", children: /* @__PURE__ */ jsx(UserIcon, { className: "w-4 h-4" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-4 py-6", children: renderContent() }),
    /* @__PURE__ */ jsx(
      BottomNavigation,
      {
        currentView,
        onViewChange: setCurrentView,
        onSignOut: handleSignOut
      }
    ),
    /* @__PURE__ */ jsx(ThemeCustomizer, {})
  ] });
};
var Index_default = Index;
export {
  Index_default as default
};
