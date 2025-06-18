
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";

interface FinancialEntry {
  id: string;
  client: string;
  monthlyValue: number;
  status: 'paid' | 'pending' | 'overdue';
  referenceMonth: string;
  paymentDate?: string;
  observations?: string;
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

export default function Financial() {
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalPaid)}</p>
              <p className="text-goat-gray-400 text-sm">Faturado no Mês</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalPending)}</p>
              <p className="text-goat-gray-400 text-sm">Em Aberto</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalOverdue)}</p>
              <p className="text-goat-gray-400 text-sm">Em Atraso</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-goat-purple/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-goat-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalPaid + totalPending + totalOverdue)}</p>
              <p className="text-goat-gray-400 text-sm">Total do Mês</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Overdue Alerts */}
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

      {/* Financial Entries List */}
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
                  <Button variant="outline" size="sm" className="text-white border-goat-gray-600">
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue Projection */}
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
