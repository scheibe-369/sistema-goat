import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, AlertCircle, Calendar, TrendingDown, Repeat } from "lucide-react";
import { FinancialKPIs } from "@/components/Financial/FinancialKPIs";
import { ExpenseModal } from "@/components/Financial/ExpenseModal";
import { RecurringExpenseModal } from "@/components/Financial/RecurringExpenseModal";

interface FinancialEntry {
  id: string;
  client: string;
  monthlyValue: number;
  status: 'paid' | 'pending' | 'overdue';
  referenceMonth: string;
  paymentDate?: string;
  observations?: string;
}

interface Transaction {
  id: number;
  description: string;
  value: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
  status: string;
}

const mockFinancialEntries: FinancialEntry[] = [
  {
    id: '1',
    client: 'Tech Innovations',
    monthlyValue: 5000,
    status: 'paid',
    referenceMonth: '2024-01',
    paymentDate: '2024-01-05'
  },
  {
    id: '2',
    client: 'E-commerce Plus',
    monthlyValue: 3000,
    status: 'overdue',
    referenceMonth: '2024-01',
    observations: 'Cliente comunicou dificuldade financeira'
  },
  {
    id: '3',
    client: 'Startup XYZ',
    monthlyValue: 8000,
    status: 'paid',
    referenceMonth: '2024-01',
    paymentDate: '2024-01-10'
  },
  {
    id: '4',
    client: 'Consultoria Pro',
    monthlyValue: 4500,
    status: 'pending',
    referenceMonth: '2024-01'
  },
  {
    id: '5',
    client: 'Marketing Digital',
    monthlyValue: 6000,
    status: 'pending',
    referenceMonth: '2024-01'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 1,
    description: 'Pagamento Tech Innovations',
    value: 5000,
    type: 'receita',
    category: 'Serviços',
    date: '2024-01-05',
    status: 'Confirmado'
  },
  {
    id: 2,
    description: 'Pagamento Startup XYZ',
    value: 8000,
    type: 'receita',
    category: 'Serviços',
    date: '2024-01-10',
    status: 'Confirmado'
  },
  {
    id: 3,
    description: 'Aluguel escritório',
    value: 2500,
    type: 'despesa',
    category: 'Infraestrutura',
    date: '2024-01-01',
    status: 'Pago'
  },
  {
    id: 4,
    description: 'Software e ferramentas',
    value: 800,
    type: 'despesa',
    category: 'Tecnologia',
    date: '2024-01-15',
    status: 'Pago'
  }
];

const initialExpenses = [
  {
    id: 1,
    description: 'Aluguel escritório',
    value: 2500,
    category: 'Infraestrutura',
    date: '2024-01-01',
    status: 'Pago',
    isRecurring: true,
    recurrence: 'monthly'
  },
  {
    id: 2,
    description: 'Software e ferramentas',
    value: 800,
    category: 'Tecnologia',
    date: '2024-01-15',
    status: 'Pago',
    isRecurring: false
  },
  {
    id: 3,
    description: 'Marketing digital',
    value: 1200,
    category: 'Marketing',
    date: '2024-01-20',
    status: 'Pendente',
    isRecurring: false
  }
];

