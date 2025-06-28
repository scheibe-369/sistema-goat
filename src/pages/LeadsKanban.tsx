
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings } from "lucide-react";
import { KanbanBoard } from "@/components/Leads/KanbanBoard";
import { FiltersBar } from "@/components/Leads/FiltersBar";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { Stage, Lead, Tag } from "@/types/kanban";

const LeadsKanban = () => {
  // Initial data
  const [stages, setStages] = useState<Stage[]>([
    {
      id: "1",
      name: "Novos Leads",
      color: "bg-blue-500",
      leads: [
        {
          id: "1",
          name: "João da Silva",
          company: "Tech Corp",
          group: "Premium",
          lastUpdate: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Maria Santos",
          company: "Design Studio",
          group: "Básico",
          lastUpdate: new Date().toISOString(),
        },
      ],
    },
    {
      id: "2",
      name: "Qualificação",
      color: "bg-yellow-500",
      leads: [
        {
          id: "3",
          name: "Pedro Costa",
          company: "Marketing Agency",
          group: "Premium",
          lastUpdate: new Date().toISOString(),
        },
      ],
    },
    {
      id: "3",
      name: "Proposta",
      color: "bg-orange-500",
      leads: [
        {
          id: "4",
          name: "Ana Oliveira",
          company: "E-commerce Plus",
          group: "Enterprise",
          lastUpdate: new Date().toISOString(),
        },
      ],
    },
    {
      id: "4",
      name: "Fechamento",
      color: "bg-green-500",
      leads: [],
    },
  ]);

  const [tags] = useState<Tag[]>([
    { id: "1", name: "Premium", color: "bg-purple-500" },
    { id: "2", name: "Básico", color: "bg-blue-500" },
    { id: "3", name: "Enterprise", color: "bg-red-500" },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [modals, setModals] = useState({
    newLead: false,
    editLead: false,
    editStage: false,
    addStage: false,
    tagsManagement: false,
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  // Modal handlers
  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'editLead') setSelectedLead(null);
    if (modalName === 'editStage') setSelectedStage(null);
  };

  // Lead handlers
  const handleAddLead = (newLead: Omit<Lead, "id">, stageId: string) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
    };

    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, leads: [...stage.leads, lead] }
        : stage
    ));
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    openModal('editLead');
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

  // Stage handlers
  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    openModal('editStage');
  };

  const handleUpdateStage = (updatedStage: Stage) => {
    setStages(prev => prev.map(stage => 
      stage.id === updatedStage.id ? updatedStage : stage
    ));
  };

  const handleAddStage = (newStage: Omit<Stage, "id">) => {
    const stage: Stage = {
      ...newStage,
      id: Date.now().toString(),
    };
    setStages(prev => [...prev, stage]);
  };

  return (
    <div className="kanban-page">
      {/* Header */}
      <div className="kanban-header">
        <Card className="p-6 border-0" style={{ backgroundColor: '#080808' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Pipeline de Leads</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-goat-gray-400 text-sm">
                    {stages.reduce((acc, stage) => acc + stage.leads.length, 0)} leads ativos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-goat-gray-400 text-sm">{stages.length} etapas</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => openModal('newLead')}
                className="bg-goat-purple hover:bg-goat-purple/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal('addStage')}
                className="text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Etapa
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal('tagsManagement')}
                className="text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Tags
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <FiltersBar
        tags={tags}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Kanban Board */}
      <div className="kanban-container">
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
      <NewLeadModal
        open={modals.newLead}
        onOpenChange={(open) => open ? openModal('newLead') : closeModal('newLead')}
        stages={stages}
        tags={tags}
        onAddLead={handleAddLead}
      />

      <EditLeadModal
        open={modals.editLead}
        onOpenChange={(open) => open ? openModal('editLead') : closeModal('editLead')}
        lead={selectedLead}
        stages={stages}
        tags={tags}
        onUpdateLead={handleUpdateLead}
      />

      <EditStageModal
        open={modals.editStage}
        onOpenChange={(open) => open ? openModal('editStage') : closeModal('editStage')}
        stage={selectedStage}
        onUpdateStage={handleUpdateStage}
      />

      <AddStageModal
        open={modals.addStage}
        onOpenChange={(open) => open ? openModal('addStage') : closeModal('addStage')}
        onAddStage={handleAddStage}
      />

      <TagsManagementModal
        open={modals.tagsManagement}
        onOpenChange={(open) => open ? openModal('tagsManagement') : closeModal('tagsManagement')}
      />
    </div>
  );
};

export default LeadsKanban;
