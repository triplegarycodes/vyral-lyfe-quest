import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Coins, Sparkles, Bolt, Percent, Palette, Type, Grid3X3, Dice5, BarChart2, Tags, Sunrise } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useShopEffects from "@/hooks/useShopEffects";
const ITEMS = [
  { sku: "xp_boost_24h", title: "XP Boost (24h)", description: "2\xD7 XP from games and actions for 24 hours.", price: 100, icon: Bolt, durationHours: 24 },
  { sku: "coin_boost_24h", title: "Coin Boost (24h)", description: "+50% VybeCoins earned for 24 hours.", price: 120, icon: Percent, durationHours: 24 },
  { sku: "confetti_pack_30d", title: "Confetti Pack (30d)", description: "Celebrate wins with animated confetti.", price: 80, icon: Sparkles, durationHours: 24 * 30 },
  { sku: "theme_neon_pack", title: "Neon Theme Pack", description: "Unlock Neon Night + Aurora Beam themes.", price: 150, icon: Palette },
  { sku: "font_playfair_pack", title: "Playfair Font Pack", description: "Unlock elegant Playfair Display font.", price: 50, icon: Type },
  { sku: "sticky_snap_tool", title: "Sticky Snap Tool", description: "Snap Lyfeboard notes to a clean grid.", price: 60, icon: Grid3X3 },
  { sku: "quick_roller_plus", title: "Quick Roller+", description: "Better VybeStrike quick scenario roller.", price: 70, icon: Dice5 },
  { sku: "mood_insights_pro", title: "Mood Insights Pro", description: "Extra trends and insights in Mood.", price: 90, icon: BarChart2 },
  { sku: "vshop_discount_7d", title: "V\u2011Shop Discount (7d)", description: "10% off all shop items for a week.", price: 100, icon: Tags, durationHours: 24 * 7 },
  { sku: "theme_retro_pack", title: "Retro Theme Pack", description: "Unlock Retro Wave + Sunset 84 themes.", price: 120, icon: Sunrise }
];
const VShop = () => {
  const { balance, discountFactor, hasPurchase, refresh, triggerConfetti } = useShopEffects();
  const [purchasing, setPurchasing] = useState(null);
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "V-Shop \u2022 VybeCoin Shop | Vyral";
    const desc = "V-Shop: Spend VybeCoins on boosts, cosmetics, and themes.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
    return () => {
      document.title = prevTitle;
    };
  }, []);
  const buy = async (item) => {
    try {
      setPurchasing(item.sku);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in");
        return;
      }
      if (hasPurchase(item.sku)) {
        toast("Already owned");
        return;
      }
      const price = Math.round(item.price * discountFactor());
      const { data: profile } = await supabase.from("profiles").select("vybecoin_balance").eq("user_id", user.id).maybeSingle();
      const current = profile?.vybecoin_balance ?? 0;
      if (current < price) {
        toast.error("Not enough coins");
        return;
      }
      const expires_at = item.durationHours ? new Date(Date.now() + item.durationHours * 36e5).toISOString() : null;
      const { error: pErr } = await supabase.from("user_purchases").insert({ user_id: user.id, sku: item.sku, active: true, metadata: { price_paid: price }, expires_at });
      if (pErr) {
        toast.error("Purchase failed");
        return;
      }
      const { error: cErr } = await supabase.from("coin_transactions").insert({ user_id: user.id, amount: -price, reason: `purchase:${item.sku}` });
      if (cErr) {
        toast.error("Charge failed");
        return;
      }
      await supabase.from("profiles").update({ vybecoin_balance: current - price }).eq("user_id", user.id);
      triggerConfetti();
      toast.success(`Purchased ${item.title}!`);
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setPurchasing(null);
    }
  };
  return /* @__PURE__ */ jsx("section", { "aria-labelledby": "vshop-heading", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-border/60 bg-card/60 backdrop-blur-sm", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(CardTitle, { id: "vshop-heading", className: "text-xl", children: "V-Shop" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-muted-foreground", children: "Spend VybeCoins on boosts, cosmetics, and themes." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Coins, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: balance })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: ITEMS.map((item) => {
        const Icon = item.icon;
        const owned = hasPurchase(item.sku);
        const price = Math.round(item.price * discountFactor());
        return /* @__PURE__ */ jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 text-primary" }),
                /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: item.title })
              ] }),
              item.durationHours && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                Math.round(item.durationHours / 24),
                "d"
              ] })
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: item.description })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Coins, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsx("span", { children: price })
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => buy(item), disabled: owned || purchasing === item.sku, children: owned ? "Owned" : purchasing === item.sku ? "Buying\u2026" : "Buy" })
          ] })
        ] }, item.sku);
      }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Discount applies automatically if you own the V\u2011Shop Discount." })
    ] })
  ] }) });
};
var VShop_default = VShop;
export {
  VShop_default as default
};
