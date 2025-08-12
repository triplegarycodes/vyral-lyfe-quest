import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Palette, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useShopEffects from "@/hooks/useShopEffects";
const predefinedSchemes = [
  {
    name: "Vyral Blue",
    primary: "200 100% 50%",
    accent: "270 100% 60%",
    primaryGlow: "180 100% 60%"
  },
  {
    name: "Neon Green",
    primary: "120 100% 50%",
    accent: "90 100% 60%",
    primaryGlow: "140 100% 60%"
  },
  {
    name: "Cyber Purple",
    primary: "270 100% 60%",
    accent: "300 100% 70%",
    primaryGlow: "240 100% 70%"
  },
  {
    name: "Electric Pink",
    primary: "320 100% 60%",
    accent: "340 100% 70%",
    primaryGlow: "300 100% 70%"
  }
];
const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScheme, setCurrentScheme] = useState(predefinedSchemes[0]);
  const [customHue, setCustomHue] = useState([200]);
  const shop = useShopEffects();
  useEffect(() => {
    loadPreferences();
  }, [shop.fontPlayfair]);
  const savePreference = async (theme) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_preferences").upsert({ user_id: user.id, theme_gradient: theme }, { onConflict: "user_id" });
  };
  const applyColorScheme = async (scheme, themeName = scheme.name) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", scheme.primary);
    root.style.setProperty("--accent", scheme.accent);
    root.style.setProperty("--primary-glow", scheme.primaryGlow);
    const h2 = parseInt(scheme.primary.split(" ")[0]);
    const h3 = (h2 - 20 + 360) % 360;
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, hsl(${scheme.primaryGlow}), hsl(${scheme.primary}), hsl(${h3} 100% 45%))`
    );
    root.style.setProperty(
      "--gradient-accent",
      `linear-gradient(135deg, hsl(${scheme.accent}), hsl(${(parseInt(scheme.accent.split(" ")[0]) + 10) % 360} 100% 50%))`
    );
    setCurrentScheme(scheme);
    await savePreference(themeName);
    if (shop.fontPlayfair) document.body.classList.add("font-playfair");
    else document.body.classList.remove("font-playfair");
  };
  const applyCustomHue = async (hue) => {
    const customScheme = {
      name: "Custom",
      primary: `${hue} 100% 50%`,
      accent: `${(hue + 70) % 360} 100% 60%`,
      primaryGlow: `${(hue - 20 + 360) % 360} 100% 60%`
    };
    await applyColorScheme(customScheme, `custom:${hue}`);
  };
  const resetToDefault = async () => {
    await applyColorScheme(predefinedSchemes[0]);
    setCustomHue([200]);
  };
  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_preferences").select("theme_gradient").eq("user_id", user.id).maybeSingle();
    const theme = data?.theme_gradient;
    if (theme) {
      if (theme.startsWith("custom:")) {
        const hue = parseInt(theme.split(":")[1], 10);
        setCustomHue([hue]);
        await applyCustomHue(hue);
      } else {
        const scheme = predefinedSchemes.find((s) => s.name === theme);
        if (scheme) {
          await applyColorScheme(scheme);
        }
      }
    }
  };
  if (!isOpen) {
    return /* @__PURE__ */ jsx(
      Button,
      {
        onClick: () => setIsOpen(true),
        variant: "ghost",
        size: "sm",
        className: "fixed bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card",
        children: /* @__PURE__ */ jsx(Palette, { className: "w-4 h-4" })
      }
    );
  }
  return /* @__PURE__ */ jsxs(Card, { className: "fixed bottom-4 right-4 w-80 vyral-card z-50", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold vyral-text-glow flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Palette, { className: "w-5 h-5 text-accent" }),
        "Theme Customizer"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsOpen(false), children: "\xD7" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Preset Schemes" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: predefinedSchemes.map((scheme) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: currentScheme.name === scheme.name ? "default" : "outline",
            size: "sm",
            onClick: () => applyColorScheme(scheme),
            className: "text-xs h-8",
            children: scheme.name
          },
          scheme.name
        )) })
      ] }),
      shop.unlockedThemeNames.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Unlocked Themes" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: shop.unlockedThemeNames.map((name) => {
          const extra = {
            "Neon Night": { name: "Neon Night", primary: "200 100% 50%", accent: "320 100% 60%", primaryGlow: "180 100% 60%" },
            "Aurora Beam": { name: "Aurora Beam", primary: "160 100% 50%", accent: "220 100% 60%", primaryGlow: "140 100% 60%" },
            "Retro Wave": { name: "Retro Wave", primary: "290 80% 60%", accent: "340 90% 60%", primaryGlow: "260 80% 65%" },
            "Sunset 84": { name: "Sunset 84", primary: "20 90% 55%", accent: "320 80% 60%", primaryGlow: "40 90% 60%" }
          };
          const scheme = extra[name] || predefinedSchemes[0];
          return /* @__PURE__ */ jsx(
            Button,
            {
              variant: currentScheme.name === name ? "default" : "outline",
              size: "sm",
              onClick: () => applyColorScheme(scheme),
              className: "text-xs h-8",
              children: name
            },
            name
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { className: "text-sm font-medium mb-3 block", children: [
          "Custom Hue: ",
          customHue[0],
          "\xB0"
        ] }),
        /* @__PURE__ */ jsx(
          Slider,
          {
            value: customHue,
            onValueChange: (value) => {
              setCustomHue(value);
              applyCustomHue(value[0]);
            },
            max: 360,
            step: 1,
            className: "w-full"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-4 rounded mt-2 border border-border/50",
            style: {
              background: `linear-gradient(90deg, ${Array.from(
                { length: 36 },
                (_, i) => `hsl(${i * 10} 100% 50%)`
              ).join(", ")})`
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: resetToDefault,
          variant: "outline",
          size: "sm",
          className: "w-full",
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4 mr-2" }),
            "Reset to Default"
          ]
        }
      )
    ] })
  ] });
};
var ThemeCustomizer_default = ThemeCustomizer;
export {
  ThemeCustomizer_default as default
};
