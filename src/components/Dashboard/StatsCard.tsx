
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  prefix?: string;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  prefix = "",
  delay = 0 
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      animateValue();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const animateValue = () => {
    const duration = 2000;
    const increment = value / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplayValue(Math.floor(current));
    }, 16);
  };

  const formatValue = (val: number) => {
    if (prefix === "R$") {
      return `R$ ${val.toLocaleString('pt-BR')}`;
    }
    return val.toString();
  };

  return (
    <Card 
      className={`
        relative overflow-hidden bg-gradient-to-br from-goat-gray-800/90 to-goat-gray-900/90 
        border-goat-gray-700/50 backdrop-blur-xl 
        transition-all duration-500 ease-out cursor-pointer group
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        ${isHovered ? 'scale-[1.02] shadow-2xl shadow-goat-purple/20' : 'hover:scale-[1.01]'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transitionDelay: `${delay * 100}ms`,
        boxShadow: isHovered 
          ? '0 0 40px rgba(83, 21, 203, 0.3), 0 20px 40px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-60" />
      
      {/* Glowing border effect */}
      <div className={`
        absolute inset-0 rounded-lg transition-opacity duration-500
        bg-gradient-to-r from-goat-purple/30 via-transparent to-goat-purple/30
        opacity-0 group-hover:opacity-100
      `} style={{ padding: '1px' }}>
        <div className="w-full h-full bg-goat-gray-800 rounded-lg" />
      </div>

      {/* Pulsing glow animation */}
      <div className={`
        absolute inset-0 rounded-lg transition-all duration-1000
        ${isHovered ? 'animate-pulse' : ''}
      `} style={{
        boxShadow: isHovered ? '0 0 20px rgba(83, 21, 203, 0.4)' : 'none'
      }} />

      <div className="relative p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-goat-gray-400 text-sm font-medium mb-2">{title}</p>
            <p className="text-2xl font-bold text-white transition-all duration-300">
              {formatValue(displayValue)}
            </p>
            {description && (
              <p className="text-goat-gray-400 text-xs mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2 space-x-1">
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${trend.isPositive ? 'text-green-400' : 'text-red-400'}
                `}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-goat-gray-400 text-sm">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className={`
              w-12 h-12 bg-goat-purple/20 rounded-lg flex items-center justify-center
              transition-all duration-300 group-hover:bg-goat-purple/30
              ${isHovered ? 'animate-bounce' : ''}
            `}>
              <Icon className={`
                w-6 h-6 text-goat-purple transition-all duration-300
                ${isHovered ? 'scale-110 rotate-12' : ''}
              `} />
            </div>
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-r from-transparent via-white/5 to-transparent
        transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]
        transition-transform duration-1000 ease-out
      `} />
    </Card>
  );
}
