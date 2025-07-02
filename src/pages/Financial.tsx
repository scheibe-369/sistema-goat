
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, TrendingDown, Plus } from "lucide-react";
import { FinancialKPIs } from "@/components/Financial/FinancialKPIs";
import { ExpenseModal } from "@/components/Financial/ExpenseModal";
import { ProjectionChart } from "@/components/Financial/ProjectionChart";
import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";

export default function Financial() {
  const { data: clients = [] } = useClients();
  const { data: contracts = [] } = useContracts();

  // Calculate real financial data from database
  const transactions = [];
  const expenses = [];
  
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-goat-gray-400">Controle de faturamento e recebimentos</p>
        </div>
      </div>

      <FinancialKPIs transactions={transactions} />

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(monthlyRevenue)}</p>
              <p className="text-goat-gray-400 text-sm">Faturamento Mensal</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{contracts.filter(c => c.status === 'active').length}</p>
              <p className="text-goat-gray-400 text-sm">Contratos Ativos</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{overdueContracts.length}</p>
              <p className="text-goat-gray-400 text-sm">Contratos Vencidos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Entries */}
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700">
          <h3 className="text-lg font-semibold text-white">Lançamentos Financeiros</h3>
          <p className="text-goat-gray-400 text-sm mt-1">Baseado nos contratos cadastrados</p>
        </div>

        {contracts.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum lançamento encontrado</h3>
            <p className="text-goat-gray-400">Cadastre clientes com valores mensais para ver os lançamentos financeiros aqui.</p>
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {contracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700">
                <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{contract.client?.company || 'Cliente não encontrado'}</h4>
                    <Badge className={`${contract.status === 'active' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                      {contract.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Valor Mensal</p>
                    <p className="text-white font-semibold">{formatCurrency(Number(contract.monthly_value || 0))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Início</p>
                    <p className="text-white">{contract.start_date ? new Date(contract.start_date).toLocaleDateString('pt-BR') : '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-goat-gray-400 text-sm">Término</p>
                    <p className="text-white">{contract.end_date ? new Date(contract.end_date).toLocaleDateString('pt-BR') : '-'}</p>
                  </div>
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
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Despesas</h3>
          </div>
          <ExpenseModal onAddExpense={() => {}} />
        </div>
        
        <div className="text-center py-8">
          <TrendingDown className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
          <p className="text-goat-gray-400">Nenhuma despesa cadastrada</p>
        </div>
      </Card>

      {/* Projection Chart */}
      {contractProjections.length > 0 && (
        <ProjectionChart contracts={contractProjections} />
      )}
    </div>
  );
}
