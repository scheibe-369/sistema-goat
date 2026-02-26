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
      <Card className="premium-card p-6 animate-premium-in [animation-delay:100ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center border border-green-500/20">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {totalReceitas.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Faturamento Geral</p>
          </div>
        </div>
      </Card>

      <Card className="premium-card p-6 animate-premium-in [animation-delay:200ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center border border-green-500/20">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {receitasMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Faturamento do Mês</p>
          </div>
        </div>
      </Card>

      <Card className="premium-card p-6 animate-premium-in [animation-delay:300ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {despesasMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Despesas do Mês</p>
          </div>
        </div>
      </Card>

      <Card className="premium-card p-6 animate-premium-in [animation-delay:400ms]">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${lucroMes >= 0 ? 'bg-green-600/10 border-green-500/20' : 'bg-red-600/10 border-red-500/20'}`}>
            <PiggyBank className={`w-6 h-6 ${lucroMes >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${lucroMes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {lucroMes.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Lucro do Mês</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
