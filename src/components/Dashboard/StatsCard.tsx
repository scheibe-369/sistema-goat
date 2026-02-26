
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, description, className }: StatsCardProps) {
  return (
    <Card className={cn("glass-effect p-6 dashboard-glow border-white/[0.05]", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-white/30 text-[10px] mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-400' : 'text-danger'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-white/20 text-[10px] ml-2">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
