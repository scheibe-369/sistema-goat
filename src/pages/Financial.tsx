import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, AlertCircle, Calendar, TrendingDown, Repeat, Check, Trash2 } from "lucide-react";
import { FinancialKPIs } from "@/components/Financial/FinancialKPIs";
import { ExpenseModal } from "@/components/Financial/ExpenseModal";
import { ProjectionChart } from "@/components/Financial/ProjectionChart";

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

// Dados de exemplo para contratos com duração específica
const contractProjections = [
  {
    clientName: 'Tech Innovations',
    monthlyValue: 5000,
    duration: 12,
    startMonth: '2024-01'
  },
  {
    clientName: 'E-commerce Plus',
    monthlyValue: 3000,
    duration: 6,
    startMonth: '2024-02'
  },
  {
    clientName: 'Startup XYZ',
    monthlyValue: 8000,
    duration: 18,
    startMonth: '2024-01'
  },
  {
    clientName: 'Consultoria Pro',
    monthlyValue: 4500,
    duration: 8,
    startMonth: '2024-03'
  },
  {
    clientName: 'Marketing Digital',
    monthlyValue: 6000,
    duration: 12,
    startMonth: '2024-01'
  },
  {
    clientName: 'Novo Cliente A',
    monthlyValue: 2500,
    duration: 4,
    startMonth: '2024-04'
  },
  {
    clientName: 'Novo Cliente B',
    monthlyValue: 7000,
    duration: 10,
    startMonth: '2024-05'
  }
];

export default function Financial() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(mockFinancialEntries);

  const handleAddExpense = (newExpense: any) => {
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleToggleExpenseStatus = (expenseId: number) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status: expense.status === 'Pago' ? 'Pendente' : 'Pago' }
          : expense
      )
    );
  };

  const handleDeleteExpense = (expenseId: number) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  const handleTogglePaymentStatus = (entryId: string) => {
    setFinancialEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              status: entry.status === 'pending' ? 'paid' : 'pending',
              paymentDate: entry.status === 'pending' ? new Date().toISOString().split('T')[0] : undefined
            }
          : entry
      )
    );
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

  const paidEntries = financialEntries.filter(e => e.status === 'paid');
  const pendingEntries = financialEntries.filter(e => e.status === 'pending');
  const overdueEntries = financialEntries.filter(e => e.status === 'overdue');

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

        <div className="space-y-3 p-6">
          {financialEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
              <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                {/* Coluna 1: Cliente e Status */}
                <div>
                  <h4 className="text-white font-medium mb-1">{entry.client}</h4>
                  {getStatusBadge(entry.status)}
                </div>
                
                {/* Coluna 2: Valor */}
                <div className="text-center">
                  <p className="text-goat-gray-400 text-sm">Valor</p>
                  <p className="text-white font-semibold">{formatCurrency(entry.monthlyValue)}</p>
                </div>
                
                {/* Coluna 3: Referência */}
                <div className="text-center">
                  <p className="text-goat-gray-400 text-sm">Referência</p>
                  <p className="text-white">{formatMonth(entry.referenceMonth)}</p>
                </div>
                
                {/* Coluna 4: Data de Pagamento */}
                <div className="text-center">
                  <p className="text-goat-gray-400 text-sm">Data de Pagamento</p>
                  <p className="text-white">{entry.paymentDate ? formatDate(entry.paymentDate) : '-'}</p>
                </div>

                {/* Coluna 5: Botão de Ação */}
                <div className="flex justify-center">
                  {(entry.status === 'pending' || entry.status === 'paid') && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white w-32"
                      onClick={() => handleTogglePaymentStatus(entry.id)}
                    >
                      {entry.status === 'paid' ? 'Pago' : 'Confirmar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Despesas Card - 5 Column Layout */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Despesas do Mês</h3>
          </div>
          <ExpenseModal onAddExpense={handleAddExpense} />
        </div>
        
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
              <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                {/* Coluna 1: Descrição */}
                <div>
                  <p className="text-white font-medium">{expense.description}</p>
                  <p className="text-goat-gray-400 text-sm">{expense.category}</p>
                </div>
                
                {/* Coluna 2: Data */}
                <div>
                  <p className="text-goat-gray-400 text-sm">Data</p>
                  <p className="text-white text-sm">{formatDate(expense.date)}</p>
                </div>
                
                {/* Coluna 3: Tag Recorrente (centralizada) */}
                <div className="flex justify-center">
                  {expense.isRecurring && (
                    <Badge className="bg-orange-600 text-white text-xs">
                      <Repeat className="w-3 h-3 mr-1" />
                      Recorrente
                    </Badge>
                  )}
                </div>
                
                {/* Coluna 4: Valor e Status */}
                <div className="text-center">
                  <p className="text-red-400 font-semibold">{formatCurrency(expense.value)}</p>
                  <Badge className={expense.status === 'Pago' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                    {expense.status}
                  </Badge>
                </div>

                {/* Coluna 5: Botões de Ação (Confirmar e Excluir lado a lado) */}
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    className='bg-green-600 hover:bg-green-700 text-white w-20'
                    onClick={() => handleToggleExpenseStatus(expense.id)}
                  >
                    {expense.status === 'Pago' ? 'Pago' : 'Confirmar'}
                  </Button>
                  
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white w-20"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    Excluir
                  </Button>
                </div>
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

      {/* Substitui o card de Projeção de Faturamento existente pelo novo gráfico */}
      <ProjectionChart contracts={contractProjections} />
    </div>
  );
}
