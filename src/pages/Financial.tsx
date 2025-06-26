import { useState } from "react";
// Importações do date-fns atualizadas
import { addMonths, parse, format } from 'date-fns';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, AlertCircle, Calendar, TrendingDown, Repeat, Check, Trash2 } from "lucide-react";
import { FinancialKPIs } from "@/components/Financial/FinancialKPIs";
import { ExpenseModal } from "@/components/Financial/ExpenseModal";
import { ProjectionChart } from "@/components/Financial/ProjectionChart";

// ==================================================================
// INTERFACES E DADOS
// ==================================================================

// 1. INTERFACE FinancialEntry ATUALIZADA para incluir recorrência
interface FinancialEntry {
  id: string;
  client: string;
  monthlyValue: number;
  status: 'paid' | 'pending' | 'overdue';
  referenceMonth: string; // Formato 'YYYY-MM'
  paymentDate?: string;
  observations?: string;
  isRecurring: boolean; // Adicionado
  recurrence?: 'Mensal';   // Adicionado
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

interface Expense {
  id: number;
  description: string;
  value: number;
  category: string;
  date: string; // Formato 'YYYY-MM-DD'
  status: 'Pago' | 'Pendente';
  isRecurring: boolean;
  recurrence?: 'Semanal' | 'Mensal' | 'Semestral' | 'Anual';
}

// DADOS MOCKADOS ORIGINAIS, AGORA COM OS NOVOS CAMPOS
const mockFinancialEntries: FinancialEntry[] = [
  {
    id: '1',
    client: 'Tech Innovations',
    monthlyValue: 5000,
    status: 'paid',
    referenceMonth: '2024-01',
    paymentDate: '2024-01-05',
    isRecurring: true, // Adicionado
    recurrence: 'Mensal' // Adicionado
  },
  {
    id: '2',
    client: 'E-commerce Plus',
    monthlyValue: 3000,
    status: 'overdue',
    referenceMonth: '2024-01',
    observations: 'Cliente comunicou dificuldade financeira',
    isRecurring: true, // Adicionado
    recurrence: 'Mensal' // Adicionado
  },
  {
    id: '3',
    client: 'Startup XYZ',
    monthlyValue: 8000,
    status: 'paid',
    referenceMonth: '2024-01',
    paymentDate: '2024-01-10',
    isRecurring: true, // Adicionado
    recurrence: 'Mensal' // Adicionado
  },
  {
    id: '4',
    client: 'Consultoria Pro',
    monthlyValue: 4500,
    status: 'pending',
    referenceMonth: '2024-01',
    isRecurring: false // Adicionado
  },
  {
    id: '5',
    client: 'Marketing Digital',
    monthlyValue: 6000,
    status: 'pending',
    referenceMonth: '2024-01',
    isRecurring: true, // Adicionado
    recurrence: 'Mensal' // Adicionado
  }
];

const mockTransactions: Transaction[] = [
    {id: 1, description: 'Pagamento Tech Innovations', value: 5000, type: 'receita', category: 'Serviços', date: '2024-01-05', status: 'Confirmado'},
    {id: 2, description: 'Pagamento Startup XYZ', value: 8000, type: 'receita', category: 'Serviços', date: '2024-01-10', status: 'Confirmado'},
    {id: 3, description: 'Aluguel escritório', value: 2500, type: 'despesa', category: 'Infraestrutura', date: '2024-01-01', status: 'Pago'},
    {id: 4, description: 'Software e ferramentas', value: 800, type: 'despesa', category: 'Tecnologia', date: '2024-01-15', status: 'Pago'}
];

const initialExpenses: Expense[] = [
    {id: 1, description: 'Aluguel escritório', value: 2500, category: 'Infraestrutura', date: '2025-06-01', status: 'Pendente', isRecurring: true, recurrence: 'Mensal'},
    {id: 2, description: 'Licença de Software Anual', value: 1200, category: 'Tecnologia', date: '2025-07-15', status: 'Pendente', isRecurring: true, recurrence: 'Anual'},
    {id: 3, description: 'Manutenção Semestral Servidor', value: 800, category: 'Tecnologia', date: '2025-08-20', status: 'Pendente', isRecurring: true, recurrence: 'Semestral'},
    {id: 4, description: 'Café e lanches', value: 300, category: 'Escritório', date: '2025-06-25', status: 'Pendente', isRecurring: false}
];

// Dados de contratos com duração, usados para checar o fim do contrato
const contractProjections = [
  { clientName: 'Tech Innovations', monthlyValue: 5000, durationInMonths: 12, startMonth: '2024-01' },
  { clientName: 'E-commerce Plus', monthlyValue: 3000, durationInMonths: 6, startMonth: '2024-01' },
  { clientName: 'Startup XYZ', monthlyValue: 8000, durationInMonths: 18, startMonth: '2024-01' },
  { clientName: 'Consultoria Pro', monthlyValue: 4500, durationInMonths: 1, startMonth: '2024-01' },
  { clientName: 'Marketing Digital', monthlyValue: 6000, durationInMonths: 12, startMonth: '2024-01' },
  { clientName: 'Novo Cliente A', monthlyValue: 2500, durationInMonths: 4, startMonth: '2024-04' },
  { clientName: 'Novo Cliente B', monthlyValue: 7000, durationInMonths: 10, startMonth: '2024-05' }
];

// ==================================================================
// COMPONENTE PRINCIPAL
// ==================================================================

export default function Financial() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(mockFinancialEntries);

