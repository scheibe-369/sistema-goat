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
    const expense = {
      description: expenseData.description,
      amount: expenseData.value,
      category: expenseData.category,
      date: expenseData.date,
      status: 'pending',
      type: 'expense',
      is_recurring: expenseData.is_recurring,
      recurrence_type: expenseData.recurrence_type
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
            <Button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'bg-goat-purple text-white' : ''} size="sm">Todos</Button>
            <Button onClick={() => setStatusFilter('pending')} className={statusFilter === 'pending' ? 'bg-yellow-600 text-white' : ''} size="sm">Em Aberto</Button>
            <Button onClick={() => setStatusFilter('paid')} className={statusFilter === 'paid' ? 'bg-green-600 text-white' : ''} size="sm">Pagos</Button>
          </div>
        </div>
        {incomesLoading ? (
          <div className="p-12 text-center text-goat-gray-400">Carregando lançamentos...</div>
        ) : filteredIncomes.length === 0 ? (
          <div className="p-12 text-center text-goat-gray-400">Nenhum lançamento encontrado</div>
        ) : (
          <div className="space-y-3 p-6">
            {filteredIncomes.map((income: any) => (
              <div key={income.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{income.description}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${income.status === 'paid' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                      {income.status === 'paid' ? 'Pago' : 'Em aberto'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Valor</p>
                    <p className="text-white font-semibold">{formatCurrency(Number(income.amount))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Referência</p>
                    <p className="text-white">{formatReference(income.date)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Data de Pagamento</p>
                    <p className="text-white">{income.status === 'paid' ? new Date(income.date).toLocaleDateString('pt-BR') : '-'}</p>
                  </div>
                </div>
                <div className="ml-4">
                  {income.status === 'pending' && (
                    <Button
                      onClick={() => markAsPaid({ contractId: income.client_id, amount: income.amount, description: income.description, contract: { id: income.client_id, end_date: income.end_date, status: 'active' } })}
                      disabled={isMarkingAsPaid}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {isMarkingAsPaid ? 'Confirmando...' : 'Confirmar'}
                    </Button>
                  )}
                  {income.status === 'paid' && (
                    <Button disabled size="sm" className="bg-green-600 text-white">Pago</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Expenses */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Despesas</h3>
          </div>
          <ExpenseModal onAddExpense={handleAddExpense} />
        </div>
        
        {expensesLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-goat-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-goat-gray-400">Carregando despesas...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <TrendingDown className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
            <p className="text-goat-gray-400">Nenhuma despesa cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{expense.description}</h4>
                    <Badge className={`${expense.status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                      {expense.status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Valor</p>
                    <p className="text-white font-semibold">{formatCurrency(Number(expense.amount))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Categoria</p>
                    <p className="text-white">{expense.category}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Data</p>
                    <p className="text-white">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {expense.status === 'pending' && (
                    <Button
                      onClick={() => handlePayExpense(expense.id)}
                      disabled={isPaying}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {isPaying ? 'Pagando...' : 'Pagar'}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteExpense(expense.id)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Projection Chart */}
      {contractProjections.length > 0 && (
        <ProjectionChart contracts={contractProjections} />
      )}
    </div>
  );
}
