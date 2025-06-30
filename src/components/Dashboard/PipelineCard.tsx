
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface PipelineData {
  label: string;
  value: number;
  color: string;
  delay: number;
}

const pipelineData: PipelineData[] = [
  { label: "Sem atendimento", value: 5, color: "text-blue-400", delay: 0 },
  { label: "Em atendimento", value: 8, color: "text-yellow-400", delay: 0.1 },
  { label: "Reunião agendada", value: 4, color: "text-green-400", delay: 0.2 },
  { label: "Proposta enviada", value: 3, color: "text-purple-400", delay: 0.3 },
  { label: "Frio", value: 3, color: "text-gray-400", delay: 0.4 },
];

export function PipelineCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>(new Array(pipelineData.length).fill(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      animateValues();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const animateValues = () => {
    pipelineData.forEach((item, index) => {
      const startTime = Date.now() + (item.delay * 1000);
      const duration = 1500;

      const animateValue = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed < 0) {
          requestAnimationFrame(animateValue);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(item.value * easeOut);

        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = currentValue;
          return newValues;
        });

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };

      requestAnimationFrame(animateValue);
    });
  };

  return (
    <Card className={`
      relative overflow-hidden bg-gradient-to-br from-goat-gray-800/90 to-goat-gray-900/90 
      border-goat-gray-700/50 backdrop-blur-xl p-6 group
      transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-goat-purple/10
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
    `}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-80" />
      
      {/* Glowing border on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-goat-purple/20 via-transparent to-goat-purple/20" style={{ padding: '1px' }}>
        <div className="w-full h-full bg-transparent rounded-lg" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-goat-purple transition-transform duration-300 group-hover:scale-110" />
          <h3 className="text-lg font-semibold text-white">Resumo do Pipeline</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {pipelineData.map((item, index) => (
            <div 
              key={item.label}
              className={`
                text-center p-4 rounded-lg bg-goat-gray-900/50 backdrop-blur-sm
                border border-goat-gray-700/30 transition-all duration-500 hover:scale-105
                hover:bg-goat-gray-900/70 hover:border-goat-purple/30 cursor-pointer group/item
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
              style={{ 
                transitionDelay: `${item.delay * 200}ms`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className={`
                text-2xl font-bold transition-all duration-300 ${item.color}
                group-hover/item:scale-110 group-hover/item:text-shadow-glow
              `}>
                {animatedValues[index]}
              </div>
              <div className="text-xs text-goat-gray-400 mt-1 transition-colors duration-300 group-hover/item:text-goat-gray-300">
                {item.label}
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
