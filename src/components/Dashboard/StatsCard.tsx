
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, description }: StatsCardProps) {
  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 hover:border-goat-purple/50 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-goat-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {description && (
            <p className="text-goat-gray-400 text-xs mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-goat-gray-400 text-sm ml-2">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-goat-purple/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-goat-purple" />
          </div>
        </div>
      </div>
    </Card>
  );
}
