
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";
import { useLeads } from "@/hooks/useLeads";
import { useMemo } from "react";

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

interface AlertCardProps {
  className?: string;
  limit?: number;
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

export function AlertCard({ className, limit }: AlertCardProps) {
  const { data: clients = [] } = useClients();
  const { data: contracts = [] } = useContracts();
  const { leads = [] } = useLeads();

  const realAlerts = useMemo(() => {
    const alerts: Alert[] = [];
    const now = new Date();

    // Contratos vencidos (danger)
    contracts
      .filter(contract => contract.end_date && new Date(contract.end_date) < now && contract.status === 'active')
      .forEach(contract => {
        const daysOverdue = Math.floor((now.getTime() - new Date(contract.end_date!).getTime()) / (1000 * 60 * 60 * 24));
        const client = clients.find(c => c.id === contract.client_id);
        alerts.push({
          id: `contract-overdue-${contract.id}`,
          type: 'danger',
          title: 'Contrato vencido',
          description: `${client?.company || 'Cliente'} com contrato vencido há ${daysOverdue} dias`,
          timestamp: `${daysOverdue} dias atrás`
        });
      });

    // Contratos vencendo em até 7 dias (warning)
    contracts
      .filter(contract => {
        if (!contract.end_date || contract.status !== 'active') return false;
        const endDate = new Date(contract.end_date);
        const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
      })
      .forEach(contract => {
        const daysUntilExpiry = Math.floor((new Date(contract.end_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const client = clients.find(c => c.id === contract.client_id);
        alerts.push({
          id: `contract-expiring-${contract.id}`,
          type: 'warning',
          title: 'Contrato vencendo',
          description: `${client?.company || 'Cliente'} com contrato vencendo em ${daysUntilExpiry} dias`,
          timestamp: `${daysUntilExpiry} dias restantes`
        });
      });

    // Leads sem atualização há mais de 7 dias (info)
    leads
      .filter(lead => {
        if (!lead.updated_at) return false;
        const daysSinceUpdate = Math.floor((now.getTime() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceUpdate > 7;
      })
      .slice(0, 3) // Limita a 3 leads para não poluir
      .forEach(lead => {
        const daysSinceUpdate = Math.floor((now.getTime() - new Date(lead.updated_at!).getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `lead-inactive-${lead.id}`,
          type: 'info',
          title: 'Lead sem movimentação',
          description: `${lead.name} sem atualização há ${daysSinceUpdate} dias`,
          timestamp: `${daysSinceUpdate} dias atrás`
        });
      });

    // Ordena por prioridade: danger -> warning -> info
    return alerts.sort((a, b) => {
      const priorityOrder = { danger: 0, warning: 1, info: 2 };
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
  }, [clients, contracts, leads]);

  const alertsToShow = typeof limit === 'number' ? realAlerts.slice(0, limit) : realAlerts;
  return (
    <Card className={cn("bg-goat-gray-800 border-goat-gray-700 p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-goat-purple" />
        <h3 className="text-lg font-semibold text-white">Alertas & Notificações</h3>
      </div>
      <div className="space-y-4">
        {alertsToShow.length > 0 ? (
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
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-goat-gray-500 mx-auto mb-2" />
            <p className="text-goat-gray-400 text-sm">Nenhum alerta no momento</p>
            <p className="text-goat-gray-500 text-xs mt-1">Tudo está funcionando bem!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
