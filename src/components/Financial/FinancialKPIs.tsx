
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

interface Transaction {
  id: number;
  description: string;
  value: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
  status: string;
}

interface FinancialKPIsProps {
  transactions: Transaction[];
}

export function FinancialKPIs({ transactions }: FinancialKPIsProps) {
  const receitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
  const despesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
  const saldo = receitas - despesas;
  const totalTransactions = transactions.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              R$ {receitas.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Receitas</p>
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
              R$ {despesas.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Despesas</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            saldo >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'
          }`}>
            <PiggyBank className={`w-6 h-6 ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {saldo.toLocaleString('pt-BR')}
            </p>
            <p className="text-goat-gray-400 text-sm">Saldo</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-goat-purple/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-goat-purple" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalTransactions}</p>
            <p className="text-goat-gray-400 text-sm">Total de Transações</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