  // ==================================================================
  // FUNÇÕES DE MANIPULAÇÃO DE ESTADO (HANDLERS)
  // ==================================================================

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id' | 'status'>) => {
    const newExpense: Expense = {
        ...newExpenseData,
        id: Date.now(),
        status: 'Pendente' as const
    };
    setExpenses(prev => [...prev, newExpense].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleToggleExpenseStatus = (expenseId: number) => {
    const expenseToUpdate = expenses.find(e => e.id === expenseId);
    if (!expenseToUpdate) return;

    if (expenseToUpdate.isRecurring && expenseToUpdate.status === 'Pendente') {
      const newRecurringExpense: Expense = {
        ...expenseToUpdate,
        id: Date.now(),
        status: 'Pendente' as const,
        date: calculateNextDate(expenseToUpdate.date, expenseToUpdate.recurrence),
      };

      setExpenses(prev =>
        [
          ...prev.map(exp => exp.id === expenseId ? { ...exp, status: 'Pago' as const } : exp),
          newRecurringExpense
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );

    } else if (!expenseToUpdate.isRecurring && expenseToUpdate.status === 'Pendente') {
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? { ...exp, status: 'Pago' as const } : exp));
      setTimeout(() => {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      }, 800);

    } else if (expenseToUpdate.status === 'Pago') {
      if (expenseToUpdate.isRecurring) {
        alert("Não é possível reverter o status de uma despesa recorrente que já gerou a próxima cobrança.");
        return;
      }
      setExpenses(prev => prev.map(expense => expense.id === expenseId ? { ...expense, status: 'Pendente' as const } : expense));
    }
  };

  const handleDeleteExpense = (expenseId: number) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  // FUNÇÃO DE PAGAMENTO DE RECEITAS REFATORADA
  const handleTogglePaymentStatus = (entryId: string) => {
    const entryToUpdate = financialEntries.find(e => e.id === entryId);
    if (!entryToUpdate) return;

    if (entryToUpdate.status === 'pending' || entryToUpdate.status === 'overdue') {
      const updatedEntries = financialEntries.map(e => 
        e.id === entryId 
        ? { ...e, status: 'paid' as const, paymentDate: new Date().toISOString().split('T')[0] }
        : e
      );

      if (entryToUpdate.isRecurring) {
        const contract = contractProjections.find(c => c.clientName === entryToUpdate.client);
        if (!contract) return;

        const nextMonth = calculateNextMonth(entryToUpdate.referenceMonth);
        const startDate = parse(contract.startMonth, 'yyyy-MM', new Date());
        const endDate = addMonths(startDate, contract.durationInMonths - 1);
        const nextMonthDate = parse(nextMonth, 'yyyy-MM', new Date());

        if (nextMonthDate <= endDate) {
          const newEntry: FinancialEntry = {
            id: Date.now().toString(),
            client: entryToUpdate.client,
            monthlyValue: entryToUpdate.monthlyValue,
            status: 'pending',
            referenceMonth: nextMonth,
            isRecurring: true,
            recurrence: 'Mensal',
          };
          setFinancialEntries([...updatedEntries, newEntry]);
          return;
        }
      }
      
      setFinancialEntries(updatedEntries);

    } else if (entryToUpdate.status === 'paid') {
      const nextEntryExists = financialEntries.find(e => 
        e.client === entryToUpdate.client && e.referenceMonth > entryToUpdate.referenceMonth
      );
      if (nextEntryExists) {
        alert("Não é possível reverter um pagamento que já gerou o próximo faturamento.");
        return;
      }

      setFinancialEntries(prev => prev.map(e => 
        e.id === entryId ? { ...e, status: 'pending' as const, paymentDate: undefined } : e
      ));
    }
  };
  
  // ==================================================================
  // FUNÇÕES AUXILIARES
  // ==================================================================

  const calculateNextMonth = (monthString: string): string => {
    const date = parse(monthString, 'yyyy-MM', new Date());
    const nextMonthDate = addMonths(date, 1);
    return format(nextMonthDate, 'yyyy-MM');
  };

