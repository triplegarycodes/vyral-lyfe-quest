import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Palette, RotateCcw } from "lucide-react";

interface ColorScheme {
  name: string;
  primary: string;
  accent: string;
  primaryGlow: string;
}

const predefinedSchemes: ColorScheme[] = [
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

  const applyColorScheme = (scheme: ColorScheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', scheme.primary);
    root.style.setProperty('--accent', scheme.accent);
    root.style.setProperty('--primary-glow', scheme.primaryGlow);
    
    // Update gradients
    const [h1] = scheme.primaryGlow.split(' ');
    const [h2] = scheme.primary.split(' ');
    const h3 = parseInt(h2) - 20;
    
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, hsl(${scheme.primaryGlow}), hsl(${scheme.primary}), hsl(${h3} 100% 45%))`
    );
    root.style.setProperty('--gradient-accent', 
      `linear-gradient(135deg, hsl(${scheme.accent}), hsl(${parseInt(scheme.accent.split(' ')[0]) + 10} 100% 50%))`
    );
    
    setCurrentScheme(scheme);
  };

  const applyCustomHue = (hue: number) => {
    const customScheme: ColorScheme = {
      name: "Custom",
      primary: `${hue} 100% 50%`,
      accent: `${(hue + 70) % 360} 100% 60%`,
      primaryGlow: `${(hue - 20 + 360) % 360} 100% 60%`
    };
    applyColorScheme(customScheme);
  };

  const resetToDefault = () => {
    applyColorScheme(predefinedSchemes[0]);
    setCustomHue([200]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card"
      >
        <Palette className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 vyral-card z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold vyral-text-glow flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          Theme Customizer
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          ×
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Preset Schemes</Label>
          <div className="grid grid-cols-2 gap-2">
            {predefinedSchemes.map((scheme) => (
              <Button
                key={scheme.name}
                variant={currentScheme.name === scheme.name ? "default" : "outline"}
                size="sm"
                onClick={() => applyColorScheme(scheme)}
                className="text-xs h-8"
              >
                {scheme.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">
            Custom Hue: {customHue[0]}°
          </Label>
          <Slider
            value={customHue}
            onValueChange={(value) => {
              setCustomHue(value);
              applyCustomHue(value[0]);
            }}
            max={360}
            step={1}
            className="w-full"
          />
          <div 
            className="h-4 rounded mt-2 border border-border/50"
            style={{ 
              background: `linear-gradient(90deg, ${Array.from({length: 36}, (_, i) => 
                `hsl(${i * 10} 100% 50%)`
              ).join(', ')})` 
            }}
          />
        </div>

        <Button
          onClick={resetToDefault}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
      </div>
    </Card>
  );
};

export default ThemeCustomizer;