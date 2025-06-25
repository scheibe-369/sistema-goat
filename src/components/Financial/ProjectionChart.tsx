
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
    <Card className="bg-white border border-gray-200 p-8">
      <div className="mb-8">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Projeção de Faturamento</h3>
        <p className="text-gray-500 text-sm">Próximos 12 meses</p>
      </div>
      
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div>
          <p className="text-gray-500 text-sm mb-1">Total Anual</p>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalProjection)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">Média Mensal</p>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(averageMonthly)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">Contratos</p>
          <p className="text-2xl font-semibold text-gray-900">{contracts.length}</p>
        </div>
      </div>

      <div className="h-80 mb-8">
        <ChartContainer config={chartConfig}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280"
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
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Contratos Ativos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contracts.map((contract, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
              <p className="font-medium text-gray-900 text-sm mb-1">{contract.clientName}</p>
              <p className="text-gray-600 text-xs mb-1">
                {formatCurrency(contract.monthlyValue)}/mês
              </p>
              <p className="text-gray-500 text-xs">
                {contract.duration} meses • Início: {new Date(contract.startMonth + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
