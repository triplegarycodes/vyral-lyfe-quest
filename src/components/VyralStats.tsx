import { Card } from "@/components/ui/card";

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

const StatBar = ({ label, value, maxValue, color = "primary" }: StatBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{value}/{maxValue}</span>
      </div>
      <div className="vyral-stat-bar">
        <div 
          className="vyral-stat-fill transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const VyralStats = () => {
  return (
    <Card className="vyral-card animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 vyral-text-glow">Your Vybe Stats</h3>
      <div className="space-y-4">
        <StatBar label="Focus" value={75} maxValue={100} />
        <StatBar label="Energy" value={60} maxValue={100} />
        <StatBar label="Empathy" value={85} maxValue={100} />
        <StatBar label="Confidence" value={45} maxValue={100} />
      </div>
    </Card>
  );
};

export default VyralStats;