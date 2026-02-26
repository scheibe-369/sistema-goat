
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
    <Card className={cn("premium-card p-6 animate-premium-in", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white tabular-nums tracking-tight">{value}</p>
          {description && (
            <p className="text-white/30 text-[10px] mt-1 leading-relaxed">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2.5">
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                trend.isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
              <span className="text-white/20 text-[10px] ml-2">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_-5px_rgba(104,41,192,0.3)]">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
