import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import {
    MessageSquare,
    Calendar,
    Target,
    TrendingUp,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    DollarSign,
    Star,
    Bot,
    Zap,
    HelpCircle
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell
} from "recharts";

import { useSdrMetrics, DashboardFilter } from "@/hooks/useSdrMetrics";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Removed unused imports
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SdrAgent() {
    const [period, setPeriod] = useState<DashboardFilter['period']>('month');
    const { metrics, isLoading } = useSdrMetrics({ period });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goat-purple"></div>
                <span className="ml-2">Carregando dados do agente...</span>
            </div>
        );
    }

    // fallback for missing metrics if any
    const {
        volumeData = [],
        outboundCount = 0,
        avgResponseTimeMinutes = 0,
        responseRate = 0,
        scheduled = 0,
        sdrRevenue = 0,
        optOutRate = 0,
        qualifiedRate = 0,
        avgFollowups = 0,
        showRate = 0,
        noShowRate = 0,
        rescheduledRate = 0,
        timeToScheduleStr = "N/A",
        qualityScore = 0,
        stepRates = [],
        funnelData = [],
        medianFollowups = 0,
        cancelRate = 0,
        inAttendanceToCustomerRate = 0,
        dropoffSteps = []
    } = metrics;

    const kpis = [
        { title: "Leads Acionados", value: metrics.totalLeadsContacted, icon: Users, sub: "Total no período" },
        { title: "Taxa de Resposta", value: `${responseRate.toFixed(1)}%`, icon: MessageSquare, sub: "Geral" },
        { title: "Agendamentos", value: scheduled, icon: Calendar, sub: "Bot" },
        { title: "Pipeline Gerado", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sdrRevenue), icon: DollarSign, sub: "Estimado" }
    ];

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Agente SDR</h1>
                    <p className="text-goat-gray-400">Monitoramento de performance e eficiência do bot</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setPeriod('day')}
                        className={`${period === 'day' ? 'bg-goat-purple text-white hover:bg-goat-purple/90' : 'bg-transparent text-white border border-goat-gray-600 hover:bg-goat-gray-800'}`}
                        size="sm"
                    >
                        24h
                    </Button>
                    <Button
                        onClick={() => setPeriod('week')}
                        className={`${period === 'week' ? 'bg-goat-purple text-white hover:bg-goat-purple/90' : 'bg-transparent text-white border border-goat-gray-600 hover:bg-goat-gray-800'}`}
                        size="sm"
                    >
                        7 dias
                    </Button>
                    <Button
                        onClick={() => setPeriod('month')}
                        className={`${period === 'month' ? 'bg-goat-purple text-white hover:bg-goat-purple/90' : 'bg-transparent text-white border border-goat-gray-600 hover:bg-goat-gray-800'}`}
                        size="sm"
                    >
                        30 dias
                    </Button>
                    <Button
                        onClick={() => setPeriod('all_time')}
                        className={`${period === 'all_time' ? 'bg-goat-purple text-white hover:bg-goat-purple/90' : 'bg-transparent text-white border border-goat-gray-600 hover:bg-goat-gray-800'}`}
                        size="sm"
                    >
                        Todo período
                    </Button>
                </div>
            </div>

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {kpis.map((kpi) => (
                    <StatsCard
                        key={kpi.title}
                        title={kpi.title}
                        value={kpi.value.toString()}
                        icon={kpi.icon}
                        description={kpi.sub}
                        className="dashboard-glow p-4"
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Entrega e Volume */}
                {/* 1. Entrega e Volume */}
                <Card className="bg-goat-gray-800 border-b border-r border-goat-gray-700 shadow-lg dashboard-glow p-6 transition-all hover:bg-goat-gray-800/90 group rounded-xl">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-goat-gray-700/50">
                        <div className="p-3 bg-goat-purple/10 rounded-xl group-hover:bg-goat-purple/20 transition-colors">
                            <TrendingUp className="w-6 h-6 text-goat-purple" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Entrega e Volume</h3>
                            <p className="text-sm text-goat-gray-400">Fluxo de mensagens e novos leads</p>
                        </div>
                    </div>

                    {/* KPIs Compactos */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* KPI 1 */}
                        <div className="bg-goat-gray-900/40 p-4 rounded-xl border border-goat-gray-800 hover:border-goat-purple/30 transition-all group/kpi">
                            <p className="text-3xl font-bold text-white tracking-tight mb-1 group-hover/kpi:text-goat-purple-light transition-colors">
                                {metrics.scheduled > 0 ? Math.round(outboundCount / metrics.scheduled) : (metrics.totalLeadsContacted > 0 ? "—" : 0)}
                            </p>
                            <p className="text-xs text-goat-gray-500 font-medium uppercase tracking-wider">Msgs / Meeting</p>
                        </div>

                        {/* KPI 2 */}
                        <div className="bg-goat-gray-900/40 p-4 rounded-xl border border-goat-gray-800 hover:border-goat-purple/30 transition-all group/kpi">
                            <p className="text-3xl font-bold text-white tracking-tight mb-1 group-hover/kpi:text-goat-purple-light transition-colors">
                                {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(outboundCount)}
                            </p>
                            <p className="text-xs text-goat-gray-500 font-medium uppercase tracking-wider">Total Msgs</p>
                        </div>

                        {/* KPI 3 (Novo: Leads Novos) */}
                        <div className="bg-goat-gray-900/40 p-4 rounded-xl border border-goat-gray-800 hover:border-goat-purple/30 transition-all group/kpi">
                            <p className="text-3xl font-bold text-white tracking-tight mb-1 group-hover/kpi:text-goat-purple-light transition-colors">
                                {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(
                                    volumeData.reduce((acc: number, cur: any) => acc + (cur.leads || 0), 0)
                                )}
                            </p>
                            <p className="text-xs text-goat-gray-500 font-medium uppercase tracking-wider">Leads Novos</p>
                        </div>
                    </div>

                    <div className="h-[280px] w-full mt-auto relative">
                        {volumeData.length === 0 || volumeData.every((d: any) => d.sent === 0 && d.leads === 0) ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-goat-gray-900/20 rounded-xl border border-dashed border-goat-gray-800">
                                <div className="p-4 bg-goat-gray-900 rounded-full mb-4 shadow-inner">
                                    <TrendingUp className="w-8 h-8 text-goat-gray-700" />
                                </div>
                                <p className="text-base font-semibold text-goat-gray-400">Sem dados no período</p>
                                <p className="text-sm text-goat-gray-600 mt-2 max-w-[220px]">
                                    Ajuste o filtro de período ou verifique a atividade do bot.
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#737373"
                                        fontSize={12}
                                        fontWeight={500}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        dy={12}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#171717',
                                            border: '1px solid #404040',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '13px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })}
                                    />
                                    <Bar
                                        dataKey="sent"
                                        name="Mensagens Enviadas"
                                        fill="#8B5CF6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                        fillOpacity={0.9}
                                    />
                                    <Bar
                                        dataKey="leads"
                                        name="Novos Leads"
                                        fill="#3B82F6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                        fillOpacity={0.9}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* 2. Engajamento Inicial */}
                {/* 2. Engajamento Inicial */}
                <Card className="bg-goat-gray-800 border-b border-r border-goat-gray-700 shadow-lg dashboard-glow p-6 transition-all hover:bg-goat-gray-800/90 group rounded-xl">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-goat-gray-700/50">
                        <div className="p-3 bg-goat-purple/10 rounded-xl group-hover:bg-goat-purple/20 transition-colors">
                            <Zap className="w-6 h-6 text-goat-purple" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Engajamento Inicial</h3>
                            <p className="text-sm text-goat-gray-400">Tempo de resposta e qualificação</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-10 pl-2">
                        {/* KPI 1 */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
                                <p className="text-xs text-goat-gray-400 font-medium uppercase tracking-wider">Tempo 1ª Resp</p>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-bold text-white tracking-tight">{avgResponseTimeMinutes}</p>
                                <span className="text-xs text-goat-gray-500 font-medium">min</span>
                            </div>
                        </div>

                        {/* KPI 2 */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
                                <p className="text-xs text-goat-gray-400 font-medium uppercase tracking-wider">Opt-out</p>
                            </div>
                            <p className="text-3xl font-bold text-white tracking-tight">{optOutRate.toFixed(1)}%</p>
                        </div>

                        {/* KPI 3 */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                <p className="text-xs text-goat-gray-400 font-medium uppercase tracking-wider">Qualificação</p>
                            </div>
                            <p className="text-3xl font-bold text-white tracking-tight">{qualifiedRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="h-[260px] w-full mt-auto relative">
                        {funnelData.length === 0 || funnelData.every((d: any) => d.value === 0) ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-goat-gray-900/20 rounded-xl border border-dashed border-goat-gray-800">
                                <div className="p-4 bg-goat-gray-900 rounded-full mb-4 shadow-inner">
                                    <Zap className="w-8 h-8 text-goat-gray-700" />
                                </div>
                                <p className="text-base font-semibold text-goat-gray-400">Sem dados de engajamento</p>
                                <p className="text-sm text-goat-gray-600 mt-2 max-w-[220px]">
                                    Aguarde novas interações com leads.
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={funnelData}
                                    layout="vertical"
                                    margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
                                    barCategoryGap={20}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#A3A3A3"
                                        fontSize={12}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        width={110}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={36} animationDuration={1000}>
                                        {funnelData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* 3. Drop-off por Etapa (SLA Funnel) */}
                <Card className="bg-goat-gray-800 border-goat-gray-700 dashboard-glow p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">Drop-off por Etapa</h3>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger>
                                    <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-goat-gray-900 border-goat-gray-700 max-w-xs">
                                    <p className="font-semibold mb-2">Como é calculado?</p>
                                    <p className="text-xs text-gray-300">
                                        Monitoramos quantos leads entram em cada etapa e quantos <strong>não avançam</strong> dentro do prazo estipulado (SLA).
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-400"><span className="text-red-400">●</span> <strong>Drop-off:</strong> Leads estagnados além do SLA.</p>
                                        <p className="text-xs text-gray-400"><span className="text-gray-400">●</span> <strong>Agendamento:</strong> Verifica leads pós-reunião sem proposta em 24h.</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">% de leads que não avançaram dentro do SLA configurado</p>

                    <div className="space-y-5">
                        {dropoffSteps.map((step: any, idx: number) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">{step.stage}</span>
                                        <span className="text-[10px] bg-goat-gray-900 border border-goat-gray-700 px-1.5 py-0.5 rounded text-gray-400">
                                            SLA: {step.slaLabel}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Progress Bar Container */}
                                    <div className="flex-1 h-3 bg-goat-gray-900 rounded-full overflow-hidden relative">
                                        {/* Background track */}
                                        <div className="absolute inset-0 bg-goat-gray-900" />

                                        {/* Fill bar */}
                                        {step.reached > 0 && step.rate > 0 && (
                                            <div
                                                className="h-full bg-gradient-to-r from-red-500/70 to-red-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(step.rate, 100)}%` }}
                                            />
                                        )}
                                    </div>

                                    {/* Value Label */}
                                    <div className="w-24 text-right">
                                        {step.reached > 0 ? (
                                            <div className="flex flex-col items-end leading-none">
                                                <span className="text-sm font-bold text-red-300">{step.rate}%</span>
                                                <span className="text-[10px] text-gray-500 mt-0.5">({step.notAdvanced}/{step.reached})</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-600">0% (0/0)</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600 mt-1 pl-1">Próxima: {step.nextStage}</p>
                            </div>
                        ))}

                        {dropoffSteps.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Nenhum dado de drop-off disponível para o período.
                            </div>
                        )}
                    </div>
                </Card>

                {/* 4. Agendamento & Show Rate */}
                <Card className="bg-goat-gray-800 border-goat-gray-700 dashboard-glow p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-goat-purple" />
                        <h3 className="text-lg font-semibold text-white">Agendamento & Show Rate</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="bg-goat-gray-900/30 p-3 rounded-lg border border-goat-gray-700">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-400 text-xs">Taxa de Agend.</span>
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-xl font-bold text-white">{metrics.totalLeadsContacted > 0 ? (scheduled / metrics.totalLeadsContacted * 100).toFixed(1) : 0}%</p>
                            </div>
                            <div className="bg-goat-gray-900/30 p-3 rounded-lg border border-goat-gray-700">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-400 text-xs">Reagendamentos</span>
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                </div>
                                <p className="text-xl font-bold text-white">{rescheduledRate.toFixed(1)}%</p>
                            </div>
                            <div className="bg-goat-gray-900/30 p-3 rounded-lg border border-goat-gray-700">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-400 text-xs">Cancelamento</span>
                                    <XCircle className="w-4 h-4 text-gray-500" />
                                </div>
                                <p className="text-xl font-bold text-white">{cancelRate.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-goat-gray-900/30 p-3 rounded-lg border border-goat-gray-700">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-400 text-xs">Show Rate</span>
                                    <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xl font-bold text-white">{showRate.toFixed(0)}%</p>
                                <p className="text-[10px] text-gray-500">Comparecimento</p>
                            </div>
                            <div className="bg-goat-gray-900/30 p-3 rounded-lg border border-goat-gray-700">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-400 text-xs">No-Show</span>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                </div>
                                <p className="text-xl font-bold text-white">{noShowRate.toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-goat-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-400">Tempo até agendar:</span>
                        <span className="font-mono text-white">{timeToScheduleStr} (média)</span>
                    </div>
                </Card>
            </div>

            {/* 5. Conversão e Impacto no Negócio */}
            <Card className="bg-goat-gray-800 border-goat-gray-700 dashboard-glow p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-goat-purple" />
                    <h3 className="text-lg font-semibold text-white">Impacto no Negócio</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-goat-gray-700">
                    <div className="px-4">
                        <p className="text-gray-400 text-sm mb-2">Conversão Real (Em Atend. → Cliente)</p>
                        <p className="text-3xl font-bold text-white">{inAttendanceToCustomerRate.toFixed(1)}%</p>
                        <p className="text-xs text-goat-gray-500 mt-1">SDR % fechamento</p>
                    </div>
                    <div className="px-4 pt-4 md:pt-0">
                        <p className="text-gray-400 text-sm mb-2">Receita Atribuída (MRR)</p>
                        <p className="text-3xl font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sdrRevenue)}</p>
                        <p className="text-xs text-goat-gray-500 mt-1">Origem: Bot SDR</p>
                    </div>
                    <div className="px-4 pt-4 md:pt-0">
                        <p className="text-gray-400 text-sm mb-2">Qualidade do Lead</p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 text-yellow-400 ${i <= qualityScore ? 'fill-yellow-400' : ''}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xl font-bold text-white">{qualityScore.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-goat-gray-500 mt-1">Score médio (Fit + Engajamento)</p>
                    </div>
                </div>
            </Card>

        </div>
    );
}
