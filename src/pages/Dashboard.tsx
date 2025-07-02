
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AlertCard } from "@/components/Dashboard/AlertCard";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, FileText, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";

export default function Dashboard() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [] } = useContracts();

  // Calcular estatísticas reais do banco de dados
  const activeClients = clients.filter(client => client.tags?.includes("Ativo")).length;
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(contract => contract.status === "active").length;
  
  // Calcular faturamento mensal dos contratos ativos
  const monthlyRevenue = contracts
    .filter(contract => contract.status === "active")
    .reduce((total, contract) => total + (contract.monthly_value || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-goat-gray-400">Visão geral do seu CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Faturamento Mensal"
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Contratos ativos"
          className="dashboard-glow"
        />
        <StatsCard
          title="Total de Clientes"
          value={clients.length.toString()}
          icon={Users}
          description="Clientes cadastrados"
          className="dashboard-glow"
        />
        <StatsCard
          title="Clientes Ativos"
          value={activeClients.toString()}
          icon={Users}
          description="Com status ativo"
          className="dashboard-glow"
        />
        <StatsCard
          title="Contratos Ativos"
          value={activeContracts.toString()}
          icon={FileText}
          description={`de ${totalContracts} total`}
          className="dashboard-glow"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-goat-purple" />
              <h3 className="text-lg font-semibold text-white">Resumo dos Clientes</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50 dashboard-glow animate-pulse-soft">
                <div className="text-2xl font-bold text-green-400">{activeClients}</div>
                <div className="text-xs text-goat-gray-400">Clientes Ativos</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50 dashboard-glow animate-pulse-soft" style={{animationDelay: '0.1s'}}>
                <div className="text-2xl font-bold text-yellow-400">
                  {clients.filter(c => c.tags?.includes("A vencer")).length}
                </div>
                <div className="text-xs text-goat-gray-400">Contratos A Vencer</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50 dashboard-glow animate-pulse-soft" style={{animationDelay: '0.2s'}}>
                <div className="text-2xl font-bold text-red-400">
                  {clients.filter(c => c.tags?.includes("Vencido")).length}
                </div>
                <div className="text-xs text-goat-gray-400">Contratos Vencidos</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <AlertCard className="dashboard-glow" />
        </div>
      </div>

      {/* Recent Activity - Dados dos clientes mais recentes */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow animate-slide-up" style={{animationDelay: '0.3s'}}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-goat-purple" />
          <h3 className="text-lg font-semibold text-white">Clientes Recentes</h3>
        </div>
        
        <div className="space-y-3">
          {clients.slice(0, 4).map((client, index) => (
            <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-goat-gray-900/30 border border-goat-gray-700 dashboard-glow animate-fade-in" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
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
  );
}
