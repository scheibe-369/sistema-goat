
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Phone, Mail, MapPin, Calendar, DollarSign, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { EditClientModal } from "./EditClientModal";
import { DeleteClientDialog } from "./DeleteClientDialog";
import { ClientFinancialEntries } from "./ClientFinancialEntries";

interface Client {
  id: string;
  company: string;
  cnpj: string;
  responsible: string;
  phone: string;
  email: string;
  plan?: string;
  contract_end?: string;
  start_date?: string;
  payment_day?: number;
  monthly_value?: number;
  address?: string;
  tags?: string[];
  created_at?: string;
}

interface ClientItemProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  planColor?: string;
  onPlanColorChange?: (planName: string, color: string) => void;
  planColors?: Record<string, string>;
}

export function ClientItem({ 
  client, 
  isExpanded,
  onToggleExpanded,
  onEdit, 
  onDelete, 
  planColor = "bg-purple-600", 
  onPlanColorChange,
  planColors = {}
}: ClientItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não definido";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = () => {
    if (!client.tags || client.tags.length === 0) return "bg-gray-600";
    
    const status = client.tags[0];
    switch (status) {
      case "Ativo":
        return "bg-green-600";
      case "A vencer":
        return "bg-yellow-600";
      case "Vencido":
      case "Inativo":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = (clientData: any) => {
    // Convert ClientData to Client by adding the id
    const updatedClient: Client = {
      id: client.id, // Keep the original client id
      company: clientData.company,
      cnpj: clientData.cnpj,
      responsible: clientData.responsible,
      phone: clientData.phone,
      email: clientData.email,
      contract_end: clientData.contractEnd,
      start_date: clientData.startDate,
      payment_day: clientData.paymentDay,
      monthly_value: clientData.monthlyValue,
      address: clientData.address,
      plan: clientData.plan,
      tags: clientData.tags,
    };
    
    onEdit(updatedClient);
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(client);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6 hover:bg-goat-gray-750 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-goat-purple rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{client.company}</h3>
                {client.tags && client.tags.length > 0 && (
                  <Badge className={`${getStatusColor()} text-white`}>
                    {client.tags[0]}
                  </Badge>
                )}
                {client.plan && (
                  <Badge className={`${planColors[client.plan] || planColor} text-white`}>
                    {client.plan}
                  </Badge>
                )}
              </div>
              <p className="text-goat-gray-400 mb-1">CNPJ: {client.cnpj}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleExpanded}
              variant="ghost"
              size="sm"
              className="text-goat-gray-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleEdit}
              variant="ghost"
              size="sm"
              className="text-goat-gray-400 hover:text-white"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="sm"
              className="text-goat-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-goat-gray-400" />
            <div>
              <p className="text-goat-gray-400 text-sm">Responsável</p>
              <p className="text-white">{client.responsible}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-goat-gray-400" />
            <div>
              <p className="text-goat-gray-400 text-sm">Telefone</p>
              <p className="text-white">{client.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-goat-gray-400" />
            <div>
              <p className="text-goat-gray-400 text-sm">E-mail</p>
              <p className="text-white truncate">{client.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-goat-gray-400" />
            <div>
              <p className="text-goat-gray-400 text-sm">Valor Mensal</p>
              <p className="text-white font-semibold">{formatCurrency(client.monthly_value)}</p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-goat-gray-700 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-goat-gray-400" />
                <div>
                  <p className="text-goat-gray-400 text-sm">Data de Início</p>
                  <p className="text-white">{formatDate(client.start_date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-goat-gray-400" />
                <div>
                  <p className="text-goat-gray-400 text-sm">Fim do Contrato</p>
                  <p className="text-white">{formatDate(client.contract_end)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-goat-gray-400" />
                <div>
                  <p className="text-goat-gray-400 text-sm">Dia de Pagamento</p>
                  <p className="text-white">{client.payment_day || "Não definido"}</p>
                </div>
              </div>
            </div>

            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-goat-gray-400 mt-1" />
                <div>
                  <p className="text-goat-gray-400 text-sm">Endereço</p>
                  <p className="text-white">{client.address}</p>
                </div>
              </div>
            )}

            {/* Lançamentos Financeiros */}
            <ClientFinancialEntries clientId={client.id} />
          </div>
        )}
      </Card>

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={{
          id: client.id,
          company: client.company,
          cnpj: client.cnpj,
          responsible: client.responsible,
          phone: client.phone,
          email: client.email,
          contractEnd: client.contract_end || '',
          paymentDay: client.payment_day || 1,
          tags: client.tags || [],
          address: client.address || '',
          plan: client.plan || '',
          startDate: client.start_date || '',
          monthlyValue: client.monthly_value?.toString() || '0,00',
        }}
        onSave={handleSaveEdit}
        onPlanColorChange={onPlanColorChange}
        planColors={planColors}
      />

      <DeleteClientDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        client={client}
      />
    </>
  );
}
