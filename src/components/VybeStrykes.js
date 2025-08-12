import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useShopEffects from "@/hooks/useShopEffects";
const scenarios = [
  {
    id: 1,
    title: "Late Night Loop",
    description: "It's midnight. You're doom-scrolling instead of sleeping. A test is tomorrow.",
    choices: [
      "Keep scrolling, you can't sleep anyway",
      "Put phone down and try some breathing exercises",
      "Get up and review notes for 20 mins max",
      "Text your study group for last-minute help"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -10, mirrorMind: 0, realFeels: -5, vybeChek: -5, moralus: -5, comebackSeason: 0, clutchUp: 15, headSpace: 5, sceneSense: 10 }
  },
  {
    id: 2,
    title: "Pop Quiz Panic",
    description: "You're hit with a surprise quiz in your hardest class. You only studied for a different subject.",
    choices: [
      "Panic and leave half the quiz blank",
      "Take a deep breath and write what you know",
      "Try to peek at someone else's answers",
      "Ask to use the bathroom and Google stuff"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -5, mirrorMind: -10, realFeels: 0, vybeChek: -5, moralus: -5, comebackSeason: 0, clutchUp: 10, headSpace: 15, sceneSense: 5 }
  },
  {
    id: 3,
    title: "Mind Blank During Presentation",
    description: "You're mid-sentence in front of the class and suddenly forget everything.",
    choices: [
      "Freeze up and stand there awkwardly",
      "Say 'let me gather my thoughts' and take a moment",
      "Make a joke about blanking out",
      "Pretend you're done and sit down"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -5, mirrorMind: -5, realFeels: -5, vybeChek: -5, moralus: -5, comebackSeason: -10, clutchUp: 10, headSpace: 10, sceneSense: 10 }
  },
  {
    id: 4,
    title: "The Misread Text",
    description: "You text someone a joke. They misinterpret it and get upset.",
    choices: [
      "Double down and say they're being too sensitive",
      "Immediately apologize and explain what you meant",
      "Leave them on read until they get over it",
      "Send a bunch of crying laughing emojis"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -10, mirrorMind: -5, realFeels: -10, vybeChek: 15, moralus: 5, comebackSeason: 10, clutchUp: -10, headSpace: -5, sceneSense: -10 }
  },
  {
    id: 5,
    title: "Group Chat Blowup",
    description: "Your group chat is imploding with drama and your name gets mentioned.",
    choices: [
      "Jump in swinging and defend yourself",
      "Mute the chat and deal with it later",
      "DM the people involved privately",
      "Screenshot everything for receipts"
    ],
    correctChoice: 2,
    statImpacts: { wCore: -5, mirrorMind: -5, realFeels: -5, vybeChek: -10, moralus: -5, comebackSeason: -10, clutchUp: 10, headSpace: 10, sceneSense: 10 }
  },
  {
    id: 6,
    title: "They Ghosted You",
    description: "A close friend stops talking to you with no explanation.",
    choices: [
      "Spam them with 'why are you ignoring me' texts",
      "Give them space and check in once genuinely",
      "Talk to mutual friends to find out what's up",
      "Post subliminal stories about fake friends"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -5, mirrorMind: -10, realFeels: -5, vybeChek: 15, moralus: 10, comebackSeason: 10, clutchUp: -5, headSpace: -5, sceneSense: -5 }
  },
  {
    id: 7,
    title: "Too Fast, Too Soon",
    description: "Someone you like starts pushing you to open up fast emotionally or physically.",
    choices: [
      "Go along with it so they don't lose interest",
      "Be honest about wanting to take things slower",
      "Ghost them because it's too awkward to discuss",
      "Make excuses but don't directly address it"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -10, mirrorMind: -5, realFeels: -10, vybeChek: 5, moralus: 5, comebackSeason: 10, clutchUp: -10, headSpace: -5, sceneSense: -10 }
  },
  {
    id: 8,
    title: "Caught Between Two Crushes",
    description: "You're vibing with two different people at the same time.",
    choices: [
      "Keep both options open and see what happens",
      "Be upfront with both about the situation",
      "Pick one and cut contact with the other",
      "String them both along until you decide"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -5, mirrorMind: -5, realFeels: -5, vybeChek: -10, moralus: -5, comebackSeason: -10, clutchUp: 10, headSpace: 10, sceneSense: 15 }
  },
  {
    id: 9,
    title: "Breakup in Public",
    description: "Someone breaks up with you in front of people at lunch.",
    choices: [
      "Cause a scene and yell at them",
      "Keep your composure and ask to talk privately",
      "Walk away without saying anything",
      "Cry right there in front of everyone"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -5, mirrorMind: -15, realFeels: -5, vybeChek: 10, moralus: 15, comebackSeason: 5, clutchUp: -5, headSpace: -5, sceneSense: -5 }
  },
  {
    id: 10,
    title: "Everyone Else Got In",
    description: "You're the only one who didn't make the team or club.",
    choices: [
      "Trash talk the team/club to make yourself feel better",
      "Congratulate your friends and find other opportunities",
      "Isolate yourself because it's too embarrassing",
      "Demand to know why you weren't chosen"
    ],
    correctChoice: 1,
    statImpacts: { wCore: -5, mirrorMind: -5, realFeels: -10, vybeChek: 5, moralus: 10, comebackSeason: 10, clutchUp: -10, headSpace: -5, sceneSense: -15 }
  }
];
const VybeStryks = ({ onBack }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [characterReaction, setCharacterReaction] = useState("");
  const { toast } = useToast();
  const shop = useShopEffects();
  const [quickScenarios, setQuickScenarios] = useState([
    "2\u2011minute deep breath, then organize your backpack for tomorrow.",
    "15 pushups or 1 minute plank. Right now. No vibe\u2011checking, just do.",
    "Write the title + first sentence of your AP Lang essay.",
    "Drink a full glass of water and stretch your calves for 60 seconds.",
    "Text a friend \u201Cgym tomorrow?\u201D and set a 7:00 pm reminder.",
    "Open Spotify, start your \u201Cfocus\u201D playlist, 10\u2011minute Spanish on Duolingo.",
    "Skim Civics notes and make 1 flashcard (just one).",
    "Delete 10 photos you don\u2019t need. Digital spring clean.",
    "Go for a 5\u2011minute walk loop. Phone stays in pocket.",
    "Tidy your desk surface. 120 seconds. Beat the clock."
  ]);
  const [currentQuick, setCurrentQuick] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const LEX = {
    hardBlock: [
      "suicide",
      "self harm",
      "self-harm",
      "kill",
      "murder",
      "sexual assault",
      "assault",
      "rape",
      "porn",
      "nude",
      "slur",
      "racist",
      "homophobic",
      "transphobic",
      "kys",
      "die",
      "overdose",
      "nsfw"
    ],
    pg13: [
      "alcohol",
      "drunk",
      "vape",
      "nicotine",
      "drug",
      "weapon",
      "violence",
      "blood",
      "gore",
      "threat",
      "curse",
      "swear"
    ],
    mild: [
      "dang",
      "heck",
      "stupid",
      "hate"
    ]
  };
  const L33T = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };
  function normalize(s) {
    return s.toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[0-9@!$]/g, (ch) => L33T[ch] || ch).replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function classify(text) {
    const n = normalize(text);
    if (!n) return { level: "none", label: "\u2014", pill: "", emoji: "\u2014" };
    const hit = (arr) => arr.find((w) => new RegExp(`(^| )${w}( |$)`).test(n));
    if (hit(LEX.hardBlock)) return { level: "block", label: "Safety: low", pill: "warn", emoji: "\u26D4" };
    if (hit(LEX.pg13)) return { level: "pg13", label: "Safety: caution", pill: "pg13", emoji: "\u{1F7E0} PG\u201113" };
    if (hit(LEX.mild)) return { level: "pg", label: "Safety: good", pill: "pg", emoji: "\u{1F7E2} PG" };
    if (n.split(" ").length > 30) return { level: "pg13", label: "Safety: caution (long)", pill: "pg13", emoji: "\u{1F7E0} PG\u201113" };
    return { level: "pg", label: "Safety: good", pill: "pg", emoji: "\u{1F7E2} PG" };
  }
  const CLEAN_MAP = /* @__PURE__ */ new Map([
    ["kill", "eliminate"],
    ["weapon", "gear"],
    ["drug", "caffeine"],
    ["alcohol", "sparkling juice"],
    ["vape", "deep breath"],
    ["nicotine", "peppermint"],
    ["violence", "competition"],
    ["blood", "sweat"],
    ["gore", "mud"],
    ["threat", "challenge"],
    ["suicide", "quit\u2011thoughts"],
    ["self harm", "self\u2011doubt"],
    ["porn", "pop culture"],
    ["nude", "art"],
    ["slur", "trash talk"]
  ]);
  function suggestCleanRewrite(text) {
    let n = normalize(text);
    [...LEX.hardBlock, ...LEX.pg13].forEach((w) => {
      const safe = CLEAN_MAP.get(w) || "\u2014";
      n = n.replace(new RegExp(`(^| )${w}( |$)`, "g"), (m, a, b) => `${a}${safe}${b}`);
    });
    if (n && !/[.!?]$/.test(n)) n += ".";
    return n.charAt(0).toUpperCase() + n.slice(1);
  }
  const rollQuick = () => {
    const i = Math.floor(Math.random() * quickScenarios.length);
    setCurrentQuick(quickScenarios[i]);
  };
  const markQuickDone = () => {
    if (!currentQuick) {
      toast({ title: "Roll a scenario first!" });
    } else {
      toast({ title: "Nice. +1 micro\u2011win." });
    }
  };
  useEffect(() => {
    const SHEET_ID = "1-Wki-ElEbMIW75FupThB55nsg_SkhfSqYyxK0biw4lw";
    const GID = "369807428";
    async function fetchSheetScenarios() {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;
        const res = await fetch(url, { mode: "cors" });
        const text = await res.text();
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return;
        const json = JSON.parse(match[0]);
        const rows = json.table.rows || [];
        const list = rows.map((r) => (r.c?.[0]?.v || "").toString().trim()).filter(Boolean).filter((s) => classify(s).level !== "block");
        if (list.length) {
          setQuickScenarios((prev) => {
            const set = new Set(prev);
            let changed = false;
            list.forEach((s) => {
              if (!set.has(s)) {
                set.add(s);
                changed = true;
              }
            });
            return changed ? Array.from(set) : prev;
          });
          toast({ title: `Loaded ${list.length} scenarios from sheet.` });
        }
      } catch (err) {
        console.warn("Sheet fetch failed", err);
      }
    }
    fetchSheetScenarios();
  }, []);
  const scenario = scenarios[currentScenario];
  const updateStats = async (impacts) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (profile) {
        const xpAdd = Math.round(10 * shop.xpMultiplier());
        await supabase.from("profiles").update({
          w_core_stat: Math.max(0, Math.min(100, (profile.w_core_stat || 50) + impacts.wCore)),
          mirror_mind_stat: Math.max(0, Math.min(100, (profile.mirror_mind_stat || 50) + impacts.mirrorMind)),
          real_feels_stat: Math.max(0, Math.min(100, (profile.real_feels_stat || 50) + impacts.realFeels)),
          vybe_chek_stat: Math.max(0, Math.min(100, (profile.vybe_chek_stat || 50) + impacts.vybeChek)),
          moralus_stat: Math.max(0, Math.min(100, (profile.moralus_stat || 50) + impacts.moralus)),
          comeback_season_stat: Math.max(0, Math.min(100, (profile.comeback_season_stat || 50) + impacts.comebackSeason)),
          clutch_up_stat: Math.max(0, Math.min(100, (profile.clutch_up_stat || 50) + impacts.clutchUp)),
          head_space_stat: Math.max(0, Math.min(100, (profile.head_space_stat || 50) + impacts.headSpace)),
          scene_sense_stat: Math.max(0, Math.min(100, (profile.scene_sense_stat || 50) + impacts.sceneSense)),
          total_xp: (profile.total_xp || 0) + xpAdd
        }).eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };
  const handleChoice = async (choiceIndex) => {
    setSelectedChoice(choiceIndex);
    const isCorrect = choiceIndex === scenario.correctChoice;
    const impacts = isCorrect ? scenario.statImpacts : {
      wCore: Math.floor(scenario.statImpacts.wCore / 2),
      mirrorMind: Math.floor(scenario.statImpacts.mirrorMind / 2),
      realFeels: Math.floor(scenario.statImpacts.realFeels / 2),
      vybeChek: Math.floor(scenario.statImpacts.vybeChek / 2),
      moralus: Math.floor(scenario.statImpacts.moralus / 2),
      comebackSeason: Math.floor(scenario.statImpacts.comebackSeason / 2),
      clutchUp: Math.floor(scenario.statImpacts.clutchUp / 2),
      headSpace: Math.floor(scenario.statImpacts.headSpace / 2),
      sceneSense: Math.floor(scenario.statImpacts.sceneSense / 2)
    };
    if (isCorrect) {
      setScore(score + 1);
      setCharacterReaction("Great choice! You're learning to handle life's challenges! \u{1F31F}");
      await shop.rewardCoins(3, "vybestryks_correct");
    } else {
      setCharacterReaction("That's okay, we all make mistakes. Every choice is a learning opportunity! \u{1F4AB}");
    }
    await updateStats(impacts);
    toast({
      title: isCorrect ? "Excellent Choice!" : "Learning Moment",
      description: isCorrect ? `Your stats have improved! +${Math.round(10 * shop.xpMultiplier())} XP` : "Keep trying, you'll get better!"
    });
    setTimeout(() => {
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setSelectedChoice(null);
        setCharacterReaction("");
      } else {
        setGameComplete(true);
      }
    }, 2e3);
  };
  const resetGame = () => {
    setCurrentScenario(0);
    setSelectedChoice(null);
    setScore(0);
    setGameComplete(false);
    setCharacterReaction("");
  };
  if (gameComplete) {
    shop.triggerConfetti();
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(Card, { className: "vyral-card animate-fade-in text-center p-8", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "text-6xl animate-bounce", children: "\u{1F389}" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold vyral-text-glow", children: "Game Complete!" }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg", children: [
          "You scored ",
          score,
          " out of ",
          scenarios.length
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Button, { onClick: resetGame, className: "vyral-button-primary", children: "Play Again" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onBack, children: "Back to Games" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold vyral-text-glow", children: "VybeStrike (Quick)" }) }),
        /* @__PURE__ */ jsx("div", { className: "border border-dashed border-border/50 rounded-lg p-4 text-center min-h-16 flex items-center justify-center text-sm", children: currentQuick || "Press roll to get a scenario." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
          /* @__PURE__ */ jsx(Button, { onClick: rollQuick, className: "vyral-button-primary", children: "\u{1F3B2} Roll Scenario" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: markQuickDone, children: "\u2714 Mark Done" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold vyral-text-glow", children: "Submit a Scenario" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Keep it fun, short, and teen\u2011friendly. Our filter will nuke spicy words before they go live." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "scenarioInput", children: "Your scenario" }),
          /* @__PURE__ */ jsx(Textarea, { id: "scenarioInput", rows: 3, placeholder: 'e.g., "One\u2011song cleanup sprint, then 10 pushups."', value: submissionText, onChange: (e) => setSubmissionText(e.target.value) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 flex-wrap", children: (() => {
          const c = classify(submissionText);
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Badge, { variant: c.level === "block" ? "destructive" : "secondary", className: "text-xs", children: c.label }),
            /* @__PURE__ */ jsx(Badge, { variant: c.pill === "pg" ? "default" : "outline", className: "text-xs", children: c.emoji })
          ] });
        })() }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx(Button, { onClick: () => {
            const text = submissionText.trim();
            const c = classify(text);
            if (!text) {
              return toast({ title: "Please enter a scenario." });
            }
            if (c.level === "block") {
              return toast({ title: "Contains unsafe language. Try the clean rewrite." });
            }
            setQuickScenarios((prev) => [...prev, text]);
            setSubmissionText("");
            toast({ title: "Submitted! Added to this session." });
          }, className: "vyral-button-primary", children: "Submit" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSubmissionText(suggestCleanRewrite(submissionText)), children: "Suggest clean rewrite" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "By submitting, you agree to keep it respectful and school\u2011safe. No harassment, slurs, or explicit content." })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsx(Card, { className: "vyral-card animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold vyral-text-glow", children: "VybeStryks" }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: onBack, children: "Back" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Scenario ",
          currentScenario + 1,
          " of ",
          scenarios.length
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: currentScenario / scenarios.length * 100, className: "flex-1" }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
          "Score: ",
          score
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl animate-float", children: "\u{1F9E0}" }),
        characterReaction && /* @__PURE__ */ jsx("div", { className: "p-4 bg-primary/10 rounded-lg animate-bounce-in", children: /* @__PURE__ */ jsx("p", { className: "text-sm italic", children: characterReaction }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-center", style: { fontFamily: "serif" }, children: scenario.title }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground", style: { fontFamily: "serif" }, children: scenario.description }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: scenario.choices.map((choice, index) => /* @__PURE__ */ jsxs(
          Button,
          {
            variant: selectedChoice === index ? index === scenario.correctChoice ? "default" : "destructive" : "outline",
            onClick: () => handleChoice(index),
            disabled: selectedChoice !== null,
            className: "h-auto p-4 text-left justify-start whitespace-normal hover:scale-105 transition-all duration-200",
            children: [
              /* @__PURE__ */ jsxs("span", { className: "mr-3 font-bold", children: [
                String.fromCharCode(65 + index),
                "."
              ] }),
              choice
            ]
          },
          index
        )) })
      ] })
    ] })
  ] }) });
};
var VybeStrykes_default = VybeStryks;
export {
  VybeStrykes_default as default
};
