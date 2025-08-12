import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Heart, Clock, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const VentingScreen = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("venting_posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) {
        console.error("Error loading posts:", error);
        return;
      }
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
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
      const { error } = await supabase.from("venting_posts").insert({ user_id: user.id, content: newPost.trim() });
      if (error) {
        toast.error("Failed to create post");
        return;
      }
      toast.success("Post created successfully");
      setNewPost("");
      fetchPosts();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-primary", children: [
        /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Private Venting Space" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "A safe, private space for your thoughts. Only you can see your posts." })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "venting-post", children: "Share your thoughts" }),
      /* @__PURE__ */ jsx(
        Textarea,
        {
          id: "venting-post",
          placeholder: "What's on your mind? Let it all out...",
          value: newPost,
          onChange: (e) => setNewPost(e.target.value),
          className: "min-h-24 resize-none"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
          newPost.length,
          "/1000 characters"
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: createPost,
            disabled: loading || !newPost.trim(),
            className: "vyral-button-primary",
            children: [
              /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-2" }),
              "Post Privately"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Heart, { className: "w-5 h-5 text-primary" }),
        "Your Private Posts"
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "h-[400px] space-y-4", children: posts.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "vyral-card text-center py-8", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Lock, { className: "w-8 h-8 text-muted-foreground mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "No posts yet. Share your first thought!" })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: posts.map((post) => /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-foreground leading-relaxed whitespace-pre-wrap", children: post.content }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
          formatDate(post.created_at)
        ] })
      ] }) }, post.id)) }) })
    ] })
  ] });
};
var VentingScreen_default = VentingScreen;
export {
  VentingScreen_default as default
};
