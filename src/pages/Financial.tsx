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
import { useState, useMemo, useEffect } from "react";

export default function Financial() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [], refetch } = useContracts();
  const { expenses, createExpense, payExpense, deleteExpense, isLoading: expensesLoading, isPaying, isDeleting } = useExpenses();
  const { markAsPaid, isMarkingAsPaid, incomes, incomesLoading } = useFinancialEntries();

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

  const contractProjections = contracts
    .filter(contract => contract.monthly_value && contract.start_date && contract.end_date && contract.client && contract.client.payment_day)
    .map(contract => {
      const start = new Date(contract.start_date);
      const end = new Date(contract.end_date);
      const paymentDay = Number(contract.client.payment_day);
      // Calcula a data do primeiro pagamento
      let firstPaymentDate = new Date(start);
      if (start.getDate() >= paymentDay) {
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
      }
      // Calcula a quantidade de pagamentos (duração em meses)
      let durationInMonths = 0;
      let paymentDate = new Date(firstPaymentDate);
      while (paymentDate <= end) {
        // Só conta se o pagamento do mês não ultrapassa a data de término do contrato
        if (paymentDate <= end) {
          durationInMonths++;
        }
        paymentDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, paymentDay);
      }
      return {
        clientName: contract.client.company || 'Cliente não encontrado',
        monthlyValue: Number(contract.monthly_value),
        durationInMonths,
        startMonth: `${firstPaymentDate.getFullYear()}-${String(firstPaymentDate.getMonth() + 1).padStart(2, '0')}`,
      };
    });

  const faturamentoGeral = contractProjections.reduce(
    (total, c) => total + c.monthlyValue * c.durationInMonths, 0
  );

  const handleAddExpense = (expenseData: any) => {
    console.log('DEBUG - Dados recebidos para despesa:', expenseData);
    
    if (!expenseData.description || !expenseData.amount || isNaN(expenseData.amount) || expenseData.amount <= 0 || !expenseData.category || !expenseData.date) {
      console.error('Dados inválidos para despesa:', expenseData);
      return;
    }

    const expense = {
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date,
      status: 'pending',
      type: 'expense',
      is_recurring: expenseData.is_recurring || false,
      recurrence_type: expenseData.recurrence_type
    };
    
    console.log('DEBUG - Criando despesa:', expense);
    createExpense(expense);
  };

  // Função para marcar como pago
  const handleMarkAsPaid = async (income: any) => {
    await markAsPaid(income);
  };

  const handlePayExpense = (expenseId: string) => {
    console.log('DEBUG - Pagando despesa:', expenseId);
    payExpense(expenseId);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      console.log('DEBUG - Excluindo despesa:', expenseId);
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

  // Separar lançamentos em atraso dos demais
  const overdueIncomes = filteredIncomes.filter((income: any) => getStatusTag(income).label === 'Em atraso');
  const normalIncomes = filteredIncomes.filter((income: any) => getStatusTag(income).label !== 'Em atraso');

  // Aplicar filtro de status
  const filteredNormalIncomes = normalIncomes.filter((income: any) => {
    if (statusFilter === 'all') return true;
    const tag = getStatusTag(income).label;
    if (statusFilter === 'pending') return tag === 'Em aberto';
    if (statusFilter === 'paid') return tag === 'Pago';
    return true;
  });
  const filteredOverdueIncomes = overdueIncomes.filter((income: any) => {
    if (statusFilter === 'all') return true;
    const tag = getStatusTag(income).label;
    if (statusFilter === 'pending') return tag === 'Em atraso';
    if (statusFilter === 'paid') return false;
    return true;
  });

  // Cálculo dos KPIs
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const receitasMes = incomes
    .filter(i => {
      const d = new Date(i.date);
      return i.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const despesasMes = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const lucroMes = receitasMes - despesasMes;

  useEffect(() => {
    const onFocus = () => {
      refetch();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-goat-gray-400">Controle de faturamento e recebimentos</p>
        </div>
      </div>

      <FinancialKPIs
        totalReceitas={faturamentoGeral}
        receitasMes={receitasMes}
        despesasMes={despesasMes}
        lucroMes={lucroMes}
      />

      {/* Pagamentos em Atraso */}
      {filteredOverdueIncomes.length > 0 && (
        <Card className="bg-red-950 border-red-700 mb-6">
          <div className="p-6 border-b border-red-700 flex items-center gap-2">
            <AlertCircle className="text-red-400 mr-2" />
            <h3 className="text-lg font-semibold text-red-200">Pagamentos em Atraso</h3>
          </div>
          <div className="p-6">
            {filteredOverdueIncomes.map((income, idx) => (
              <div key={income.id || idx} className="flex items-center justify-between p-4 rounded-lg bg-red-900/50 border border-red-700 mb-4">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{income.description}</h4>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">Em atraso</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-sm">Valor</p>
                    <p className="text-white font-semibold">{formatCurrency(Number(income.amount))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-sm">Referência</p>
                    <p className="text-white">{formatReference(income.date)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-sm">Data de Pagamento</p>
                    <p className="text-white">-</p>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => handleMarkAsPaid(income)}
                      disabled={isMarkingAsPaid}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lançamentos Financeiros */}
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Lançamentos Financeiros</h3>
            <p className="text-goat-gray-400 text-sm mt-1">Todos os lançamentos do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Todos</Button>
            <Button onClick={() => setStatusFilter('pending')} className={`${statusFilter === 'pending' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Em Aberto</Button>
            <Button onClick={() => setStatusFilter('paid')} className={`${statusFilter === 'paid' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Pagos</Button>
          </div>
        </div>
        <div className="p-6">
          {filteredNormalIncomes.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
              <p className="text-goat-gray-400">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNormalIncomes.map((income, idx) => {
                const statusTag = getStatusTag(income);
                return (
                  <div key={income.id || idx} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="text-white font-medium mb-1">{income.description}</h4>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusTag.color} text-white`}>
                            {statusTag.label}
                          </span>
                        </div>
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
                        <p className="text-white">{income.status === 'paid' && income.updated_at ? new Date(income.updated_at).toLocaleDateString('pt-BR') : '-'}</p>
                      </div>
                      <div className="flex justify-center">
                        {income.status === 'pending' ? (
                          <Button
                            onClick={() => handleMarkAsPaid(income)}
                            disabled={isMarkingAsPaid}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            Confirmar
                          </Button>
                        ) : (
                          <Button disabled className="bg-green-800 text-white" size="sm">Pago</Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Despesas Section */}
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
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  {/* Coluna 1: Descrição e categoria */}
                  <div>
                    <h4 className="text-white font-medium mb-1">{expense.description}</h4>
                    <p className="text-goat-gray-400 text-sm">{expense.category}</p>
                  </div>
                  {/* Coluna 2: Data */}
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-xs">Data</p>
                    <p className="text-white text-base">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {/* Coluna 3: Recorrência */}
                  <div className="text-center">
                    {expense.is_recurring ? (
                      <Badge className="bg-goat-purple text-white rounded-md">
                        {expense.recurrence_type === 'monthly' && 'Mensal'}
                        {expense.recurrence_type === 'yearly' && 'Anual'}
                        {expense.recurrence_type === 'quarterly' && 'Trimestral'}
                        {expense.recurrence_type === 'semesterly' && 'Semestral'}
                        {!['monthly','yearly','quarterly','semesterly'].includes(expense.recurrence_type) && expense.recurrence_type?.charAt(0).toUpperCase() + expense.recurrence_type?.slice(1)}
                      </Badge>
                    ) : null}
                  </div>
                  {/* Coluna 4: Valor + status */}
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">{formatCurrency(Number(expense.amount))}</p>
                    <div className="mt-1">
                      <Badge className={`${expense.status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'} text-white rounded-md`}>
                        {expense.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                  {/* Coluna 5: Botões */}
                  <div className="flex justify-center gap-2">
                    {expense.status === 'pending' ? (
                      <Button
                        onClick={() => handlePayExpense(expense.id)}
                        disabled={isPaying}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-md px-6 py-2"
                        size="sm"
                      >
                        {isPaying ? 'Pagando...' : 'Pagar'}
                      </Button>
                    ) : (
                      <Button disabled className="bg-green-800 text-white rounded-md px-6 py-2" size="sm">Pago</Button>
                    )}
                    <Button
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-md px-6 py-2"
                      size="sm"
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mt-6">
              <span className="text-goat-gray-400 font-normal text-lg">Total de Despesas Pendentes:</span>
              <span className="text-white font-normal text-lg">{formatCurrency(expenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + Number(e.amount), 0))}</span>
            </div>
          </div>
        )}
      </Card>

      <ProjectionChart contracts={contractProjections} />
    </div>
  );
}
