
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

interface AlertCardProps {
  className?: string;
  limit?: number;
  alerts?: Alert[];
}

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

export function AlertCard({ className, limit, alerts = [] }: AlertCardProps) {
  const alertsToShow = typeof limit === 'number' ? alerts.slice(0, limit) : alerts;
  return (
    <Card className={cn("bg-goat-gray-800 border-goat-gray-700 p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-goat-purple" />
        <h3 className="text-lg font-semibold text-white">Alertas & Notificações</h3>
      </div>
      <div className="space-y-4">
        {alertsToShow.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-goat-gray-400 text-sm">Nenhum alerta no momento</p>
          </div>
        ) : (
          alertsToShow.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
            <div className={`p-2 rounded-full ${getAlertColor(alert.type)}`}>{getAlertIcon(alert.type)}</div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm">{alert.title}</h4>
              <p className="text-goat-gray-400 text-xs mt-1">{alert.description}</p>
              <p className="text-goat-gray-500 text-xs mt-2">{alert.timestamp}</p>
            </div>
            <Badge variant="outline" className={getAlertColor(alert.type)}>
              {alert.type}
            </Badge>
          </div>
        ))
        )}
      </div>
    </Card>
  );
}
