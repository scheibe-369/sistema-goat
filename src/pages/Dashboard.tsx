import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AlertCard } from "@/components/Dashboard/AlertCard";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";
import { useStages } from "@/hooks/useStages";
import { useLeads } from "@/hooks/useLeads";

export default function Dashboard() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [] } = useContracts();
  const { stages = [] } = useStages();
  const { leads = [] } = useLeads();

  // Função auxiliar para verificar se o contrato fatura no mês atual
  const parseLocalDate = (dateString: string) => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    return new Date(year, month, day);
  };

  // Faturamento mensal considerando apenas contratos que faturam no mês atual
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const monthlyRevenue = contracts
    .filter(contract => {
      if (contract.status !== "active") return false;
      if (!contract.start_date || !contract.end_date) return false;
      
      const client = clients.find(c => c.id === contract.client_id);
      if (!client || !client.payment_day) return false;
      
      const startDate = parseLocalDate(contract.start_date);
      const endDate = parseLocalDate(contract.end_date);
      const paymentDay = Number(client.payment_day);
      
      // Calcular o primeiro mês de pagamento
      let firstPaymentDate = new Date(startDate.getFullYear(), startDate.getMonth(), paymentDay);
      
      // Se o contrato começou depois do dia de pagamento, primeiro pagamento é no mês seguinte
      if (startDate.getDate() > paymentDay) {
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
      }
      
      // Verificar se o mês atual está entre o primeiro pagamento e o fim do contrato
      const currentMonthDate = new Date(currentYear, currentMonth, paymentDay);
      
      return currentMonthDate >= firstPaymentDate && currentMonthDate <= endDate;
    })
    .reduce((total, contract) => total + (contract.monthly_value || 0), 0);
  
  console.log('[DASHBOARD] Faturamento do mês atual:', monthlyRevenue);

  // Total de clientes ativos
  const activeClients = clients.filter(client => client.tags?.includes("Ativo")).length;

  // Funil de vendas: etapas dinâmicas
  const funnelStages = stages;
  const leadsByStage = (stageId: string) => leads.filter(lead => lead.stage === stageId).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-goat-gray-400">Visão geral do seu CRM</p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(7, 1fr)',
          gap: '16px',
        }}
      >
        {/* Faturamento Mensal */}
        <div style={{ gridColumn: '1', gridRow: '1' }}>
          <StatsCard
            title="Faturamento Mensal"
            value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Mês atual"
            className="dashboard-glow p-4"
          />
        </div>
        {/* Clientes Ativos */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <StatsCard
            title="Clientes Ativos"
            value={activeClients.toString()}
            icon={Users}
            description="Com status ativo"
            className="dashboard-glow p-4"
          />
        </div>
        {/* Funil de Vendas (colunas 3-4, linhas 1-4) */}
        <div style={{ gridColumn: '3 / 5', gridRow: '1 / 5', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-2 flex flex-col gap-2 dashboard-glow h-full">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-goat-purple" />
              <span className="text-white font-semibold text-base">Funil de Vendas</span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto h-full justify-between">
              {/* Agrupar todos os Follow-up em um só card */}
              {(() => {
                const followupStages = funnelStages.filter(s => s.name.toLowerCase().startsWith('follow-up'));
                const mainStages = funnelStages.filter(s => !s.name.toLowerCase().startsWith('follow-up'));
                const followupCount = followupStages.reduce((acc, s) => acc + leadsByStage(s.id), 0);
                const displayStages = mainStages.slice(0, 6); // 6 principais etapas (inclui Cliente)
                return (
                  <>
                    {displayStages.map(stage => (
                      <Card key={stage.id} className="flex items-center gap-2 p-3 bg-goat-gray-900/50 border border-goat-gray-700">
                        <span className="w-3 h-3 rounded-full" style={{ background: stage.color }} />
                        <span className="text-white text-sm flex-1">{stage.name}</span>
                        <span className="text-goat-purple font-bold text-lg">{leadsByStage(stage.id)}</span>
                      </Card>
                    ))}
                    {followupStages.length > 0 && (
                      <Card key="followup-group" className="flex items-center gap-2 p-3 bg-goat-gray-900/50 border border-goat-gray-700">
                        <span className="w-3 h-3"></span>
                        <span className="text-white text-sm flex-1">Follow-up</span>
                        <span className="text-goat-purple font-bold text-lg">{followupCount}</span>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
        {/* Alertas & Notificações (colunas 1-2, linhas 2-4) */}
        <div style={{ gridColumn: '1 / 3', gridRow: '2 / 5', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <AlertCard className="dashboard-glow p-4" limit={3} />
        </div>
        {/* Clientes Recentes (colunas 1-4, linhas 5-7) */}
        <div style={{ gridColumn: '1 / 5', gridRow: '5 / 8', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-4 dashboard-glow animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-goat-purple" />
              <h3 className="text-lg font-semibold text-white">Clientes Recentes</h3>
            </div>
            <div className="space-y-3">
              {clients.slice(0, 4).map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-2 rounded-lg bg-goat-gray-900/30 border border-goat-gray-700 dashboard-glow animate-fade-in" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
                  <div>
                    <p className="text-white text-sm font-medium">{client.company}</p>
                    <p className="text-goat-gray-400 text-xs">Responsável: {client.responsible}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-goat-gray-500 text-xs">
                      {new Date(client.created_at || '').toLocaleDateString('pt-BR')}
                    </span>
                    {client.plan && (
                      <p className="text-goat-purple text-xs">{client.plan}</p>
                    )}
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-goat-gray-400">Nenhum cliente cadastrado ainda</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
