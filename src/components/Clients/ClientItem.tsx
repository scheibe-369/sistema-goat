import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, Calendar, Hash, ChevronDown, ChevronRight } from "lucide-react";
import { usePlansContext } from "@/contexts/PlansContext";

interface Client {
  id: string;
  company: string;
  cnpj: string;
  responsible: string;
  phone: string;
  email: string;
  grupoId?: string;
  contractEnd: string;
  paymentDay: number;
  tags: string[];
  address: string;
  plan?: string;
  startDate?: string;
  planColor?: string;
  monthlyValue?: string;
}

interface ClientItemProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  planColors?: Record<string, string>;
}

export function ClientItem({ client, isExpanded, onToggleExpanded, onEdit, onDelete, planColors = {} }: ClientItemProps) {
  const { getPlanByName } = usePlansContext();

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "ativo":
        return "bg-green-600 text-white hover:bg-green-700";
      case "a vencer":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      case "vencido":
        return "bg-red-600 text-white hover:bg-red-700";
      case "premium":
        return "bg-goat-purple text-white hover:bg-goat-purple";
      case "gold":
        return "bg-yellow-700 text-white hover:bg-yellow-800";
      case "standard":
        return "bg-goat-gray-600 text-white hover:bg-goat-gray-700";
      default:
        return "bg-goat-gray-600 text-white hover:bg-goat-gray-700";
    }
  };

  const getPlanColor = (plan: string) => {
    // First try to get from the plans context (dynamic plans)
    const planFromContext = getPlanByName(plan);
    if (planFromContext && planFromContext.color) {
      return planFromContext.color;
    }

    // Fallback to legacy planColors prop
    if (planColors[plan]) {
      return planColors[plan];
    }
    
    // Default colors for known plans
    switch (plan.toLowerCase()) {
      case "vendas":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "branding":
        return "bg-pink-600 text-white hover:bg-pink-700";
      case "automação":
        return "bg-purple-600 text-white hover:bg-purple-700";
      case "landing page":
        return "bg-green-600 text-white hover:bg-green-700";
      case "premium":
        return "bg-goat-purple text-white hover:bg-goat-purple";
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
              {/* Sempre mostrar o plano primeiro */}
              {client.plan && (
                <Badge className={`text-xs ${getPlanColor(client.plan)}`}>
                  {client.plan}
                </Badge>
              )}
              {/* Depois mostrar as outras tags */}
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

              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Grupo ID:</span>
                  <span className="text-white font-medium">{client.grupoId || 'Não definido'}</span>
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
                    {client.contractEnd ? (() => {
                      const [ano, mes, dia] = client.contractEnd.split('-');
                      return `${dia}/${mes}/${ano}`;
                    })() : 'Não definido'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Início do contrato:</span>
                  <span className="text-white font-medium">
                    {client.startDate ? (() => {
                      const [ano, mes, dia] = client.startDate.split('-');
                      return `${dia}/${mes}/${ano}`;
                    })() : 'Não definido'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-goat-purple" />
                <div className="flex-1">
                  <span className="text-goat-gray-400 text-sm block">Valor mensal:</span>
                  <span className="text-white font-medium">
                    R$ {client.monthlyValue ? parseFloat(client.monthlyValue).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
