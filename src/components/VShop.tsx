import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Coins, Sparkles } from "lucide-react";

const VShop = () => {
  // Basic SEO for this view
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "V-Shop • VybeCoin Shop | Vyral";

    const desc = "V-Shop: Spend VybeCoins on boosts, cosmetics, and themes.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    return () => {
      // restore previous title when leaving the view
      document.title = prevTitle;
    };
  }, []);

  return (
    <section aria-labelledby="vshop-heading" className="space-y-6">
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <CardTitle id="vshop-heading" className="text-xl">V-Shop</CardTitle>
            <CardDescription className="text-muted-foreground">
              Spend VybeCoins on boosts, cosmetics, and themes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Coming Soon Item {i}</CardTitle>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <CardDescription>Exclusive perk to boost your vybes.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4 text-primary" />
                    <span>—</span>
                  </div>
                  <Button size="sm" disabled variant="secondary">Soon</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Earn VybeCoins by completing goals, tracking moods, and participating in the community.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default VShop;
