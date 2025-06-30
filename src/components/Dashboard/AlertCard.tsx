import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, DollarSign, FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Cliente em atraso',
    description: 'Empresa XYZ está com fatura vencida há 15 dias',
    timestamp: '2 horas atrás'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Contrato vencendo',
    description: 'Contrato da Empresa ABC vence em 5 dias',
    timestamp: '1 dia atrás'
  },
  {
    id: '3',
    type: 'info',
    title: 'Lead sem movimentação',
    description: 'Lead João Silva há 7 dias sem atualização',
    timestamp: '3 horas atrás'
  }
];

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'danger':
      return <DollarSign className="w-4 h-4" />;
    case 'warning':
      return <FileText className="w-4 h-4" />;
    case 'info':
      return <Clock className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getAlertColor = (type: Alert['type']) => {
  switch (type) {
    case 'danger':
      return {
        bg: 'bg-red-900/20',
        text: 'text-red-400',
        border: 'border-red-800/50',
        hover: 'hover:border-red-600/70'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-900/20',
        text: 'text-yellow-400',
        border: 'border-yellow-800/50',
        hover: 'hover:border-yellow-600/70'
      };
    case 'info':
      return {
        bg: 'bg-blue-900/20',
        text: 'text-blue-400',
        border: 'border-blue-800/50',
        hover: 'hover:border-blue-600/70'
      };
    default:
      return {
        bg: 'bg-gray-900/20',
        text: 'text-gray-400',
        border: 'border-gray-800/50',
        hover: 'hover:border-gray-600/70'
      };
  }
};

export function AlertCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className={`
      relative overflow-hidden 
      bg-gradient-to-br from-slate-800/90 to-slate-900/95
      border-slate-700/40 backdrop-blur-xl p-6 
      transition-all duration-700 ease-out 
      hover:shadow-2xl hover:shadow-purple-500/10
      hover:border-purple-500/30
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
    `}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/1 pointer-events-none" />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <AlertTriangle className={`
              w-5 h-5 text-purple-400 
              transition-all duration-300 
              ${isVisible ? 'rotate-0 scale-100' : 'rotate-45 scale-75'}
            `} />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Alertas & Notificações
          </h3>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs text-purple-300 border-purple-400/30">
              {mockAlerts.length}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          {mockAlerts.map((alert, index) => {
            const colors = getAlertColor(alert.type);
            const isHovered = hoveredAlert === alert.id;
            
            return (
              <div 
                key={alert.id} 
                className={`
                  relative flex items-start gap-4 p-4 rounded-xl 
                  bg-slate-900/40 border border-slate-700/30
                  backdrop-blur-sm cursor-pointer group
                  transition-all duration-500 ease-out
                  hover:bg-slate-800/60 hover:border-purple-500/30
                  hover:shadow-lg hover:shadow-purple-500/5
                  ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}
                  ${isHovered ? 'scale-[1.02] -translate-y-1' : 'scale-100 translate-y-0'}
                `}
                style={{ 
                  transitionDelay: `${index * 150 + 300}ms`
                }}
                onMouseEnter={() => setHoveredAlert(alert.id)}
                onMouseLeave={() => setHoveredAlert(null)}
              >
                {/* Shine effect */}
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500
                  bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                  transition-transform duration-1000 ease-out
                `} />
                
                {/* Alert icon */}
                <div className={`
                  relative p-3 rounded-xl transition-all duration-300
                  ${colors.bg} ${colors.border} border
                  group-hover:scale-110 group-hover:-rotate-3
                  ${colors.hover}
                `}>
                  <div className={`${colors.text} transition-colors duration-300`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  {/* Icon glow effect */}
                  <div className={`
                    absolute inset-0 rounded-xl opacity-0 group-hover:opacity-60
                    transition-opacity duration-300 blur-sm
                    ${colors.bg}
                  `} />
                </div>
                
                {/* Alert content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm mb-1 transition-colors duration-300 group-hover:text-purple-200">
                    {alert.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-2 transition-colors duration-300 group-hover:text-slate-300">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <p className="text-slate-500 text-xs transition-colors duration-300 group-hover:text-slate-400">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
                
                {/* Alert badge */}
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant="outline" 
                    className={`
                      text-xs transition-all duration-300
                      ${colors.bg} ${colors.text} ${colors.border} border
                      group-hover:scale-105 ${colors.hover}
                    `}
                  >
                    {alert.type}
                  </Badge>
                  
                  {/* Priority indicator */}
                  <div className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${alert.type === 'danger' ? 'bg-red-400' : 
                      alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'}
                    ${isHovered ? 'scale-125 animate-pulse' : 'scale-100'}
                  `} />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className={`
          mt-6 pt-4 border-t border-slate-700/30
          transition-all duration-700 delay-700
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <p className="text-xs text-slate-500 text-center">
            Última atualização: agora mesmo
          </p>
        </div>
      </div>
    </Card>
  );
}