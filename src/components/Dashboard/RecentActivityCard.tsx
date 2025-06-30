
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";

const activities = [
  { action: "Novo lead adicionado", client: "Empresa Tech Solutions", time: "há 2 horas" },
  { action: "Contrato renovado", client: "Marketing Digital Pro", time: "há 4 horas" },
  { action: "Pagamento recebido", client: "Consultoria ABC", time: "há 1 dia" },
  { action: "Reunião realizada", client: "Startup XYZ", time: "há 2 dias" },
];

export function RecentActivityCard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-goat-purple transition-transform duration-300 group-hover:scale-110" />
          <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
        </div>
        
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={index} 
              className={`
                flex items-center justify-between p-3 rounded-lg bg-goat-gray-900/30 
                border border-goat-gray-700/30 backdrop-blur-sm transition-all duration-500 
                hover:scale-[1.01] hover:bg-goat-gray-900/50 hover:border-goat-purple/30 
                cursor-pointer group/activity
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}
              `}
              style={{ 
                transitionDelay: `${index * 100 + 600}ms`,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div>
                <p className="text-white text-sm font-medium transition-colors duration-300 group-hover/activity:text-goat-purple">
                  {activity.action}
                </p>
                <p className="text-goat-gray-400 text-xs transition-colors duration-300 group-hover/activity:text-goat-gray-300">
                  {activity.client}
                </p>
              </div>
              <span className="text-goat-gray-500 text-xs transition-all duration-300 group-hover/activity:text-goat-gray-400 group-hover/activity:scale-105">
                {activity.time}
              </span>
              
              {/* Pulse indicator */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-goat-purple rounded-full opacity-0 group-hover/activity:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-goat-purple rounded-full animate-ping opacity-75" />
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover/activity:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/3 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/activity:translate-x-[100%] transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
