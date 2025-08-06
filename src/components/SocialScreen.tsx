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

interface SocialPost {
  id: string;
  content: string;
  category: string;
  like_count: number;
  created_at: string;
  user_has_liked?: boolean;
}

const SocialScreen = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("motivation");
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "motivation", label: "Motivation", icon: Sparkles },
    { value: "support", label: "Support", icon: HeartHandshake },
    { value: "celebration", label: "Celebration", icon: Heart },
    { value: "general", label: "General", icon: Users },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // For now, using local storage until database migration is complete
    try {
      const storedPosts = localStorage.getItem('social_posts_global');
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

      // For now, using local storage until database migration is complete
      const newPostObj = {
        id: Date.now().toString(),
        content: newPost.trim(),
        category: selectedCategory,
        like_count: 0,
        created_at: new Date().toISOString(),
        user_has_liked: false
      };

      const storedPosts = localStorage.getItem('social_posts_global');
      const existingPosts = storedPosts ? JSON.parse(storedPosts) : [];
      const updatedPosts = [newPostObj, ...existingPosts];
      
      localStorage.setItem('social_posts_global', JSON.stringify(updatedPosts));
      
      toast.success("Post shared with the community!");
      setNewPost("");
      fetchPosts();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to like posts");
        return;
      }

      // For now, using local storage until database migration is complete
      const storedPosts = localStorage.getItem('social_posts_global');
      if (!storedPosts) return;
      
      const existingPosts = JSON.parse(storedPosts);
      const updatedPosts = existingPosts.map((post: SocialPost) => {
        if (post.id === postId) {
          return {
            ...post,
            like_count: currentlyLiked ? post.like_count - 1 : post.like_count + 1,
            user_has_liked: !currentlyLiked
          };
        }
        return post;
      });
      
      localStorage.setItem('social_posts_global', JSON.stringify(updatedPosts));
      fetchPosts();
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "motivation": return "bg-primary/10 text-primary";
      case "support": return "bg-green-500/10 text-green-600";
      case "celebration": return "bg-pink-500/10 text-pink-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Users className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Community Space</h2>
        </div>
        <p className="text-muted-foreground">
          Share positive vibes, support others, and grow together safely.
        </p>
      </div>

      {/* Create Post */}
      <Card className="vyral-card">
        <div className="space-y-4">
          <Label htmlFor="social-post">Share something positive with the community</Label>
          
          {/* Category Selection */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="vyral-button-secondary"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          <Textarea
            id="social-post"
            placeholder="Share something uplifting, a win, or offer support to others..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-24 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {newPost.length}/500 characters
            </span>
            <Button 
              onClick={createPost} 
              disabled={loading || !newPost.trim()}
              className="vyral-button-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Share with Community
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Community Posts
        </h3>
        
        <ScrollArea className="h-[400px] space-y-4">
          {posts.length === 0 ? (
            <Card className="vyral-card text-center py-8">
              <div className="space-y-2">
                <Users className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  No posts yet. Be the first to share something positive!
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="vyral-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(post.category)}>
                        {categories.find(c => c.value === post.category)?.label || post.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                    
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id, post.user_has_liked || false)}
                        className={`${post.user_has_liked ? 'text-pink-600' : 'text-muted-foreground'} hover:text-pink-600`}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${post.user_has_liked ? 'fill-current' : ''}`} />
                        {post.like_count}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SocialScreen;