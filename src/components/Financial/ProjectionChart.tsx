import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface ContractProjection {
  clientName: string;
  monthlyValue: number;
  duration: number; // em meses
  startMonth: string; // formato YYYY-MM
}

interface ProjectionChartProps {
  contracts: ContractProjection[];
}

export function ProjectionChart({ contracts }: ProjectionChartProps) {
  // Gerar dados para os próximos 12 meses
  const generateMonthlyData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      let monthlyTotal = 0;
      
      // Calcular receita para cada contrato no mês
      contracts.forEach(contract => {
        const contractStart = new Date(contract.startMonth + '-01');
        const contractEnd = new Date(contractStart);
        contractEnd.setMonth(contractEnd.getMonth() + contract.duration);
        
        if (date >= contractStart && date < contractEnd) {
          monthlyTotal += contract.monthlyValue;
        }
      });
      
      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        monthKey,
        value: monthlyTotal,
        formattedValue: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(monthlyTotal)
      });
    }
    
    return months;
  };

  const monthlyData = generateMonthlyData();
  
  const chartConfig = {
    value: {
      label: "Faturamento",
      color: "#8b5cf6",
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalProjection = monthlyData.reduce((sum, month) => sum + month.value, 0);
  const averageMonthly = totalProjection / 12;

  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-goat-purple" />
        <h3 className="text-xl font-semibold text-white">Projeção de Faturamento</h3>
      </div>

      {/* KPIs em linha */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <p className="text-goat-gray-400 text-sm mb-2">Total Anual</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalProjection)}</p>
        </div>
        <div className="text-center">
          <p className="text-goat-gray-400 text-sm mb-2">Média Mensal</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(averageMonthly)}</p>
        </div>
        <div className="text-center">
          <p className="text-goat-gray-400 text-sm mb-2">Contratos Ativos</p>
          <p className="text-2xl font-bold text-white">{contracts.length}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80">
        <ChartContainer config={chartConfig}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    "Faturamento"
                  ]}
                />
              }
            />
            <Bar 
              dataKey="value" 
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
