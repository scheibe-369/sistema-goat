import { StatsCard } from "@/components/Dashboard/StatsCard";
import { AlertCard } from "@/components/Dashboard/AlertCard";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";

import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";
import { useStages } from "@/hooks/useStages";
import { useLeads } from "@/hooks/useLeads";
import { useFinancialEntries } from "@/hooks/useFinancialEntries";
import { useExpenses } from "@/hooks/useExpenses";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RevenueYoYChart } from "@/components/Dashboard/RevenueYoYChart";

export default function Dashboard() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [] } = useContracts();
  const { stages = [] } = useStages();
  const { leads = [] } = useLeads();
  const { financialEntries = [] } = useFinancialEntries();
  const { expenses = [] } = useExpenses();

  // ===== Helpers =====
  const parseLocalDate = (dateString: string) => {
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    return new Date(year, month, day);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number.isFinite(value) ? value : 0
    );

  const norm = (s: string) =>
    (s || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const safeParseDate = (dateString?: string) => {
    if (!dateString) return null;

    if (dateString.includes("T")) {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? null : d;
    }

    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      const dt = new Date(y, (m || 1) - 1, d || 1);
      return isNaN(dt.getTime()) ? null : dt;
    }

    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
  };

  // ===== Métricas topo =====
  const activeContracts = contracts.filter((c: any) => c?.status === "active");
  const monthlyRevenue = activeContracts.reduce(
    (total: number, c: any) => total + (Number(c?.monthly_value) || 0),
    0
  );
  const arr = monthlyRevenue * 12;

  const activeClients = clients.filter((client: any) =>
    (client?.tags || []).includes("Ativo")
  ).length;

  // Contratos a vencer (30 dias)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  const expiringIn30Days = contracts.filter((c: any) => {
    if (!c) return false;
    if (c.status === "expiring") return true;

    const end = safeParseDate(c.end_date);
    if (!end) return false;

    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    const limit = new Date(in30);
    limit.setHours(23, 59, 59, 999);

    return endDay >= today && endDay <= limit;
  }).length;

  // ===== KPIs Saúde Financeira =====
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const receitasMes = (financialEntries || []).reduce((sum: number, entry: any) => {
    if (!entry?.due_date || entry?.status !== "paid") return sum;
    try {
      const d = parseLocalDate(entry.due_date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + (Number(entry.amount) || 0);
      }
    } catch {}
    return sum;
  }, 0);

  const despesasMes = (expenses || []).reduce((sum: number, expense: any) => {
    if (!expense?.date) return sum;
    try {
      const d = parseLocalDate(expense.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + (Number(expense.amount) || 0);
      }
    } catch {}
    return sum;
  }, 0);

  const lucroMes = receitasMes - despesasMes;

  const aReceber7d = (financialEntries || []).reduce((sum: number, entry: any) => {
    if (!entry?.due_date || entry?.status !== "pending") return sum;
    try {
      const dueDate = parseLocalDate(entry.due_date);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate >= today && dueDate <= in7) {
        return sum + (Number(entry.amount) || 0);
      }
    } catch {}
    return sum;
  }, 0);

  const vencidos = (financialEntries || []).reduce((sum: number, entry: any) => {
    if (!entry?.due_date || entry?.status !== "pending") return sum;
    try {
      const dueDate = parseLocalDate(entry.due_date);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        return sum + (Number(entry.amount) || 0);
      }
    } catch {}
    return sum;
  }, 0);

  // ===== Funil de Prospecção (operacional) =====
  const EXCLUDED_FUNNEL_STAGES = new Set(["mentorado", "cliente", "geladeira"]);

  const getStageCountByName = (names: string[]): number => {
    const normalizedNames = names.map((n) => norm(n));
    const matchingStageIds = stages
      .filter((s: any) => normalizedNames.includes(norm(String(s?.name || ""))))
      .map((s: any) => s.id);
    return leads.filter((l: any) => matchingStageIds.includes(l?.stage)).length;
  };

  const getStageCountByPredicate = (predicate: (normalizedName: string) => boolean): number => {
    const matchingStageIds = stages
      .filter((s: any) => predicate(norm(String(s?.name || ""))))
      .map((s: any) => s.id);
    return leads.filter((l: any) => matchingStageIds.includes(l?.stage)).length;
  };

  const funnelStagesFiltered = stages.filter((s: any) => {
    const name = norm(String(s?.name || ""));
    return !EXCLUDED_FUNNEL_STAGES.has(name);
  });

  const leadsByStage = (stageId: string) =>
    leads.filter((lead: any) => lead?.stage === stageId).length;

  const stagesWithLeads = funnelStagesFiltered
    .map((s: any) => ({ ...s, count: leadsByStage(s.id) }))
    .filter((s: any) => (s?.count || 0) > 0);

  const totalLeadsInFunnel = stagesWithLeads.reduce(
    (acc: number, s: any) => acc + (Number(s?.count) || 0),
    0
  );

  const semAtendimento = getStageCountByName(["Sem Atendimento"]);
  const emAtendimento = getStageCountByName(["Em Atendimento"]);
  const reunioesAgendadas = getStageCountByName(["Reunião Agendada"]);
  const propostasEnviadas = getStageCountByName(["Proposta Enviada"]);
  const followUp = getStageCountByPredicate((n) => n.includes("follow") || n.startsWith("followup"));

  const funnelChartData = stagesWithLeads.map((s: any) => ({
    name: String(s?.name || ""),
    Leads: Number(s?.count || 0),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="-mt-2">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-goat-gray-400">Visão geral do seu CRM</p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(10, 1fr)",
          gap: "16px",
        }}
      >
        {/* ===== TOP ROW (4 cards) ===== */}

        <div style={{ gridColumn: "1", gridRow: "1" }}>
          <StatsCard
            title="MRR (Mensal)"
            value={formatCurrency(monthlyRevenue)}
            icon={DollarSign}
            description="Contratos ativos"
            className="dashboard-glow p-4"
          />
        </div>

        <div style={{ gridColumn: "2", gridRow: "1" }}>
          <StatsCard
            title="ARR (Anual)"
            value={formatCurrency(arr)}
            icon={TrendingUp}
            description="MRR × 12"
            className="dashboard-glow p-4"
          />
        </div>

        <div style={{ gridColumn: "3", gridRow: "1" }}>
          <StatsCard
            title="Clientes Ativos"
            value={activeClients.toString()}
            icon={Users}
            description="Com tag Ativo"
            className="dashboard-glow p-4"
          />
        </div>

        <div style={{ gridColumn: "4", gridRow: "1" }}>
          <StatsCard
            title="A vencer (30 dias)"
            value={expiringIn30Days.toString()}
            icon={Calendar}
            description="Risco de churn"
            className="dashboard-glow p-4"
          />
        </div>

        {/* ===== SAÚDE FINANCEIRA (linha 2-4) ===== */}
        <div style={{ gridColumn: "1 / 5", gridRow: "2 / 5", display: "flex", flexDirection: "column" }}>
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow h-full relative overflow-hidden">
            {/* brilho suave */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 60%)" }}
            />

            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-goat-purple" />
              <h2 className="text-lg font-semibold text-white">Saúde Financeira</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-goat-gray-900/50 p-4 rounded-lg">
                <p className="text-goat-gray-400 text-xs mb-1">Receitas (mês)</p>
                <p className="text-xl font-bold text-white">{formatCurrency(receitasMes)}</p>
              </div>

              <div className="bg-goat-gray-900/50 p-4 rounded-lg">
                <p className="text-goat-gray-400 text-xs mb-1">Despesas (mês)</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(despesasMes)}</p>
              </div>

              <div className="bg-goat-gray-900/50 p-4 rounded-lg">
                <p className="text-goat-gray-400 text-xs mb-1">Lucro (mês)</p>
                <p className={`text-xl font-bold ${lucroMes >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(lucroMes)}
                </p>
              </div>

              <div className="bg-goat-gray-900/50 p-4 rounded-lg">
                <p className="text-goat-gray-400 text-xs mb-1">A receber (7d)</p>
                <p className="text-xl font-bold text-yellow-400">{formatCurrency(aReceber7d)}</p>
              </div>

              <div className="bg-goat-gray-900/50 p-4 rounded-lg">
                <p className="text-goat-gray-400 text-xs mb-1">Vencidos</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(vencidos)}</p>
              </div>

              <div className="bg-goat-gray-900/50 p-4 rounded-lg">
                <p className="text-goat-gray-400 text-xs mb-1">Contratos a vencer</p>
                <p className="text-xl font-bold text-white">{expiringIn30Days}</p>
              </div>
            </div>

            {/* Novo gráfico Ano a Ano */}
            <div className="mt-6">
              <RevenueYoYChart financialEntries={financialEntries as any[]} />
            </div>
          </Card>
        </div>

        {/* ===== ALERTAS (colunas 1-2, linhas 5-7) ===== */}
        <div style={{ gridColumn: "1 / 3", gridRow: "5 / 8", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <AlertCard className="dashboard-glow p-4" limit={3} />
        </div>

        {/* ===== FUNIL (colunas 3-4, linhas 5-7) ===== */}
        <div style={{ gridColumn: "3 / 5", gridRow: "5 / 8", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 dashboard-glow h-full relative overflow-hidden">
            <div
              className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-15"
              style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 60%)" }}
            />

            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-goat-purple" />
                  <span className="text-white font-semibold text-base">Funil de Prospecção</span>
                </div>
                <p className="text-goat-gray-400 text-sm mt-1">
                  Acompanhamento operacional (prospecção fria).
                </p>
              </div>

              <span className="text-goat-gray-300 text-sm">{totalLeadsInFunnel} lead(s)</span>
            </div>

            {/* KPIs (operacionais) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div className="bg-goat-gray-900/50 p-3 rounded-lg">
                <p className="text-goat-gray-400 text-xs">Sem atendimento</p>
                <p className="text-xl font-bold text-white">{semAtendimento}</p>
              </div>
              <div className="bg-goat-gray-900/50 p-3 rounded-lg">
                <p className="text-goat-gray-400 text-xs">Em atendimento</p>
                <p className="text-xl font-bold text-white">{emAtendimento}</p>
              </div>
              <div className="bg-goat-gray-900/50 p-3 rounded-lg">
                <p className="text-goat-gray-400 text-xs">Reuniões</p>
                <p className="text-xl font-bold text-white">{reunioesAgendadas}</p>
              </div>
              <div className="bg-goat-gray-900/50 p-3 rounded-lg">
                <p className="text-goat-gray-400 text-xs">Propostas</p>
                <p className="text-xl font-bold text-white">{propostasEnviadas}</p>
              </div>
              <div className="bg-goat-gray-900/50 p-3 rounded-lg">
                <p className="text-goat-gray-400 text-xs">Follow-up</p>
                <p className="text-xl font-bold text-white">{followUp}</p>
              </div>
            </div>

            {/* Gráfico do funil (sem labels no eixo X, só tooltip) */}
            <div className="w-full h-[360px]">
              {funnelChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={funnelChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />

                    <XAxis dataKey="name" hide />

                    <YAxis
                      stroke="#A3A3A3"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={32}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#404040",
                        color: "#FFFFFF",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "#A3A3A3" }}
                      formatter={(value) => [Number(value), "Leads"]}
                    />

                    <Area
                      type="monotone"
                      dataKey="Leads"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFunnel)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-goat-gray-400">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ===== Clientes Recentes (colunas 1-4, linhas 8-10) ===== */}
        <div style={{ gridColumn: "1 / 5", gridRow: "8 / 11", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-4 dashboard-glow animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-goat-purple" />
              <h3 className="text-lg font-semibold text-white">Clientes Recentes</h3>
            </div>

            <div className="space-y-3">
              {clients.slice(0, 4).map((client: any, index: number) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-goat-gray-900/30 border border-goat-gray-700 dashboard-glow animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{client.company}</p>
                    <p className="text-goat-gray-400 text-xs">Responsável: {client.responsible}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-goat-gray-500 text-xs">
                      {new Date(client.created_at || "").toLocaleDateString("pt-BR")}
                    </span>
                    {client.plan && <p className="text-goat-purple text-xs mt-1">{client.plan}</p>}
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
