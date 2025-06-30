
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
      return 'bg-red-900/20 text-red-400 border-red-800';
    case 'warning':
      return 'bg-yellow-900/20 text-yellow-400 border-yellow-800';
    case 'info':
      return 'bg-blue-900/20 text-blue-400 border-blue-800';
    default:
      return 'bg-gray-900/20 text-gray-400 border-gray-800';
  }
};

export function AlertCard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

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
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-goat-purple transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <h3 className="text-lg font-semibold text-white">Alertas & Notificações</h3>
        </div>
        
        <div className="space-y-4">
          {mockAlerts.map((alert, index) => (
            <div 
              key={alert.id} 
              className={`
                flex items-start gap-3 p-3 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700/30
                backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:bg-goat-gray-900/70
                hover:border-goat-purple/30 cursor-pointer group/alert
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              `}
              style={{ 
                transitionDelay: `${index * 100 + 400}ms`,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className={`
                p-2 rounded-full transition-all duration-300 ${getAlertColor(alert.type)}
                group-hover/alert:scale-110 group-hover/alert:rotate-6
              `}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm transition-colors duration-300 group-hover/alert:text-goat-purple">
                  {alert.title}
                </h4>
                <p className="text-goat-gray-400 text-xs mt-1 transition-colors duration-300 group-hover/alert:text-goat-gray-300">
                  {alert.description}
                </p>
                <p className="text-goat-gray-500 text-xs mt-2">
                  {alert.timestamp}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={`
                  ${getAlertColor(alert.type)} transition-all duration-300
                  group-hover/alert:scale-105
                `}
              >
                {alert.type}
              </Badge>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover/alert:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/3 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/alert:translate-x-[100%] transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
