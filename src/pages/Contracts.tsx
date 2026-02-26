import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { ContractsHeader } from "@/components/Contracts/ContractsHeader";
import { EditContractModal } from "@/components/Contracts/EditContractModal";
import { DeleteContractDialog } from "@/components/Contracts/DeleteContractDialog";
import { useContracts, useUpdateContract, useRenewContract } from "@/hooks/useContracts";
import { useUpdateClient } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Contract {
  id: string;
  client: string;
  client_id: string;
  type: string;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expiring';
}

export default function Contracts() {
  const { data: contractsData = [], isLoading, error } = useContracts();
  const updateContractMutation = useUpdateContract();
  const renewContractMutation = useRenewContract();
  const updateClientMutation = useUpdateClient();
  const queryClient = useQueryClient();
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

  // Transform Supabase contracts to component format
  const contracts: Contract[] = contractsData.map(contract => ({
    id: contract.id,
    client: contract.client?.company || 'Cliente não encontrado',
    client_id: contract.client_id || contract.client?.id || '',
    type: contract.type,
    monthlyValue: Number(contract.monthly_value),
    startDate: contract.start_date,
    endDate: contract.end_date,
    status: contract.status as 'active' | 'inactive' | 'expiring'
  }));

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Ativo</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-600 text-white hover:bg-yellow-700">A vencer</Badge>;
      case 'inactive':
        return <Badge className="bg-red-600 text-white hover:bg-red-700">Inativo</Badge>;
      default:
        return <Badge className="bg-goat-gray-600 text-white">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
  };

  const getDaysUntilExpiration = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(endDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEditContract = (contractData: Omit<Contract, 'id'>) => {
    if (editingContract) {
      setEditingContract(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (deletingContract) {
      try {
        // Atualizar status do contrato para inactive
        await updateContractMutation.mutateAsync({ id: deletingContract.id, status: 'inactive' });

        // Atualizar tag do cliente para "Inativo" e deletar faturas pendentes se houver client_id
        if (deletingContract.client_id) {
          try {
            // Atualizar tag do cliente
            await updateClientMutation.mutateAsync({
              id: deletingContract.client_id,
              tags: ['Inativo']
            });
            console.log('Tag do cliente atualizada para Inativo');

            // Invalidar query de clientes para atualizar a UI
            queryClient.invalidateQueries({ queryKey: ['clients'] });

            // Deletar todas as faturas pendentes (não pagas) do cliente
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { error: deleteError } = await supabase
                .from('financial_entries')
                .delete()
                .eq('client_id', deletingContract.client_id)
                .eq('user_id', user.id)
                .eq('status', 'pending');

              if (deleteError) {
                console.error('Erro ao deletar faturas pendentes:', deleteError);
              } else {
                console.log('Faturas pendentes deletadas com sucesso');
                // Invalidar queries de faturas para atualizar a UI
                queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
              }
            }
          } catch (clientError) {
            console.error('Erro ao atualizar tag do cliente ou deletar faturas:', clientError);
            // Não falhar o cancelamento do contrato se a atualização do cliente falhar
          }
        }

        setDeletingContract(null);
      } catch (error) {
        console.error('Error updating contract:', error);
      }
    }
  };

  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiringContracts = contracts.filter(c => c.status === 'expiring');
  const inactiveContracts = contracts.filter(c => c.status === 'inactive');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-goat-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-goat-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-goat-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-red-400">Erro ao carregar contratos: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ContractsHeader />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeContracts.length}</p>
              <p className="text-goat-gray-400 text-sm">Contratos Ativos</p>
            </div>
          </div>
        </Card>
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{expiringContracts.length}</p>
              <p className="text-goat-gray-400 text-sm">A Vencer</p>
            </div>
          </div>
        </Card>
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inactiveContracts.length}</p>
              <p className="text-goat-gray-400 text-sm">Inativos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <Card className="bg-yellow-950 border-yellow-700">
          <div className="p-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-200">Contratos A Vencer</h3>
          </div>
          <div className="p-6 pt-0">
            {expiringContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 rounded-lg bg-yellow-900/50 border border-yellow-700 mb-4">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="text-white font-medium mb-1">{contract.client}</h4>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-600 text-white">A vencer</span>
                    </div>
                    <p className="text-yellow-200 text-xs mt-1">{contract.type}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-200 text-sm">Valor</p>
                    <p className="text-white font-semibold">{formatCurrency(contract.monthlyValue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-200 text-sm">Vencimento</p>
                    <p className="text-white">{formatDate(contract.endDate)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-200 text-sm">Dias restantes</p>
                    <p className="text-white font-semibold">
                      {getDaysUntilExpiration(contract.endDate)} dias
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => renewContractMutation.mutate(contract.id)}
                      disabled={renewContractMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {renewContractMutation.isPending ? 'Renovando...' : 'Renovar'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contracts List */}
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700">
          <h3 className="text-lg font-semibold text-white">Todos os Contratos</h3>
          <p className="text-goat-gray-400 text-sm mt-1">Status sincronizado automaticamente com os clientes</p>
        </div>

        {contracts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum contrato encontrado</h3>
            <p className="text-goat-gray-400">Contratos são criados automaticamente quando você cadastra clientes com valores mensais.</p>
          </div>
        ) : (
          <div className="divide-y divide-goat-gray-700">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-6 hover:bg-goat-gray-900/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{contract.client}</h4>
                      {getStatusBadge(contract.status)}
                    </div>
                    <p className="text-goat-gray-400 mb-3">{contract.type}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-goat-purple" />
                        <span className="text-goat-gray-400">Valor mensal:</span>
                        <span className="text-white font-semibold">{formatCurrency(contract.monthlyValue)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-goat-purple" />
                        <span className="text-goat-gray-400">Início:</span>
                        <span className="text-white">{formatDate(contract.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-goat-purple" />
                        <span className="text-goat-gray-400">Término:</span>
                        <span className="text-white">{formatDate(contract.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      size="sm"
                      onClick={() => setDeletingContract(contract)}
                      className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <EditContractModal
        isOpen={!!editingContract}
        contract={editingContract}
        onClose={() => setEditingContract(null)}
        onSave={handleEditContract}
      />
      <DeleteContractDialog
        isOpen={!!deletingContract}
        contract={deletingContract}
        onClose={() => setDeletingContract(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
