import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Heart, Clock, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VentingPost {
  id: string;
  content: string;
  created_at: string;
}

const VentingScreen = () => {
  const [posts, setPosts] = useState<VentingPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('venting_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
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

      const { error } = await supabase
        .from('venting_posts')
        .insert({ user_id: user.id, content: newPost.trim() });

      if (error) {
        toast.error('Failed to create post');
        return;
      }

      toast.success('Post created successfully');
      setNewPost('');
      fetchPosts();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Lock className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Private Venting Space</h2>
        </div>
        <p className="text-muted-foreground">
          A safe, private space for your thoughts. Only you can see your posts.
        </p>
      </div>

      {/* Create Post */}
      <Card className="vyral-card">
        <div className="space-y-4">
          <Label htmlFor="venting-post">Share your thoughts</Label>
          <Textarea
            id="venting-post"
            placeholder="What's on your mind? Let it all out..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-24 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {newPost.length}/1000 characters
            </span>
            <Button 
              onClick={createPost} 
              disabled={loading || !newPost.trim()}
              className="vyral-button-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Post Privately
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Your Private Posts
        </h3>
        
        <ScrollArea className="h-[400px] space-y-4">
          {posts.length === 0 ? (
            <Card className="vyral-card text-center py-8">
              <div className="space-y-2">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  No posts yet. Share your first thought!
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="vyral-card">
                  <div className="space-y-3">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDate(post.created_at)}
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

export default VentingScreen;