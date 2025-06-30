
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AlertCard } from "@/components/Dashboard/AlertCard";
import { PipelineCard } from "@/components/Dashboard/PipelineCard";
import { RecentActivityCard } from "@/components/Dashboard/RecentActivityCard";
import { DollarSign, Users, FileText, MessageSquare } from "lucide-react";

export default function Dashboard() {
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
          value={45230}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          description="Janeiro 2024"
          prefix="R$"
          delay={0}
        />
        <StatsCard
          title="Leads Ativos"
          value={23}
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
          description="Pipeline de vendas"
          delay={0.1}
        />
        <StatsCard
          title="Contratos Ativos"
          value={18}
          icon={FileText}
          trend={{ value: -2.1, isPositive: false }}
          description="Clientes em andamento"
          delay={0.2}
        />
        <StatsCard
          title="Mensagens Hoje"
          value={47}
          icon={MessageSquare}
          description="WhatsApp Business"
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Card */}
        <div className="lg:col-span-2">
          <PipelineCard />
        </div>

        {/* Alerts */}
        <div>
          <AlertCard />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivityCard />
    </div>
  );
}
