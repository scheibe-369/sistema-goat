
import { useState } from "react";
import { NewClientModal } from "@/components/Clients/NewClientModal";
import { EditClientModal } from "@/components/Clients/EditClientModal";
import { ClientFilters } from "@/components/Clients/ClientFilters";
import { DeleteClientDialog } from "@/components/Clients/DeleteClientDialog";
import { ClientsHeader } from "@/components/Clients/ClientsHeader";
import { ClientsSearch } from "@/components/Clients/ClientsSearch";
import { ClientsKPIs } from "@/components/Clients/ClientsKPIs";
import { ClientsList } from "@/components/Clients/ClientsList";

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

export default function Clients() {
  const [expandedClients, setExpandedClients] = useState<number[]>([]);
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

  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      company: "Tech Solutions LTDA",
      cnpj: "12.345.678/0001-90",
      responsible: "João Silva",
      phone: "+55 11 99999-9999",
      email: "contato@techsolutions.com",
      contractEnd: "2024-12-31",
      paymentDay: 15,
      tags: ["Ativo", "Premium"],
      address: "São Paulo, SP",
      plan: "Premium",
      startDate: "2024-01-01"
    },
    {
      id: 2,
      company: "Marketing Digital Pro",
      cnpj: "98.765.432/0001-10",
      responsible: "Maria Santos",
      phone: "+55 11 88888-8888",
      email: "maria@marketingpro.com",
      contractEnd: "2024-08-15",
      paymentDay: 5,
      tags: ["A vencer", "Gold"],
      address: "Rio de Janeiro, RJ",
      plan: "Gold",
      startDate: "2023-08-15"
    },
    {
      id: 3,
      company: "Consultoria ABC",
      cnpj: "11.222.333/0001-44",
      responsible: "Pedro Costa",
      phone: "+55 11 77777-7777",
      email: "pedro@consultoriaabc.com",
      contractEnd: "2025-01-31",
      paymentDay: 10,
      tags: ["Ativo", "Standard"],
      address: "Belo Horizonte, MG",
      plan: "Standard",
      startDate: "2024-02-01"
    },
  ]);

  const toggleClientExpanded = (clientId: number) => {
    setExpandedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const handleNewClient = (clientData: Omit<Client, 'id'>) => {
    const newClient = {
      ...clientData,
      id: Math.max(...clients.map(c => c.id)) + 1
    };
    setClients([...clients, newClient]);
    setIsNewClientModalOpen(false);
  };

  const handleEditClient = (clientData: Omit<Client, 'id'>) => {
    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id 
          ? { ...clientData, id: editingClient.id }
          : client
      ));
      setEditingClient(null);
    }
  };

  const handleDeleteClient = (clientId: number) => {
    setClients(clients.filter(client => client.id !== clientId));
    setDeletingClient(null);
  };

  const filteredClients = clients.filter(client => {
    // Search term filter
    const matchesSearch = client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.responsible.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = activeFilters.status.length === 0 || 
                         client.tags.some(tag => activeFilters.status.includes(tag));

    // Plan filter
    const matchesPlan = activeFilters.plan.length === 0 || 
                       (client.plan && activeFilters.plan.includes(client.plan));

    // Location filter
    const matchesLocation = !activeFilters.location || 
                           client.address.toLowerCase().includes(activeFilters.location.toLowerCase());

    // Contract period filter
    const matchesPeriod = (!activeFilters.contractPeriod.start || client.contractEnd >= activeFilters.contractPeriod.start) &&
                         (!activeFilters.contractPeriod.end || client.contractEnd <= activeFilters.contractPeriod.end);

    return matchesSearch && matchesStatus && matchesPlan && matchesLocation && matchesPeriod;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <ClientsHeader onNewClient={() => setIsNewClientModalOpen(true)} />
      
      <ClientsSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFiltersOpen={() => setIsFiltersOpen(true)}
      />

      <ClientsKPIs clients={clients} />

      <ClientsList 
        clients={filteredClients}
        expandedClients={expandedClients}
        onToggleExpanded={toggleClientExpanded}
        onEditClient={setEditingClient}
        onDeleteClient={setDeletingClient}
      />

      <NewClientModal 
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleNewClient}
      />

      <EditClientModal 
        isOpen={!!editingClient}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleEditClient}
      />

      <ClientFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      <DeleteClientDialog
        isOpen={!!deletingClient}
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={() => deletingClient && handleDeleteClient(deletingClient.id)}
      />
    </div>
  );
}
