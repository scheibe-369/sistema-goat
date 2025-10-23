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
import { DeleteExpenseDialog } from "@/components/Financial/DeleteExpenseDialog";
import { useState, useMemo, useEffect } from "react";

export default function Financial() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [], refetch } = useContracts();
  const { expenses, createExpense, payExpense, deleteExpense, isLoading: expensesLoading, isPaying, isDeleting } = useExpenses();
  const { financialEntries, financialEntriesLoading, markAsPaid, isMarkingAsPaid, generateMissingEntries, isGeneratingEntries } = useFinancialEntries();

  // Calculate monthly revenue from active contracts
  const monthlyRevenue = contracts
    .filter(contract => contract.status === 'active')
    .reduce((total, contract) => total + (contract.monthly_value || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data sem problemas de timezone
  const formatDateBR = (dateString: string) => {
    // Para datas no formato 'YYYY-MM-DD', formate diretamente sem conversão de timezone
    const dateParts = dateString.split('-');
    const day = dateParts[2];
    const month = dateParts[1];
    const year = dateParts[0];
    
    return `${day}/${month}/${year}`;
  };

  // Função para criar data local a partir de string YYYY-MM-DD sem problemas de timezone
  const parseLocalDate = (dateString: string) => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2]);
    
    return new Date(year, month, day);
  };

  // Filtro correto para contratos e clientes elegíveis para o gráfico
  const contratosElegiveis = contracts.filter(contract => {
    // Contrato deve ser 'active' ou 'expiring'
    const statusContrato = contract.status;
    if (statusContrato !== 'active' && statusContrato !== 'expiring') return false;
    // Cliente deve existir e estar 'Ativo' ou 'A vencer'
    const cliente = contract.client;
    if (!cliente) return false;
    const tags = (cliente.tags || []);
    // Normaliza para evitar problemas de maiúsculas/minúsculas
    const tagsLower = tags.map(t => t.toLowerCase());
    if (!tagsLower.includes('ativo'.toLowerCase()) && !tagsLower.includes('a vencer'.toLowerCase())) return false;
    // Precisa ter valores essenciais
    return contract.monthly_value && contract.start_date && contract.end_date && cliente.payment_day;
  });

  // Nova lógica de projeção mensal
  const contractProjections = contratosElegiveis.map(contract => {
    const start = parseLocalDate(contract.start_date);
    const end = parseLocalDate(contract.end_date);
    const paymentDay = Number(contract.client.payment_day);
    // Lógica do primeiro pagamento
    let firstPaymentDate = new Date(start);
    if (start.getDate() >= paymentDay) {
      // Se começou depois ou no dia do pagamento, só paga no mês seguinte
      firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
    }
    firstPaymentDate.setDate(paymentDay);
    // Corrige se o dia não existe no mês
    if (firstPaymentDate.getDate() !== paymentDay) {
      // Ex: pagamento dia 31 em fevereiro
      firstPaymentDate.setDate(0); // último dia do mês
    }
    // Calcula todos os meses de pagamento dentro da vigência
    let durationInMonths = 0;
    let paymentDate = new Date(firstPaymentDate);
    while (paymentDate <= end) {
      if (paymentDate >= firstPaymentDate && paymentDate <= end) {
        durationInMonths++;
      }
      paymentDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, paymentDay);
      // Corrige se o dia não existe no mês
      if (paymentDate.getDate() !== paymentDay) {
        paymentDate.setDate(0);
      }
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

  const handleMarkAsPaid = async (entryId: string) => {
    await markAsPaid(entryId);
  };

  const handlePayExpense = (expenseId: string) => {
    console.log('DEBUG - Pagando despesa:', expenseId);
    payExpense(expenseId);
  };

  // Add state for the delete confirmation modal
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState<{
    open: boolean;
    expenseId: string;
    expenseDescription: string;
  }>({
    open: false,
    expenseId: "",
    expenseDescription: ""
  });

  const handleDeleteExpense = (expenseId: string, expenseDescription: string) => {
    setDeleteExpenseDialog({
      open: true,
      expenseId,
      expenseDescription
    });
  };

  const confirmDeleteExpense = () => {
    console.log('DEBUG - Excluindo despesa:', deleteExpenseDialog.expenseId);
    deleteExpense(deleteExpenseDialog.expenseId);
    setDeleteExpenseDialog({
      open: false,
      expenseId: "",
      expenseDescription: ""
    });
  };

  // Filtros de status
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'currentMonth'>('currentMonth');
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'currentMonth'>('currentMonth');

  // Filtrar lançamentos financeiros conforme status
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtro para lançamentos financeiros de clientes com contratos ativos/a vencer e dentro da vigência
  const financialEntriesElegiveis = financialEntries.filter(entry => {
    // Encontrar todos os contratos ativos/a vencer para o cliente deste lançamento
    const contratosElegiveis = contracts.filter(contract =>
      contract.client_id === entry.client_id &&
      (contract.status === 'active' || contract.status === 'expiring')
    );

    // Se não houver contrato elegível, não exibe o lançamento
    if (contratosElegiveis.length === 0) return false;

    // Verifica se a data de vencimento do lançamento está dentro do período de algum contrato elegível
    const dueDate = parseLocalDate(entry.due_date);
    return contratosElegiveis.some(contract => {
      const start = parseLocalDate(contract.start_date);
      const end = parseLocalDate(contract.end_date);
      return dueDate >= start && dueDate <= end;
    });
  });

  // Usar esse array filtrado para exibir os lançamentos financeiros
  const filteredFinancialEntries = financialEntriesElegiveis.filter((entry: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'currentMonth') {
      const d = parseLocalDate(entry.due_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
    return entry.status === statusFilter;
  });

  // Função para determinar status visual
  const getStatusTag = (entry: any) => {
    if (entry.status === 'paid') {
      return { label: 'Pago', color: 'bg-green-600' };
    }
    // Se está pendente e a data de vencimento é anterior ao dia atual, está em atraso
    const dueDate = parseLocalDate(entry.due_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time for comparison
    dueDate.setHours(0, 0, 0, 0);
    
    if (entry.status === 'pending' && dueDate < now) {
      return { label: 'Em atraso', color: 'bg-red-600' };
    }
    return { label: 'Em aberto', color: 'bg-yellow-600' };
  };

  // Separar lançamentos em atraso dos demais
  const overdueEntries = financialEntriesElegiveis.filter((entry: any) => getStatusTag(entry).label === 'Em atraso');
  const normalEntries = financialEntriesElegiveis.filter((entry: any) => getStatusTag(entry).label !== 'Em atraso').filter((entry: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'currentMonth') {
      const d = parseLocalDate(entry.due_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }
    return entry.status === statusFilter;
  });

  // Cálculo dos KPIs
  const receitasMes = financialEntries
    .filter(entry => {
      const d = parseLocalDate(entry.due_date);
      return entry.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
  const despesasMes = expenses
    .filter(e => {
      const d = parseLocalDate(e.date);
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
      {overdueEntries.length > 0 && (
        <Card className="bg-red-950 border-red-700 mb-6">
          <div className="p-6 flex items-center gap-2">
            <AlertCircle className="text-red-400 mr-2" />
            <h3 className="text-lg font-semibold text-red-200">Pagamentos em Atraso</h3>
          </div>
          <div className="p-6 pt-0">
            {overdueEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-red-900/50 border border-red-700 mb-4">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{entry.name}</h4>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">Em atraso</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-sm">Valor</p>
                    <p className="text-white font-semibold">{formatCurrency(Number(entry.amount))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-sm">Referência</p>
                    <p className="text-white">{entry.reference}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-sm">Vencimento</p>
                    <p className="text-white">{formatDateBR(entry.due_date)}</p>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => handleMarkAsPaid(entry.id)}
                      disabled={isMarkingAsPaid}
                      className="bg-red-600 hover:bg-red-700 text-white"
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
            <Button onClick={() => setStatusFilter('currentMonth')} className={`${statusFilter === 'currentMonth' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Mês Atual</Button>
          </div>
        </div>
        <div className="p-6">
          {financialEntriesLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-goat-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-goat-gray-400">Carregando lançamentos...</p>
            </div>
          ) : normalEntries.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
              <p className="text-goat-gray-400">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {normalEntries.map((entry) => {
                const statusTag = getStatusTag(entry);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="text-white font-medium mb-1">{entry.name}</h4>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusTag.color} text-white`}>
                            {statusTag.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-goat-gray-400 text-sm">Valor</p>
                        <p className="text-white font-semibold">{formatCurrency(Number(entry.amount))}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-goat-gray-400 text-sm">Referência</p>
                        <p className="text-white">{entry.reference}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-goat-gray-400 text-sm">Vencimento</p>
                        <p className="text-white">{formatDateBR(entry.due_date)}</p>
                      </div>
                      <div className="flex justify-center">
                        {entry.status === 'pending' ? (
                          <Button
                            onClick={() => handleMarkAsPaid(entry.id)}
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
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Despesas</h3>
            <p className="text-goat-gray-400 text-sm mt-1">Todas as despesas do sistema</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setExpenseFilter('all')} className={`${expenseFilter === 'all' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Todos</Button>
            <Button onClick={() => setExpenseFilter('currentMonth')} className={`${expenseFilter === 'currentMonth' ? 'bg-goat-purple text-white' : 'bg-transparent text-white border border-goat-gray-600'}`} size="sm">Mês Atual</Button>
            <ExpenseModal onAddExpense={handleAddExpense} />
          </div>
        </div>
        <div className="p-6">
        
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
        ) : (() => {
          // Filtrar despesas conforme o filtro selecionado
          const filteredExpenses = expenses.filter(expense => {
            if (expenseFilter === 'all') return true;
            if (expenseFilter === 'currentMonth') {
              const d = parseLocalDate(expense.date);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }
            return true;
          });

          // Calcular total de despesas pendentes com base no filtro
          const totalPendingExpenses = filteredExpenses
            .filter(e => e.status === 'pending')
            .reduce((acc, e) => acc + Number(e.amount), 0);

          return filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
              <p className="text-goat-gray-400">Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{expense.description}</h4>
                    <p className="text-goat-gray-400 text-sm">{expense.category}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-xs">Data</p>
                    <p className="text-white text-base">{formatDateBR(expense.date)}</p>
                  </div>
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
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">{formatCurrency(Number(expense.amount))}</p>
                    <div className="mt-1">
                      <Badge className={`${expense.status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'} text-white rounded-md`}>
                        {expense.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
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
                      onClick={() => handleDeleteExpense(expense.id, expense.description)}
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
                <span className="text-white font-normal text-lg">{formatCurrency(totalPendingExpenses)}</span>
              </div>
            </div>
          );
        })()}
        </div>
      </Card>

      <ProjectionChart contracts={contractProjections} />

      <DeleteExpenseDialog
        open={deleteExpenseDialog.open}
        onOpenChange={(open) => setDeleteExpenseDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDeleteExpense}
        expenseDescription={deleteExpenseDialog.expenseDescription}
      />
    </div>
  );
}
