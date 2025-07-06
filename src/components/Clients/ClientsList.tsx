
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
    contractEnd: string;
    paymentDay: number;
    tags: string[];
    address: string;
    plan: string;
    startDate: string;
    planColor?: string;
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
    contractEnd: string;
    paymentDay: number;
    tags: string[];
    address: string;
    plan: string;
    startDate: string;
    planColor?: string;
  }) => void;
  onDeleteClient: (client: {
    id: string;
    company: string;
    cnpj: string;
    responsible: string;
    phone: string;
    email: string;
    contractEnd: string;
    paymentDay: number;
    tags: string[];
    address: string;
    plan: string;
    startDate: string;
    planColor?: string;
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
            client={{
              id: client.id,
              company: client.company,
              cnpj: client.cnpj,
              responsible: client.responsible,
              phone: client.phone,
              email: client.email,
              plan: client.plan,
              contract_end: client.contractEnd,
              start_date: client.startDate,
              payment_day: client.paymentDay,
              monthly_value: 0, // This should be populated from the actual client data
              address: client.address,
              tags: client.tags,
            }}
            isExpanded={expandedClients.includes(client.id)}
            onToggleExpanded={() => onToggleExpanded(client.id)}
            onEdit={(updatedClient) => onEditClient({
              id: updatedClient.id,
              company: updatedClient.company,
              cnpj: updatedClient.cnpj,
              responsible: updatedClient.responsible,
              phone: updatedClient.phone,
              email: updatedClient.email,
              contractEnd: updatedClient.contract_end || '',
              paymentDay: updatedClient.payment_day || 1,
              tags: updatedClient.tags || [],
              address: updatedClient.address || '',
              plan: updatedClient.plan || '',
              startDate: updatedClient.start_date || '',
            })}
            onDelete={(clientToDelete) => onDeleteClient({
              id: clientToDelete.id,
              company: clientToDelete.company,
              cnpj: clientToDelete.cnpj,
              responsible: clientToDelete.responsible,
              phone: clientToDelete.phone,
              email: clientToDelete.email,
              contractEnd: clientToDelete.contract_end || '',
              paymentDay: clientToDelete.payment_day || 1,
              tags: clientToDelete.tags || [],
              address: clientToDelete.address || '',
              plan: clientToDelete.plan || '',
              startDate: clientToDelete.start_date || '',
            })}
            planColors={planColors}
          />
        ))}
      </div>
    </Card>
  );
}