export default function Financial() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [expenses, setExpenses] = useState(initialExpenses);

  const handleAddExpense = (newExpense: any) => {
    setExpenses(prev => [...prev, newExpense]);
  };

  const getStatusBadge = (status: FinancialEntry['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600 text-white">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Em aberto</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600 text-white">Em atraso</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const paidEntries = mockFinancialEntries.filter(e => e.status === 'paid');
  const pendingEntries = mockFinancialEntries.filter(e => e.status === 'pending');
  const overdueEntries = mockFinancialEntries.filter(e => e.status === 'overdue');

  const totalPaid = paidEntries.reduce((sum, entry) => sum + entry.monthlyValue, 0);
  const totalPending = pendingEntries.reduce((sum, entry) => sum + entry.monthlyValue, 0);
  const totalOverdue = overdueEntries.reduce((sum, entry) => sum + entry.monthlyValue, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-goat-gray-400">Controle de faturamento e recebimentos</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Financial KPIs */}
      <FinancialKPIs transactions={transactions} />

      {overdueEntries.length > 0 && (
        <Card className="bg-red-900/20 border-red-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Pagamentos em Atraso</h3>
          </div>
          <div className="space-y-2">
            {overdueEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-red-900/10 rounded-lg border border-red-800">
                <div>
                  <p className="text-white font-medium">{entry.client}</p>
                  <p className="text-red-200 text-sm">Referência: {formatMonth(entry.referenceMonth)}</p>
                  {entry.observations && (
                    <p className="text-red-300 text-xs mt-1">{entry.observations}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">{formatCurrency(entry.monthlyValue)}</p>
                  <Button size="sm" variant="outline" className="mt-2 text-red-400 border-red-600 hover:bg-red-900/20">
                    Contatar Cliente
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Lançamentos Financeiros</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-white border-goat-gray-600">
                Janeiro 2024
              </Button>
              <Button variant="outline" size="sm" className="text-white border-goat-gray-600">
                Todos os Status
              </Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-goat-gray-700">
          {mockFinancialEntries.map((entry) => (
            <div key={entry.id} className="p-6 hover:bg-goat-gray-900/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{entry.client}</h4>
                    {getStatusBadge(entry.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-goat-gray-400">Valor:</span>
                      <p className="text-white font-semibold">{formatCurrency(entry.monthlyValue)}</p>
                    </div>
                    <div>
                      <span className="text-goat-gray-400">Referência:</span>
                      <p className="text-white">{formatMonth(entry.referenceMonth)}</p>
                    </div>
                    <div>
                      <span className="text-goat-gray-400">Data de Pagamento:</span>
                      <p className="text-white">{entry.paymentDate ? formatDate(entry.paymentDate) : '-'}</p>
                    </div>
                    <div>
                      <span className="text-goat-gray-400">Observações:</span>
                      <p className="text-white">{entry.observations || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-6">
                  {entry.status === 'pending' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Despesas Card - Updated */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Despesas do Mês</h3>
          </div>
          <div className="flex items-center gap-2">
            <RecurringExpenseModal onAddExpense={handleAddExpense} />
            <ExpenseModal onAddExpense={handleAddExpense} />
          </div>
        </div>
        
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{expense.description}</p>
                  {expense.isRecurring && (
                    <Badge className="bg-orange-600 text-white text-xs">
                      <Repeat className="w-3 h-3 mr-1" />
                      Recorrente
                    </Badge>
                  )}
                </div>
                <p className="text-goat-gray-400 text-sm">{expense.category} • {formatDate(expense.date)}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <p className="text-red-400 font-semibold">{formatCurrency(expense.value)}</p>
                <Badge className={expense.status === 'Pago' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                  {expense.status}
                </Badge>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-goat-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-goat-gray-400">Total de Despesas:</p>
              <p className="text-red-400 font-bold text-xl">
                {formatCurrency(expenses.reduce((sum, expense) => sum + expense.value, 0))}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-goat-purple" />
          <h3 className="text-lg font-semibold text-white">Projeção de Faturamento</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
            <p className="text-goat-gray-400 text-sm">Fevereiro 2024</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(26500)}</p>
            <p className="text-green-400 text-sm">+5% vs mês anterior</p>
          </div>
          <div className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
            <p className="text-goat-gray-400 text-sm">Março 2024</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(28000)}</p>
            <p className="text-green-400 text-sm">+6% vs mês anterior</p>
          </div>
          <div className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
            <p className="text-goat-gray-400 text-sm">Abril 2024</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(29500)}</p>
            <p className="text-green-400 text-sm">+5% vs mês anterior</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
