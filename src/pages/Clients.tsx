import { useState } from "react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { NewClientModal } from "@/components/Clients/NewClientModal";
import { EditClientModal } from "@/components/Clients/EditClientModal";
import { ClientFilters } from "@/components/Clients/ClientFilters";
import { DeleteClientDialog } from "@/components/Clients/DeleteClientDialog";
import { ClientsHeader } from "@/components/Clients/ClientsHeader";
import { ClientsSearch } from "@/components/Clients/ClientsSearch";
import { ClientsKPIs } from "@/components/Clients/ClientsKPIs";
import { ClientsList } from "@/components/Clients/ClientsList";
import { Tables } from "@/integrations/supabase/types";

type Client = Tables<'clients'>;

interface ClientData {
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
  monthlyValue?: number;
}

// Interface para componentes que esperam formato específico
interface ClientForComponent {
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
}

export default function Clients() {
  const { data: clients = [], isLoading, error } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    status: [] as string[],
    plan: [] as string[],
    contractPeriod: { start: "", end: "" },
    location: ""
  });

  const [planColors, setPlanColors] = useState<Record<string, string>>({});

  const toggleClientExpanded = (clientId: string) => {
    setExpandedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const handleNewClient = async (clientData: ClientData) => {
    try {
      await createClientMutation.mutateAsync({
        company: clientData.company,
        cnpj: clientData.cnpj,
        responsible: clientData.responsible,
        phone: clientData.phone,
        email: clientData.email,
        contract_end: clientData.contractEnd || null,
        payment_day: clientData.paymentDay,
        tags: clientData.tags,
        address: clientData.address || null,
        plan: clientData.plan || null,
        start_date: clientData.startDate || null,
        monthly_value: clientData.monthlyValue || 0,
      });
      setIsNewClientModalOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleEditClient = async (clientData: ClientData) => {
    if (editingClient) {
      try {
        await updateClientMutation.mutateAsync({
          id: editingClient.id,
          company: clientData.company,
          cnpj: clientData.cnpj,
          responsible: clientData.responsible,
          phone: clientData.phone,
          email: clientData.email,
          contract_end: clientData.contractEnd || null,
          payment_day: clientData.paymentDay,
          tags: clientData.tags,
          address: clientData.address || null,
          plan: clientData.plan || null,
          start_date: clientData.startDate || null,
          monthly_value: clientData.monthlyValue || 0,
        });
        setEditingClient(null);
      } catch (error) {
        console.error('Error updating client:', error);
      }
    }
  };

  const handleDeleteClient = async () => {
    if (deletingClient) {
      try {
        await deleteClientMutation.mutateAsync(deletingClient.id);
        setDeletingClient(null);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handlePlanColorChange = (planName: string, color: string) => {
    setPlanColors(prev => ({ ...prev, [planName]: color }));
  };

  // Transform Supabase clients to component format
  const transformedClients: ClientForComponent[] = clients.map(client => ({
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
    planColor: planColors[client.plan || ''] || undefined,
  }));

  const filteredClients = transformedClients.filter(client => {
    const matchesSearch = client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.responsible.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = activeFilters.status.length === 0 || 
                         client.tags.some(tag => activeFilters.status.includes(tag));

    const matchesPlan = activeFilters.plan.length === 0 || 
                       (client.plan && activeFilters.plan.includes(client.plan));

    const matchesLocation = !activeFilters.location || 
                           client.address.toLowerCase().includes(activeFilters.location.toLowerCase());

    const matchesPeriod = (!activeFilters.contractPeriod.start || client.contractEnd >= activeFilters.contractPeriod.start) &&
                         (!activeFilters.contractPeriod.end || client.contractEnd <= activeFilters.contractPeriod.end);

    return matchesSearch && matchesStatus && matchesPlan && matchesLocation && matchesPeriod;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-goat-gray-700 rounded animate-pulse" />
        <div className="h-12 bg-goat-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-goat-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-goat-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-red-400">Erro ao carregar clientes: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ClientsHeader onNewClient={() => setIsNewClientModalOpen(true)} />
      
      <ClientsSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFiltersOpen={() => setIsFiltersOpen(true)}
      />

      <ClientsKPIs clients={transformedClients} />

      <ClientsList 
        clients={filteredClients}
        expandedClients={expandedClients}
        onToggleExpanded={toggleClientExpanded}
        onEditClient={(client) => {
          const supabaseClient = clients.find(c => c.id === client.id);
          if (supabaseClient) {
            setEditingClient(supabaseClient);
          }
        }}
        onDeleteClient={(client) => {
          const supabaseClient = clients.find(c => c.id === client.id);
          if (supabaseClient) {
            setDeletingClient(supabaseClient);
          }
        }}
        planColors={planColors}
      />

      <NewClientModal 
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleNewClient}
        onPlanColorChange={handlePlanColorChange}
        planColors={planColors}
      />

      <EditClientModal 
        isOpen={!!editingClient}
        client={editingClient ? {
          id: editingClient.id,
          company: editingClient.company,
          cnpj: editingClient.cnpj,
          responsible: editingClient.responsible,
          phone: editingClient.phone,
          email: editingClient.email,
          contractEnd: editingClient.contract_end || '',
          paymentDay: editingClient.payment_day || 1,
          tags: editingClient.tags || [],
          address: editingClient.address || '',
          plan: editingClient.plan || '',
          startDate: editingClient.start_date || '',
          monthlyValue: editingClient.monthly_value?.toString() || '0,00',
        } : null}
        onClose={() => setEditingClient(null)}
        onSave={handleEditClient}
        onPlanColorChange={handlePlanColorChange}
        planColors={planColors}
      />

      <ClientFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      <DeleteClientDialog
        isOpen={!!deletingClient}
        client={deletingClient ? {
          id: deletingClient.id,
          company: deletingClient.company,
        } : null}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteClient}
      />
    </div>
  );
}
