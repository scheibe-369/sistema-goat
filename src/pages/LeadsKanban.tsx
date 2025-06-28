import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useState } from "react";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { KanbanBoard } from "@/components/Leads/KanbanBoard";
import { FiltersBar } from "@/components/Leads/FiltersBar";
import { Lead, Tag, Stage } from "@/types/kanban";

const defaultTags: Tag[] = [
  { id: '1', name: 'Clientes GOAT', color: 'bg-purple-600' },
  { id: '2', name: 'Networking', color: 'bg-blue-600' },
];

const mockStages: Stage[] = [
  {
    id: 'no-service',
    name: 'Sem atendimento',
    color: 'bg-gray-500',
    leads: [
      {
        id: '1',
        name: 'João Silva',
        company: 'Tech Innovations',
        phone: '(11) 99999-9999',
        email: 'joao@tech.com',
        group: 'Clientes GOAT',
        lastUpdate: '2024-01-15',
        value: 'R$ 5.000'
      },
      {
        id: '2',
        name: 'Maria Santos',
        company: 'Digital Marketing',
        phone: '(11) 88888-8888',
        email: 'maria@digital.com',
        group: 'Networking',
        lastUpdate: '2024-01-14'
      }
    ]
  },
  {
    id: 'in-service',
    name: 'Em atendimento',
    color: 'bg-yellow-500',
    leads: [
      {
        id: '3',
        name: 'Pedro Costa',
        company: 'E-commerce Plus',
        phone: '(11) 77777-7777',
        email: 'pedro@ecommerce.com',
        group: 'Clientes GOAT',
        lastUpdate: '2024-01-16',
        value: 'R$ 8.000'
      }
    ]
  },
  {
    id: 'meeting-scheduled',
    name: 'Reunião agendada',
    color: 'bg-blue-500',
    leads: [
      {
        id: '4',
        name: 'Ana Oliveira',
        company: 'Startup XYZ',
        phone: '(11) 66666-6666',
        email: 'ana@startup.com',
        group: 'Networking',
        lastUpdate: '2024-01-17'
      }
    ]
  },
  {
    id: 'proposal-sent',
    name: 'Proposta enviada',
    color: 'bg-purple-500',
    leads: [
      {
        id: '5',
        name: 'Carlos Ferreira',
        company: 'Consultoria Pro',
        phone: '(11) 55555-5555',
        email: 'carlos@consultoria.com',
        group: 'Clientes GOAT',
        lastUpdate: '2024-01-18',
        value: 'R$ 12.000'
      }
    ]
  },
  {
    id: 'cold',
    name: 'Frio',
    color: 'bg-gray-400',
    leads: []
  }
];

export default function LeadsKanban() {
  const [stages, setStages] = useState(mockStages);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalOpen(true);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      leads: stage.leads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      )
    })));
  };

  const handleDeleteLead = (leadId: string) => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.id !== leadId)
    })));
  };

  const handleAddStage = (newStageData: { name: string; color: string }) => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: newStageData.name,
      color: newStageData.color,
      leads: []
    };
    setStages(prev => [...prev, newStage]);
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setIsEditStageModalOpen(true);
  };

  const handleUpdateStage = (updatedStage: Stage) => {
    setStages(prev => prev.map(stage =>
      stage.id === updatedStage.id ? updatedStage : stage
    ));
  };

  const handleAddLead = (newLead: Lead, stageId: string) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId
        ? { ...stage, leads: [...stage.leads, newLead] }
        : stage
    ));
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      background: '#111'
    }}>
      {/* Header e filtros centralizados */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 16px 0 16px'
      }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
        <p className="text-goat-gray-400 mb-4">Gerencie seu pipeline de vendas</p>
        <div className="kanban-header-buttons mb-6 flex gap-2">
          <Button className="btn-primary h-10 px-4" onClick={() => setIsTagsModalOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Tags
          </Button>
          <Button className="btn-primary h-10 px-4" onClick={() => setIsAddStageModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
          <Button className="btn-primary h-10 px-4" onClick={() => setIsNewLeadModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
        <FiltersBar
          tags={tags}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Kanban Board ocupa 100vw e não é centralizado */}
      <div style={{
        width: '100vw',
        minWidth: '100vw',
        maxWidth: '100vw',
        margin: 0,
        padding: 0,
        overflowX: 'auto',
        background: 'transparent'
      }}>
        <KanbanBoard
          stages={stages}
          tags={tags}
          selectedFilter={selectedFilter}
          onStagesChange={setStages}
          onEditStage={handleEditStage}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
        />
      </div>

      {/* Modals */}
      <TagsManagementModal
        open={isTagsModalOpen}
        onOpenChange={setIsTagsModalOpen}
        tags={tags}
        onUpdateTags={setTags}
      />
      <EditLeadModal
        open={isEditLeadModalOpen}
        onOpenChange={setIsEditLeadModalOpen}
        lead={selectedLead}
        tags={tags}
        onUpdateLead={handleUpdateLead}
      />
      <AddStageModal
        open={isAddStageModalOpen}
        onOpenChange={setIsAddStageModalOpen}
        onAddStage={handleAddStage}
      />
      <EditStageModal
        open={isEditStageModalOpen}
        onOpenChange={setIsEditStageModalOpen}
        stage={selectedStage}
        onUpdateStage={handleUpdateStage}
      />
      <NewLeadModal
        open={isNewLeadModalOpen}
        onOpenChange={setIsNewLeadModalOpen}
        tags={tags}
        stages={stages}
        onAddLead={handleAddLead}
      />
    </div>
  );
}
