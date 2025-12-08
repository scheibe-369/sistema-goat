
import { Card } from "@/components/ui/card";
import { ClientItem } from "./ClientItem";

interface ClientsListProps {
  clients: Array<{
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
    plan: string;
    startDate: string;
    planColor?: string;
    monthlyValue: string;
  }>;
  expandedClients: string[];
  onToggleExpanded: (clientId: string) => void;
  onEditClient: (client: {
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
    plan: string;
    startDate: string;
    planColor?: string;
    monthlyValue: string;
  }) => void;
  onDeleteClient: (client: {
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
    plan: string;
    startDate: string;
    planColor?: string;
    monthlyValue: string;
  }) => void;
  planColors?: Record<string, string>;
}

export function ClientsList({ 
  clients, 
  expandedClients, 
  onToggleExpanded, 
  onEditClient, 
  onDeleteClient,
  planColors = {}
}: ClientsListProps) {
  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700">
      <div className="p-6 border-b border-goat-gray-700">
        <h3 className="text-lg font-semibold text-white">Lista de Clientes</h3>
      </div>

      <div className="divide-y divide-goat-gray-700">
        {clients.map((client) => (
          <ClientItem
            key={client.id}
            client={client}
            isExpanded={expandedClients.includes(client.id)}
            onToggleExpanded={() => onToggleExpanded(client.id)}
            onEdit={() => onEditClient(client)}
            onDelete={() => onDeleteClient(client)}
            planColors={planColors}
          />
        ))}
      </div>
    </Card>
  );
}
