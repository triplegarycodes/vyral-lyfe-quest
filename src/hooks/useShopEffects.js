import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
const isActive = (p) => !p.expires_at || new Date(p.expires_at).getTime() > Date.now();
const useShopEffects = () => {
  const [purchases, setPurchases] = useState([]);
  const [balance, setBalance] = useState(0);
  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: pro }, { data: purch }] = await Promise.all([
      supabase.from("profiles").select("vybecoin_balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_purchases").select("id, sku, created_at, expires_at, active, metadata").eq("user_id", user.id)
    ]);
    setBalance(pro?.vybecoin_balance ?? 0);
    setPurchases((purch || []).filter(isActive));
  }, []);
  useEffect(() => {
    refresh();
    const ch1 = supabase.channel("profiles_balance").on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, refresh).subscribe();
    const ch2 = supabase.channel("user_purchases_updates").on("postgres_changes", { event: "INSERT", schema: "public", table: "user_purchases" }, refresh).subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [refresh]);
  const hasPurchase = useCallback((sku) => purchases.some((p) => p.sku === sku && isActive(p)), [purchases]);
  const xpMultiplier = useCallback(() => hasPurchase("xp_boost_24h") ? 2 : 1, [hasPurchase]);
  const coinMultiplier = useCallback(() => hasPurchase("coin_boost_24h") ? 1.5 : 1, [hasPurchase]);
  const discountFactor = useCallback(() => hasPurchase("vshop_discount_7d") ? 0.9 : 1, [hasPurchase]);
  const stickySnapEnabled = hasPurchase("sticky_snap_tool");
  const confettiEnabled = hasPurchase("confetti_pack_30d");
  const quickRollerPlus = hasPurchase("quick_roller_plus");
  const moodInsightsPro = hasPurchase("mood_insights_pro");
  const themeNeon = hasPurchase("theme_neon_pack");
  const themeRetro = hasPurchase("theme_retro_pack");
  const fontPlayfair = hasPurchase("font_playfair_pack");
  const triggerConfetti = useCallback(() => {
    if (!confettiEnabled) return;
    confetti({
      particleCount: 140,
      spread: 70,
      angle: 60,
      origin: { x: 0, y: 0.9 },
      colors: ["#6EE7F9", "#A78BFA", "#F472B6", "#FBBF24"]
    });
    confetti({
      particleCount: 140,
      spread: 70,
      angle: 120,
      origin: { x: 1, y: 0.9 },
      colors: ["#6EE7F9", "#A78BFA", "#F472B6", "#FBBF24"]
    });
  }, [confettiEnabled]);
  const rewardCoins = useCallback(async (baseAmount, reason) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "no-user" };
    const amount = Math.round(baseAmount * coinMultiplier());
    const { error } = await supabase.from("coin_transactions").insert({ user_id: user.id, amount, reason });
    if (!error) refresh();
    return { error: error?.message };
  }, [coinMultiplier, refresh]);
  const unlockedThemeNames = useMemo(() => {
    const list = [];
    if (themeNeon) list.push("Neon Night", "Aurora Beam");
    if (themeRetro) list.push("Retro Wave", "Sunset 84");
    return list;
  }, [themeNeon, themeRetro]);
  return {
    purchases,
    balance,
    refresh,
    hasPurchase,
    xpMultiplier,
    coinMultiplier,
    discountFactor,
    stickySnapEnabled,
    confettiEnabled,
    quickRollerPlus,
    moodInsightsPro,
    fontPlayfair,
    unlockedThemeNames,
    triggerConfetti,
    rewardCoins
  };
};
var useShopEffects_default = useShopEffects;
export {
  useShopEffects_default as default
};
