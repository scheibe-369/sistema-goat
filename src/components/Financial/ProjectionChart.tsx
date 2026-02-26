"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Definindo a interface para os dados dos contratos que o gráfico recebe
interface ContractProjection {
  clientName: string;
  monthlyValue: number;
  durationInMonths: number; // Changed from 'duration' to match the actual data structure
  startMonth: string; // formato "YYYY-MM"
}

interface ProjectionChartProps {
  contracts: ContractProjection[];
  activeContractsCount?: number; // Número real de contratos ativos (calculado externamente)
}

// Função para formatar o valor como moeda brasileira
const formatCurrency = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function ProjectionChart({ contracts = [], activeContractsCount }: ProjectionChartProps) {
  // --- LÓGICA DE PROCESSAMENTO DOS DADOS ---
  const processChartData = () => {
    try {
      const monthlyProjections: { [key: string]: number } = {};
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // getMonth() é 0-11

      console.log(`[CHART DEBUG] Hoje: ${today.toISOString().split('T')[0]}, Processando ${contracts.length} contratos`);

      // Validação dos contratos
      const validContracts = contracts.filter(contract =>
        contract &&
        typeof contract.monthlyValue === 'number' &&
        typeof contract.durationInMonths === 'number' &&
        typeof contract.startMonth === 'string' &&
        contract.startMonth.includes('-')
      );

      console.log(`[CHART DEBUG] Contratos válidos: ${validContracts.length}`);

      // Para cada contrato, adiciona seu valor mensal aos meses futuros de sua duração
      validContracts.forEach(contract => {
        try {
          const [startYear, startMonthNum] = contract.startMonth.split('-').map(Number);

          // Validação dos valores extraídos
          if (isNaN(startYear) || isNaN(startMonthNum)) return;

          console.log(`[CHART DEBUG] ${contract.clientName}: ${contract.durationInMonths} meses a partir de ${contract.startMonth}, R$ ${contract.monthlyValue}/mês`);

          for (let i = 0; i < contract.durationInMonths; i++) {
            let monthDate = new Date(startYear, startMonthNum - 1 + i, 1);

            // Consideramos apenas projeções a partir do mês atual
            if (monthDate.getFullYear() > currentYear || (monthDate.getFullYear() === currentYear && monthDate.getMonth() + 1 >= currentMonth)) {
              const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
              if (!monthlyProjections[monthKey]) {
                monthlyProjections[monthKey] = 0;
              }
              monthlyProjections[monthKey] += contract.monthlyValue;
              console.log(`[CHART DEBUG]   - Mês ${monthKey}: +R$ ${contract.monthlyValue} = R$ ${monthlyProjections[monthKey]}`);
            }
          }
        } catch (error) {
          console.error('Erro ao processar contrato:', contract, error);
        }
      });

      console.log('[CHART DEBUG] Projeções mensais:', monthlyProjections);

      // Pega os próximos 12 meses a partir do mês atual para exibir no gráfico
      const chartData = [];
      for (let i = 0; i < 12; i++) {
        let date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, '0')}`;

        // Alteração para formatar apenas o nome do mês
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        chartData.push({
          name: capitalizedMonth, // Ex: Jun, Jul, Ago...
          Projeção: monthlyProjections[key] || 0,
        });
      }

      return chartData;
    } catch (error) {
      console.error('Erro ao processar dados do gráfico:', error);
      return [];
    }
  };

  const data = processChartData();
  const totalProjection = data.reduce((sum, item) => sum + (item.Projeção || 0), 0);
  const monthlyAverage = data.length > 0 ? totalProjection / data.length : 0;

  // Usa o número real de contratos ativos se fornecido, caso contrário calcula baseado nos contratos filtrados
  const activeContractsNow = activeContractsCount !== undefined ? activeContractsCount : contracts.filter(c => {
    try {
      if (!c || !c.startMonth || typeof c.durationInMonths !== 'number') return false;

      const [startYear, startMonth] = c.startMonth.split('-').map(Number);
      if (isNaN(startYear) || isNaN(startMonth)) return false;

      const today = new Date();
      const startDate = new Date(startYear, startMonth - 1, 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + c.durationInMonths);

      return today >= startDate && today < endDate;
    } catch (error) {
      console.error('Erro ao verificar contrato ativo:', c, error);
      return false;
    }
  }).length;

  // --- FIM DA LÓGICA ---

  return (
    <Card className="premium-card p-6 animate-premium-in">
      <h3 className="text-lg font-semibold text-white mb-1">Projeção de Faturamento Anual</h3>
      <p className="text-goat-gray-400 text-sm mb-8 leading-relaxed">Previsão de receita com base nos contratos atuais para os próximos 12 meses.</p>

      {/* KPIs do Gráfico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-2">
        <div className="premium-glass p-4 rounded-xl border-white/[0.03] hover:border-primary/20 transition-colors">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Projeção Total (12 meses)</p>
          <p className="text-2xl font-bold text-white tabular-nums">{formatCurrency(totalProjection)}</p>
        </div>
        <div className="premium-glass p-4 rounded-xl border-white/[0.03] hover:border-primary/20 transition-colors">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Média Mensal</p>
          <p className="text-2xl font-bold text-white tabular-nums">{formatCurrency(monthlyAverage)}</p>
        </div>
        <div className="premium-glass p-4 rounded-xl border-white/[0.03] hover:border-primary/20 transition-colors">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Contratos Ativos (Hoje)</p>
          <p className="text-2xl font-bold text-white tabular-nums">{activeContractsNow}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[350px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="name"
                stroke="#A3A3A3"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#A3A3A3"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${Number(value) / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717', // bg-neutral-900
                  borderColor: '#404040', // border-neutral-700
                  color: '#FFFFFF',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#A3A3A3' }} // text-neutral-400
                formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
              />
              <Area
                type="monotone"
                dataKey="Projeção"
                stroke="#8B5CF6" // Cor da linha (roxo)
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProjection)"
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
  );
}
