
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useClientFinancialEntries } from "@/hooks/useClientFinancialEntries";
import { Calendar, DollarSign } from "lucide-react";

interface ClientFinancialEntriesProps {
  clientId: string;
}

export function ClientFinancialEntries({ clientId }: ClientFinancialEntriesProps) {
  const { data: entries = [], isLoading } = useClientFinancialEntries(clientId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return 'bg-green-600';
    
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    if (due < now) return 'bg-red-600';
    return 'bg-yellow-600';
  };

  const getStatusLabel = (status: string, dueDate: string) => {
    if (status === 'paid') return 'Pago';
    
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    if (due < now) return 'Em atraso';
    return 'Pendente';
  };

  if (isLoading) {
    return (
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-goat-purple" />
          <h4 className="text-white font-medium">Lançamentos Financeiros</h4>
        </div>
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-goat-purple border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-goat-gray-400 text-sm mt-2">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-goat-purple" />
          <h4 className="text-white font-medium">Lançamentos Financeiros</h4>
        </div>
        <p className="text-goat-gray-400 text-sm">Nenhum lançamento encontrado</p>
      </Card>
    );
  }

  // Mostrar apenas os próximos 3 lançamentos
  const nextEntries = entries.slice(0, 3);
  const totalPending = entries.filter(e => e.status === 'pending').length;
  const totalOverdue = entries.filter(e => {
    if (e.status === 'paid') return false;
    const due = new Date(e.due_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }).length;

  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-goat-purple" />
          <h4 className="text-white font-medium">Lançamentos Financeiros</h4>
        </div>
        <div className="flex gap-2">
          {totalOverdue > 0 && (
            <Badge className="bg-red-600 text-white text-xs">
              {totalOverdue} em atraso
            </Badge>
          )}
          {totalPending > 0 && (
            <Badge className="bg-yellow-600 text-white text-xs">
              {totalPending} pendentes
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {nextEntries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-goat-gray-900/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-goat-gray-400" />
              <div>
                <p className="text-white text-sm font-medium">{entry.reference}</p>
                <p className="text-goat-gray-400 text-xs">
                  Venc: {new Date(entry.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-medium">
                {formatCurrency(Number(entry.amount))}
              </p>
              <Badge 
                className={`${getStatusColor(entry.status, entry.due_date)} text-white text-xs`}
              >
                {getStatusLabel(entry.status, entry.due_date)}
              </Badge>
            </div>
          </div>
        ))}
        
        {entries.length > 3 && (
          <p className="text-goat-gray-400 text-xs text-center pt-2">
            +{entries.length - 3} lançamentos adicionais
          </p>
        )}
      </div>
    </Card>
  );
}
