import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
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
import { Button } from "@/components/ui/button";
import { Zap, User as UserIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'venting' | 'social'>('dashboard');

  useEffect(() => {
    // Show loading screen for at least 2 seconds for better UX
    const loadingTimer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2000);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
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
        setCurrentView('dashboard');
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  // Show loading screen
  if (loading || showLoadingScreen) {
    return <LoadingScreen />;
  }

  // Authentication required
  if (!user || !session) {
    return <SignInScreen onSignIn={() => {}} />;
  }

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'venting':
        return <VentingScreen />;
      case 'social':
        return <SocialScreen />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Lyfeboard />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <VybeOfTheDay />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <VyralStats />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <MoodTracker />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <QuickActions />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center animate-glow-pulse hover:animate-wiggle transition-all duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold vyral-text-glow hover:scale-105 transition-transform duration-300 cursor-default">Vyral</h1>
                <p className="text-xs text-muted-foreground">Level up in life, make it vyral</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
                <span className="text-muted-foreground">Level 3</span>
                <span className="text-primary font-medium">1,247 XP</span>
              </div>
              
              <Button variant="ghost" size="sm" title={user.email || ''}>
                <UserIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        onSignOut={handleSignOut}
      />
      
      <ThemeCustomizer />
    </div>
  );
};

export default Index;
