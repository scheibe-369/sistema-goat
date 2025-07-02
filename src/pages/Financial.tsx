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

  const handleAddExpense = (expenseData: any) => {
    let amount = 0;
    // Aceita tanto 'value' quanto 'amount' e converte corretamente
    if (typeof expenseData.value === 'number') {
      amount = expenseData.value;
    } else if (typeof expenseData.value === 'string') {
      amount = parseFloat(expenseData.value.replace(',', '.'));
    } else if (typeof expenseData.amount === 'number') {
      amount = expenseData.amount;
    } else if (typeof expenseData.amount === 'string') {
      amount = parseFloat(expenseData.amount.replace(',', '.'));
    }
    console.log('DEBUG - Dados recebidos para despesa:', expenseData, 'Valor convertido:', amount);
    if (!expenseData.description || !amount || isNaN(amount) || amount <= 0 || !expenseData.category || !expenseData.date) {
      alert('Preencha todos os campos obrigatórios: descrição, valor (> 0), categoria e data. Valor informado: ' + expenseData.value);
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

  // Gerar lançamentos futuros previstos dos contratos para os próximos 12 meses
  const today = new Date();
  const futureIncomes = contracts
    .filter(contract => contract.monthly_value && contract.start_date && contract.end_date && contract.client && contract.client.payment_day)
    .flatMap(contract => {
      const start = new Date(contract.start_date);
      const end = new Date(contract.end_date);
      const paymentDay = Number(contract.client.payment_day);
      let firstPaymentDate = new Date(start);
      if (start.getDate() >= paymentDay) {
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
      }
      const launches = [];
      let paymentDate = new Date(firstPaymentDate);
      let count = 0;
      while (paymentDate <= end && count < 12) {
        if (paymentDate >= today && paymentDate <= end) {
          launches.push({
            clientName: contract.client.company || 'Cliente não encontrado',
            value: Number(contract.monthly_value),
            date: new Date(paymentDate),
            status: 'previsto',
          });
          count++;
        }
        paymentDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, paymentDay);
      }
      return launches;
    })
    .sort((a, b) => a.date - b.date);

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
            <Button onClick={() => setStatusFilter('pending')} className={`${statusFilter === 'pending' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Em Aberto</Button>
            <Button onClick={() => setStatusFilter('paid')} className={`${statusFilter === 'paid' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Pagos</Button>
          </div>
        </div>
        <div className="p-6">
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
              <p className="text-goat-gray-400">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncomes.map((income, idx) => {
                const statusTag = getStatusTag(income);
                return (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="text-white font-medium mb-1">{income.client?.company || income.description || 'Cliente'}</h4>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusTag.color} text-white`}>
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
                          <Button disabled className="bg-green-600 text-white" size="sm">Pago</Button>
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

      <ProjectionChart contracts={contractProjections} />
    </div>
  );
}