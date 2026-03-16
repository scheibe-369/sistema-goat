import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DashboardFilter {
    period: string; // 'day', 'week', 'month', '30d', '90d', 'custom'
    start?: Date;
    end?: Date;
}

// NEW: Drop-off Step Type
export interface DropoffStep {
    stage: string;
    nextStage: string;
    entered: number;     // "reached" from RPC
    dropped: number;     // "notAdvanced" from RPC (kept "dropped" for hook compat or update)
    // Actually RPC returns: reached, advanced, notAdvanced. Let's map.
    reached: number;
    advanced: number;
    notAdvanced: number;
    rate: number;
    slaLabel: string;
}

export function useSdrMetrics(filter: DashboardFilter = { period: 'month' }) {
    const { session } = useAuth();
    const userId = session?.user?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["sdr-metrics", userId, filter.period, filter.start, filter.end],
        queryFn: async () => {
            // For local development, return mock data
            if (!userId || userId === 'mock-user-id') {
                console.log('DEBUG - Using mock SDR metrics data for period:', filter.period);
                
                // Variar os dados com base no período
                let mockData;
                
                switch (filter.period) {
                    case 'day':
                        mockData = {
                            metrics: {
                                totalLeadsContacted: 12,
                                activeLeads: 5,
                                responseRate: 92,
                                avgResponseTimeMinutes: 2,
                                scheduled: 1,
                                sdrRevenue: 1500.00,
                                outboundCount: 15,
                                inboundCount: 3,
                                qualifiedRate: 85,
                                avgFollowups: 2.1,
                                qualityScore: 9.2,
                            },
                            dropoffSteps: [
                                { stage: 'Novo Contato', nextStage: 'Em Atendimento', reached: 12, advanced: 10, notAdvanced: 2, rate: 83.3, slaLabel: 'Dentro do SLA' },
                                { stage: 'Em Atendimento', nextStage: 'Agendado', reached: 10, advanced: 1, notAdvanced: 9, rate: 10, slaLabel: 'Dentro do SLA' }
                            ]
                        };
                        break;
                    case 'week':
                        mockData = {
                            metrics: {
                                totalLeadsContacted: 58,
                                activeLeads: 18,
                                responseRate: 84,
                                avgResponseTimeMinutes: 4,
                                scheduled: 4,
                                sdrRevenue: 8500.00,
                                outboundCount: 65,
                                inboundCount: 12,
                                qualifiedRate: 72,
                                avgFollowups: 3.1,
                                qualityScore: 8.8,
                            },
                            dropoffSteps: [
                                { stage: 'Novo Contato', nextStage: 'Em Atendimento', reached: 58, advanced: 45, notAdvanced: 13, rate: 77.5, slaLabel: 'Dentro do SLA' },
                                { stage: 'Em Atendimento', nextStage: 'Agendado', reached: 45, advanced: 4, notAdvanced: 41, rate: 8.8, slaLabel: 'Dentro do SLA' }
                            ]
                        };
                        break;
                    case 'total':
                    case 'all_time':
                        mockData = {
                            metrics: {
                                totalLeadsContacted: 1245,
                                activeLeads: 89,
                                responseRate: 75,
                                avgResponseTimeMinutes: 8,
                                scheduled: 98,
                                sdrRevenue: 280000.00,
                                outboundCount: 1100,
                                inboundCount: 320,
                                qualifiedRate: 60,
                                avgFollowups: 4.2,
                                qualityScore: 8.1,
                            },
                            dropoffSteps: [
                                { stage: 'Novo Contato', nextStage: 'Em Atendimento', reached: 1245, advanced: 980, notAdvanced: 265, rate: 78.7, slaLabel: 'Dentro do SLA' },
                                { stage: 'Em Atendimento', nextStage: 'Agendado', reached: 980, advanced: 98, notAdvanced: 882, rate: 10, slaLabel: 'Atenção' }
                            ]
                        };
                        break;
                    case 'month':
                    default:
                        mockData = {
                            metrics: {
                                totalLeadsContacted: 154,
                                activeLeads: 42,
                                responseRate: 78,
                                avgResponseTimeMinutes: 5,
                                scheduled: 12,
                                sdrRevenue: 35000.00,
                                outboundCount: 120,
                                inboundCount: 34,
                                qualifiedRate: 65,
                                avgFollowups: 3.5,
                                qualityScore: 8.5,
                            },
                            dropoffSteps: [
                                { stage: 'Novo Contato', nextStage: 'Em Atendimento', reached: 154, advanced: 120, notAdvanced: 34, rate: 77.9, slaLabel: 'Dentro do SLA' },
                                { stage: 'Em Atendimento', nextStage: 'Agendado', reached: 120, advanced: 12, notAdvanced: 108, rate: 10, slaLabel: 'Atenção' }
                            ]
                        };
                }
                return mockData;
            }

            // Prepare args for RPC
            const args: any = {
                p_user_id: userId,
                p_period: filter.period
            };

            if (filter.period === 'all_time') {
                args.p_start = new Date('2000-01-01').toISOString();
            } else {
                // Only set start/end if explicitly provided and not all_time mode
                if (filter.start) args.p_start = filter.start.toISOString();
                if (filter.end) args.p_end = filter.end.toISOString();
            }

            const { data, error } = await (supabase.rpc as any)('sdr_metrics', args);

            if (error) {
                console.error("Error fetching SDR metrics:", error);
                throw error;
            }

            return data as any;
        },
        enabled: !!userId,
    });

    const metrics = data?.metrics || {};
    // dropoffSteps está no nível raiz de data, não dentro de metrics
    // A RPC agora retorna todos os campos necessários (stage, nextStage, reached, advanced, notAdvanced, rate, slaLabel)
    const dropoffStepsFromRpc = (data?.dropoffSteps || []).map((step: any) => ({
        stage: step.stage || '',
        nextStage: step.nextStage || 'N/A',
        entered: step.reached || 0,
        dropped: step.notAdvanced || 0,
        reached: step.reached || 0,
        advanced: step.advanced || 0,
        notAdvanced: step.notAdvanced || 0,
        rate: step.rate || 0,
        slaLabel: step.slaLabel || ''
    }));

    // Ensure defaults for all fields to prevent null crashes
    const safeMetrics = {
        totalLeadsContacted: metrics.totalLeadsContacted || 0,
        activeLeads: metrics.activeLeads || 0,
        responseRate: metrics.responseRate || 0,
        avgResponseTimeMinutes: metrics.avgResponseTimeMinutes || 0,
        scheduled: metrics.scheduled || 0,
        sdrRevenue: metrics.sdrRevenue || 0,
        volumeData: metrics.volumeData || [],
        outboundCount: metrics.outboundCount || 0,
        inboundCount: metrics.inboundCount || 0,
        optOutRate: metrics.optOutRate || 0,
        qualifiedRate: metrics.qualifiedRate || 0,
        avgFollowups: metrics.avgFollowups || 0,
        showRate: metrics.showRate || 0,
        noShowRate: metrics.noShowRate || 0,
        noShowCount: metrics.noShowCount || 0,
        rescheduledRate: metrics.rescheduledRate || 0,
        timeToScheduleStr: metrics.timeToScheduleStr || "N/A",
        qualityScore: metrics.qualityScore || 0,
        icpFitRate: metrics.icpFitRate || 0,
        medianFollowups: metrics.medianFollowups || 0,
        cancelRate: metrics.cancelRate || 0,
        stepRates: metrics.stepRates || [],
        funnelData: metrics.funnelData || [],
        inAttendanceToCustomerRate: metrics.inAttendanceToCustomerRate || 0,
        dropoffSteps: (dropoffStepsFromRpc || []) as DropoffStep[],
    };

    return {
        isLoading,
        error,
        metrics: {
            ...safeMetrics,
            // Helper for matching previous interface if needed, or stick to new one
            kpis: [
                { title: "Leads Acionados", value: safeMetrics.totalLeadsContacted, sub: "Total" },
                { title: "Taxa de Resposta", value: `${safeMetrics.responseRate}%`, sub: "Geral" },
                { title: "Agendamentos", value: safeMetrics.scheduled, sub: "Bot" },
                { title: "Pipeline Gerado", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeMetrics.sdrRevenue), sub: "Estimado" }
            ]
        }
    };
}
