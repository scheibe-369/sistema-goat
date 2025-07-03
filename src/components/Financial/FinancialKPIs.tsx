import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

interface FinancialKPIsProps {
  totalReceitas: number;
  receitasMes: number;
  despesasMes: number;
  lucroMes: number;
}

export function FinancialKPIs({ totalReceitas, receitasMes, despesasMes, lucroMes }: FinancialKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {totalReceitas.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Faturamento Geral</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {receitasMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Faturamento do Mês</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {despesasMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Despesas do Mês</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${lucroMes >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
            <PiggyBank className={`w-6 h-6 ${lucroMes >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${lucroMes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {lucroMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Lucro do Mês</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
