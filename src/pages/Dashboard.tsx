import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AlertCard } from "@/components/Dashboard/AlertCard";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, FileText, MessageSquare, TrendingUp, Calendar } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-goat-gray-400">Visão geral do seu CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-glow">
          <StatsCard
            title="Faturamento Mensal"
            value="R$ 45.230"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            description="Janeiro 2024"
          />
        </div>
        <div className="dashboard-glow">
          <StatsCard
            title="Leads Ativos"
            value="23"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
            description="Pipeline de vendas"
          />
        </div>
        <div className="dashboard-glow">
          <StatsCard
            title="Contratos Ativos"
            value="18"
            icon={FileText}
            trend={{ value: -2.1, isPositive: false }}
            description="Clientes em andamento"
          />
        </div>
        <div className="dashboard-glow">
          <StatsCard
            title="Mensagens Hoje"
            value="47"
            icon={MessageSquare}
            description="WhatsApp Business"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-goat-purple" />
              <h3 className="text-lg font-semibold text-white">Resumo do Pipeline</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50">
                <div className="text-2xl font-bold text-blue-400">5</div>
                <div className="text-xs text-goat-gray-400">Sem atendimento</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50">
                <div className="text-2xl font-bold text-yellow-400">8</div>
                <div className="text-xs text-goat-gray-400">Em atendimento</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50">
                <div className="text-2xl font-bold text-green-400">4</div>
                <div className="text-xs text-goat-gray-400">Reunião agendada</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50">
                <div className="text-2xl font-bold text-purple-400">3</div>
                <div className="text-xs text-goat-gray-400">Proposta enviada</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-goat-gray-900/50">
                <div className="text-2xl font-bold text-gray-400">3</div>
                <div className="text-xs text-goat-gray-400">Frio</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="dashboard-glow">
          <AlertCard />
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-goat-purple" />
          <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
        </div>
        
        <div className="space-y-3">
          {[
            { action: "Novo lead adicionado", client: "Empresa Tech Solutions", time: "há 2 horas" },
            { action: "Contrato renovado", client: "Marketing Digital Pro", time: "há 4 horas" },
            { action: "Pagamento recebido", client: "Consultoria ABC", time: "há 1 dia" },
            { action: "Reunião realizada", client: "Startup XYZ", time: "há 2 dias" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-goat-gray-900/30 border border-goat-gray-700">
              <div>
                <p className="text-white text-sm font-medium">{activity.action}</p>
                <p className="text-goat-gray-400 text-xs">{activity.client}</p>
              </div>
              <span className="text-goat-gray-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
