"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Definindo a interface para os dados dos contratos que o gráfico recebe
interface ContractProjection {
  clientName: string;
  monthlyValue: number;
  duration: number; // em meses
  startMonth: string; // formato "YYYY-MM"
}

interface ProjectionChartProps {
  contracts: ContractProjection[];
}

// Função para formatar o valor como moeda brasileira
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ProjectionChart({ contracts }: ProjectionChartProps) {
  // --- LÓGICA DE PROCESSAMENTO DOS DADOS ---
  const processChartData = () => {
    const monthlyProjections: { [key: string]: number } = {};
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() é 0-11

    // Para cada contrato, adiciona seu valor mensal aos meses futuros de sua duração
    contracts.forEach(contract => {
      const [startYear, startMonthNum] = contract.startMonth.split('-').map(Number);
      
      for (let i = 0; i < contract.duration; i++) {
        let monthDate = new Date(startYear, startMonthNum - 1 + i, 1);
        
        // Consideramos apenas projeções a partir do mês atual
        if (monthDate.getFullYear() > currentYear || (monthDate.getFullYear() === currentYear && monthDate.getMonth() + 1 >= currentMonth)) {
          const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyProjections[monthKey]) {
            monthlyProjections[monthKey] = 0;
          }
          monthlyProjections[monthKey] += contract.monthlyValue;
        }
      }
    });

    // Pega os próximos 12 meses a partir do mês atual para exibir no gráfico
    const chartData = [];
    for (let i = 0; i < 12; i++) {
      let date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      chartData.push({
        name: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''), // Ex: jul/25
        Projeção: monthlyProjections[key] || 0,
      });
    }

    return chartData;
  };

  const data = processChartData();
  const totalProjection = data.reduce((sum, item) => sum + item.Projeção, 0);
  const monthlyAverage = totalProjection / (data.length || 1);
  const activeContractsNow = contracts.filter(c => {
    const [startYear, startMonth] = c.startMonth.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + c.duration);
    return today >= startDate && today < endDate;
  }).length;
  // --- FIM DA LÓGICA ---

  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Projeção de Faturamento Anual</h3>
      <p className="text-goat-gray-400 text-sm mb-6">Previsão de receita com base nos contratos atuais para os próximos 12 meses.</p>

      {/* KPIs do Gráfico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Projeção Total (12 meses)</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalProjection)}</p>
        </div>
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Média Mensal</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(monthlyAverage)}</p>
        </div>
        <div className="bg-goat-gray-900/50 p-4 rounded-lg">
          <p className="text-goat-gray-400 text-sm">Contratos Ativos (Hoje)</p>
          <p className="text-2xl font-bold text-white">{activeContractsNow}</p>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
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
      </div>
    </Card>
  );
}