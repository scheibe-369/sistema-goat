
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts";
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
        <h3 className="text-lg font-semibold text-white">Projeção de Faturamento Anual</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
          <p className="text-goat-gray-400 text-sm">Projeção Total (12 meses)</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalProjection)}</p>
        </div>
        <div className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
          <p className="text-goat-gray-400 text-sm">Média Mensal</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(averageMonthly)}</p>
        </div>
        <div className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
          <p className="text-goat-gray-400 text-sm">Contratos Ativos</p>
          <p className="text-2xl font-bold text-white">{contracts.length}</p>
        </div>
      </div>

      <div className="h-80">
        <ChartContainer config={chartConfig}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatCurrency}
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

      <div className="mt-6 pt-4 border-t border-goat-gray-700">
        <h4 className="text-white font-medium mb-3">Contratos Considerados na Projeção:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contracts.map((contract, index) => (
            <div key={index} className="p-3 rounded-lg bg-goat-gray-900/30 border border-goat-gray-700">
              <p className="text-white font-medium text-sm">{contract.clientName}</p>
              <p className="text-goat-gray-400 text-xs">
                {formatCurrency(contract.monthlyValue)}/mês • {contract.duration} meses
              </p>
              <p className="text-goat-gray-400 text-xs">
                Início: {new Date(contract.startMonth + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
