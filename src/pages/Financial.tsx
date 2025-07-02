import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, TrendingDown, Plus } from "lucide-react";
import { FinancialKPIs } from "@/components/Financial/FinancialKPIs";
import { ExpenseModal } from "@/components/Financial/ExpenseModal";
import { ProjectionChart } from "@/components/Financial/ProjectionChart";
import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";
import { useExpenses } from "@/hooks/useExpenses";
import { useFinancialEntries } from "@/hooks/useFinancialEntries";
import { useState } from "react";

export default function Financial() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [] } = useContracts();
  const { expenses, createExpense, payExpense, deleteExpense, isLoading: expensesLoading, isPaying, isDeleting } = useExpenses();
  const { markAsPaid, isMarkingAsPaid, incomes, incomesLoading } = useFinancialEntries();

  // Calculate real financial data from database
  const transactions = [];
  
  // Calculate monthly revenue from active contracts
  const monthlyRevenue = contracts
    .filter(contract => contract.status === 'active')
    .reduce((total, contract) => total + (contract.monthly_value || 0), 0);

  // Calculate overdue payments from contracts
  const overdueContracts = contracts.filter(contract => 
    contract.status === 'inactive' || 
    (contract.end_date && new Date(contract.end_date) < new Date())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const contractProjections = contracts.map(contract => ({
    clientName: contract.client?.company || 'Cliente não encontrado',
    monthlyValue: Number(contract.monthly_value || 0),
    durationInMonths: 12, // Default duration
    startMonth: contract.start_date ? contract.start_date.substring(0, 7) : new Date().toISOString().substring(0, 7)
  }));

  const handleAddExpense = (expenseData: any) => {
    const amount = typeof expenseData.value === 'number' ? expenseData.value :
      (typeof expenseData.value === 'string' ? parseFloat(expenseData.value.replace(',', '.')) : 0);
    if (!expenseData.description || !amount || isNaN(amount) || !expenseData.category || !expenseData.date) {
      alert('Preencha todos os campos obrigatórios: descrição, valor, categoria e data.');
      return;
    }
    const expense = {
      description: expenseData.description,
      amount,
      category: expenseData.category,
      date: expenseData.date,
      status: 'pending',
      type: 'expense',
      is_recurring: expenseData.is_recurring ?? expenseData.isRecurring ?? false,
      recurrence_type: expenseData.recurrence_type ?? expenseData.recurrence
    };
    createExpense(expense);
  };

  const handleMarkAsPaid = (contract: any) => {
    markAsPaid({
      contractId: contract.client_id,
      amount: Number(contract.monthly_value || 0),
      description: `Pagamento mensal - ${contract.client?.company || 'Cliente'}`,
      contract: contract
    });
  };

  const handlePayExpense = (expenseId: string) => {
    payExpense(expenseId);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      deleteExpense(expenseId);
    }
  };

  // Filtros de status
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Filtrar lançamentos financeiros conforme status
  const filteredIncomes = incomes.filter((income: any) => {
    if (statusFilter === 'all') return true;
    return income.status === statusFilter;
  });

  // Função para formatar referência mês/ano
  const formatReference = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Função para determinar status visual
  const getStatusTag = (income: any) => {
    if (income.status === 'paid') {
      return { label: 'Pago', color: 'bg-green-600' };
    }
    // Se está pendente e a data de referência é anterior ao mês atual, está em atraso
    const refDate = new Date(income.date);
    const now = new Date();
    if (
      income.status === 'pending' &&
      (refDate.getFullYear() < now.getFullYear() ||
        (refDate.getFullYear() === now.getFullYear() && refDate.getMonth() < now.getMonth()))
    ) {
      return { label: 'Em atraso', color: 'bg-red-600' };
    }
    return { label: 'Em aberto', color: 'bg-yellow-600' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-goat-gray-400">Controle de faturamento e recebimentos</p>
        </div>
      </div>

      <FinancialKPIs transactions={transactions} />

      {/* Lançamentos Financeiros */}
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Lançamentos Financeiros</h3>
            <p className="text-goat-gray-400 text-sm mt-1">Receitas recorrentes e avulsas</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Todos</Button>
            <Button onClick={() => setStatusFilter('pending')} className={`