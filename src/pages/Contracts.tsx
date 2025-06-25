import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign, AlertTriangle } from "lucide-react"; 
import { ContractsHeader } from "@/components/Contracts/ContractsHeader";
import { EditContractModal } from "@/components/Contracts/EditContractModal";
import { DeleteContractDialog } from "@/components/Contracts/DeleteContractDialog";

interface Contract {
  id: string;
  client: string;
  type: string;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expiring';
}

const mockContracts: Contract[] = [
  {
    id: '1',
    client: 'Tech Innovations',
    type: 'Marketing Digital Completo',
    monthlyValue: 5000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active'
  },
  {
    id: '2',
    client: 'E-commerce Plus',
    type: 'Gestão de Redes Sociais',
    monthlyValue: 3000,
    startDate: '2023-06-01',
    endDate: '2024-06-30',
    status: 'expiring'
  },
  {
    id: '3',
    client: 'Startup XYZ',
    type: 'Consultoria Estratégica',
    monthlyValue: 8000,
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    status: 'active'
  },
  {
    id: '4',
    client: 'Consultoria Pro',
    type: 'Branding e Identidade',
    monthlyValue: 4500,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'inactive'
  }
];

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

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
      setContracts(contracts.map(contract => 
        contract.id === editingContract.id 
          ? { ...contractData, id: editingContract.id }
          : contract
      ));
      setEditingContract(null);
    }
  };

  const handleConfirmCancel = () => {
    if (deletingContract) {
      setContracts(contracts.filter(contract => contract.id !== deletingContract.id));
      setDeletingContract(null);
    }
  };

  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiringContracts = contracts.filter(c => c.status === 'expiring');
  const inactiveContracts = contracts.filter(c => c.status === 'inactive');

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
        <Card className="bg-yellow-900/20 border-yellow-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Contratos A Vencer</h3>
          </div>
          <div className="space-y-2">
            {expiringContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-3 bg-yellow-900/10 rounded-lg border border-yellow-800">
                <div>
                  <p className="text-white font-medium">{contract.client}</p>
                  <p className="text-white text-sm">{contract.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {getDaysUntilExpiration(contract.endDate)} dias restantes
                  </p>
                  <p className="text-white text-sm">Vence em {formatDate(contract.endDate)}</p>
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
          <p className="text-goat-gray-400 text-sm mt-1">Contratos são criados automaticamente a partir dos clientes</p>
        </div>
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