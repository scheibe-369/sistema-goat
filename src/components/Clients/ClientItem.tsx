import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, Calendar, MapPin, ChevronDown, ChevronRight } from "lucide-react";

interface Client {
  id: number;
  company: string;
  cnpj: string;
  responsible: string;
  phone: string;
  email: string;
  contractEnd: string;
  paymentDay: number;
  tags: string[];
  address: string;
  plan?: string;
  startDate?: string;
}

interface ClientItemProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientItem({ client, isExpanded, onToggleExpanded, onEdit, onDelete }: ClientItemProps) {
  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "ativo":
        return "bg-green-600 text-white hover:bg-green-700";
      case "a vencer":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      case "vencido":
        return "bg-red-600 text-white hover:bg-red-700";
      case "premium":
        return "bg-btn-primary text-white hover:bg-goat-purple";
      case "gold":
        return "bg-yellow-700 text-white hover:bg-yellow-800";
      case "standard":
        return "bg-goat-gray-600 text-white hover:bg-goat-gray-700";
      default:
        return "bg-goat-gray-600 text-white hover:bg-goat-gray-700";
    }
  };

  return (
    <div className="hover:bg-goat-gray-900/50 transition-colors">
      <div
        className="p-6 cursor-pointer flex items-center justify-between"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-goat-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-goat-gray-400" />
            )}
          </div>

          <div className="flex items-center gap-3 flex-1">
            <h4 className="text-lg font-semibold text-white">{client.company}</h4>
            <div className="flex gap-2">
              {client.tags.map((tag, index) => (
                <Badge key={index} className={`text-xs ${getTagColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-goat-gray-300">
            <Calendar className="w-4 h-4 text-goat-purple" />
            <span className="text-sm">Pagamento: dia {client.paymentDay}</span>
          </div>
        </div>

        <div className="flex gap-2 ml-6">
          <Button
            size="sm"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Editar
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 border-none"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Excluir
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-9">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">CNPJ:</span>
                  <span className="text-white font-medium">{client.cnpj}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Responsável:</span>
                  <span className="text-white font-medium">{client.responsible}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Telefone:</span>
                  <span className="text-white font-medium">{client.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Email:</span>
                  <span className="text-white font-medium">{client.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Fim do contrato:</span>
                  <span className="text-white font-medium">
                    {new Date(client.contractEnd).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Localização:</span>
                  <span className="text-white font-medium">{client.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
