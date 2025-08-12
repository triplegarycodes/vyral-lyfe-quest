import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Send, Users, Sparkles, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const SocialScreen = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("motivation");
  const [loading, setLoading] = useState(false);
  const categories = [
    { value: "motivation", label: "Motivation", icon: Sparkles },
    { value: "support", label: "Support", icon: HeartHandshake },
    { value: "celebration", label: "Celebration", icon: Heart },
    { value: "general", label: "General", icon: Users }
  ];
  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
    try {
      const storedPosts = localStorage.getItem("social_posts_global");
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.log("Using local storage for now");
    }
  };
  const createPost = async () => {
    if (!newPost.trim()) {
      toast.error("Please write something to post");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to post");
        return;
      }
      const newPostObj = {
        id: Date.now().toString(),
        content: newPost.trim(),
        category: selectedCategory,
        like_count: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        user_has_liked: false
      };
      const storedPosts = localStorage.getItem("social_posts_global");
      const existingPosts = storedPosts ? JSON.parse(storedPosts) : [];
      const updatedPosts = [newPostObj, ...existingPosts];
      localStorage.setItem("social_posts_global", JSON.stringify(updatedPosts));
      toast.success("Post shared with the community!");
      setNewPost("");
      fetchPosts();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  const toggleLike = async (postId, currentlyLiked) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to like posts");
        return;
      }
      const storedPosts = localStorage.getItem("social_posts_global");
      if (!storedPosts) return;
      const existingPosts = JSON.parse(storedPosts);
      const updatedPosts = existingPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            like_count: currentlyLiked ? post.like_count - 1 : post.like_count + 1,
            user_has_liked: !currentlyLiked
          };
        }
        return post;
      });
      localStorage.setItem("social_posts_global", JSON.stringify(updatedPosts));
      fetchPosts();
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const getCategoryColor = (category) => {
    switch (category) {
      case "motivation":
        return "bg-primary/10 text-primary";
      case "support":
        return "bg-green-500/10 text-green-600";
      case "celebration":
        return "bg-pink-500/10 text-pink-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-primary", children: [
        /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Community Space" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Share positive vibes, support others, and grow together safely." })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "social-post", children: "Share something positive with the community" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => {
        const Icon = category.icon;
        return /* @__PURE__ */ jsxs(
          Button,
          {
            variant: selectedCategory === category.value ? "default" : "outline",
            size: "sm",
            onClick: () => setSelectedCategory(category.value),
            className: "vyral-button-secondary",
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 mr-1" }),
              category.label
            ]
          },
          category.value
        );
      }) }),
      /* @__PURE__ */ jsx(
        Textarea,
        {
          id: "social-post",
          placeholder: "Share something uplifting, a win, or offer support to others...",
          value: newPost,
          onChange: (e) => setNewPost(e.target.value),
          className: "min-h-24 resize-none"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          newPost.length,
          "/500 characters"
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: createPost,
            disabled: loading || !newPost.trim(),
            className: "vyral-button-primary",
            children: [
              /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-2" }),
              "Share with Community"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary" }),
        "Community Posts"
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "h-[400px] space-y-4", children: posts.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "vyral-card text-center py-8", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Users, { className: "w-8 h-8 text-muted-foreground mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "No posts yet. Be the first to share something positive!" })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: posts.map((post) => /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Badge, { className: getCategoryColor(post.category), children: categories.find((c) => c.value === post.category)?.label || post.category }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
            formatDate(post.created_at)
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-foreground leading-relaxed whitespace-pre-wrap", children: post.content }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => toggleLike(post.id, post.user_has_liked || false),
            className: `${post.user_has_liked ? "text-pink-600" : "text-muted-foreground"} hover:text-pink-600`,
            children: [
              /* @__PURE__ */ jsx(Heart, { className: `w-4 h-4 mr-1 ${post.user_has_liked ? "fill-current" : ""}` }),
              post.like_count
            ]
          }
        ) })
      ] }) }, post.id)) }) })
    ] })
  ] });
};
var SocialScreen_default = SocialScreen;
export {
  SocialScreen_default as default
};