  const getStatusBadge = (status: FinancialEntry['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600 text-white hover:bg-green-700 transition-colors">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white hover:bg-yellow-700 transition-colors">Em aberto</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer">Em atraso</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const calculateNextDate = (currentDate: string, recurrence: Expense['recurrence']): string => {
    const date = new Date(currentDate + 'T00:00:00');
    let nextDate: Date;
    switch (recurrence) {
      case 'Semanal': nextDate = addMonths(date, 1/4); break; // Simplified
      case 'Mensal': nextDate = addMonths(date, 1); break;
      case 'Semestral': nextDate = addMonths(date, 6); break;
      case 'Anual': nextDate = addYears(date, 1); break;
      default: return currentDate;
    }
    return nextDate.toISOString().split('T')[0];
  };

  // ==================================================================
  // CÁLCULOS PARA RENDERIZAÇÃO
  // ==================================================================

  const overdueEntries = financialEntries.filter(e => e.status === 'overdue');
  
  // ==================================================================
  // RENDERIZAÇÃO JSX
  // ==================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-goat-gray-400">Controle de faturamento e recebimentos</p>
        </div>
      </div>

      <FinancialKPIs transactions={transactions} />

      {overdueEntries.length > 0 && (
        <Card className="bg-red-900/20 border-red-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Pagamentos em Atraso</h3>
          </div>
          <div className="space-y-3">
            {overdueEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-red-950/40 border border-red-800/60">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{entry.client}</h4>
                    {getStatusBadge(entry.status)}
                    {entry.observations && (
                      <p className="text-red-300 text-xs mt-2 italic">{entry.observations}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-red-300 text-sm">Valor</p>
                    <p className="text-red-400 font-semibold">{formatCurrency(entry.monthlyValue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-300 text-sm">Referência</p>
                    <p className="text-white">{formatMonth(entry.referenceMonth)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-300 text-sm">Data de Pagamento</p>
                    <p className="text-white">-</p>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-600 hover:bg-red-900/40 hover:text-white focus:ring-2 focus:ring-red-500 focus:text-white"
                    >
                      Contatar Cliente
                    </Button>
                  </div>
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
          {financialEntries.sort((a,b) => a.referenceMonth.localeCompare(b.referenceMonth)).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
              <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                <div>
                  <h4 className="text-white font-medium mb-1">{entry.client}</h4>
                  {getStatusBadge(entry.status)}
                </div>
                <div className="text-center">
                  <p className="text-goat-gray-400 text-sm">Valor</p>
                  <p className="text-white font-semibold">{formatCurrency(entry.monthlyValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-goat-gray-400 text-sm">Referência</p>
                  <p className="text-white">{formatMonth(entry.referenceMonth)}</p>
                </div>
                <div className="text-center">
                  <p className="text-goat-gray-400 text-sm">Data de Pagamento</p>
                  <p className="text-white">{entry.paymentDate ? formatDate(entry.paymentDate) : '-'}</p>
                </div>
                <div className="flex justify-center">
                  {entry.status !== 'paid' ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white w-32"
                      onClick={() => handleTogglePaymentStatus(entry.id)}
                    >
                      Confirmar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-white w-32"
                      onClick={() => handleTogglePaymentStatus(entry.id)}
                    >
                      Pago
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
                <div>
                  <p className="text-white font-medium">{expense.description}</p>
                  <p className="text-goat-gray-400 text-sm">{expense.category}</p>
                </div>
                <div>
                  <p className="text-goat-gray-400 text-sm">Data</p>
                  <p className="text-white text-sm">{formatDate(expense.date)}</p>
                </div>
                <div className="flex justify-center">
                  {expense.isRecurring && (
                    <Badge className="goat-purple text-white text-xs">
                      <Repeat className="w-3 h-3 mr-1" />
                      {expense.recurrence}
                    </Badge>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-red-400 font-semibold">{formatCurrency(expense.value)}</p>
                  <Badge className={expense.status === 'Pago' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                    {expense.status}
                  </Badge>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    className={`text-white w-20 ${expense.status === 'Pago' ? 'bg-green-600 opacity-60 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={() => handleToggleExpenseStatus(expense.id)}
                    disabled={expense.status === 'Pago'}
                  >
                    {expense.status === 'Pago' ? 'Pago' : 'Pagar'}
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
              <p className="text-goat-gray-400">Total de Despesas Pendentes:</p>
              <p className="text-red-400 font-bold text-xl">
                {formatCurrency(expenses.filter(e => e.status === 'Pendente').reduce((sum, expense) => sum + expense.value, 0))}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <ProjectionChart contracts={contractProjections} />
    </div>
  );
}