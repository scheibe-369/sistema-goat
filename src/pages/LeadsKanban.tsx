
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Tag as TagIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KanbanBoard } from "@/components/Leads/KanbanBoard";
import { FiltersBar } from "@/components/Leads/FiltersBar";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { Stage, Lead, Tag } from "@/types/kanban";
import { useToast } from "@/hooks/use-toast";

export default function LeadsKanban() {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Modals state
  const [newLeadModal, setNewLeadModal] = useState(false);
  const [editLeadModal, setEditLeadModal] = useState(false);
  const [addStageModal, setAddStageModal] = useState(false);
  const [editStageModal, setEditStageModal] = useState(false);
  const [tagsModal, setTagsModal] = useState(false);
  
  // Selected items
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  // Initialize data
  useEffect(() => {
    // Initialize tags
    const initialTags: Tag[] = [
      { id: '1', name: 'Quente', color: 'bg-red-500' },
      { id: '2', name: 'Frio', color: 'bg-blue-500' },
      { id: '3', name: 'Morno', color: 'bg-yellow-500' },
      { id: '4', name: 'Corporativo', color: 'bg-purple-500' },
      { id: '5', name: 'Pessoa Física', color: 'bg-green-500' },
    ];
    
    // Initialize stages with leads
    const initialStages: Stage[] = [
      {
        id: 'prospecting',
        name: 'Prospecção',
        color: 'bg-blue-500',
        leads: [
          {
            id: '1',
            name: 'João Silva',
            company: 'Tech Corp',
            phone: '(11) 99999-9999',
            email: 'joao@techcorp.com',
            group: 'Quente',
            lastUpdate: '2024-01-15'
          },
          {
            id: '2',
            name: 'Maria Santos',
            company: 'StartupXYZ',
            phone: '(11) 88888-8888',
            email: 'maria@startupxyz.com',
            group: 'Frio',
            lastUpdate: '2024-01-14'
          }
        ]
      },
      {
        id: 'contact',
        name: 'Primeiro Contato',
        color: 'bg-yellow-500',
        leads: [
          {
            id: '3',
            name: 'Pedro Oliveira',
            company: 'Big Company',
            phone: '(11) 77777-7777',
            email: 'pedro@bigcompany.com',
            group: 'Morno',
            lastUpdate: '2024-01-13'
          }
        ]
      },
      {
        id: 'proposal',
        name: 'Proposta',
        color: 'bg-orange-500',
        leads: [
          {
            id: '4',
            name: 'Ana Costa',
            company: 'Empresa ABC',
            phone: '(11) 66666-6666',
            email: 'ana@empresaabc.com',
            group: 'Corporativo',
            lastUpdate: '2024-01-12'
          }
        ]
      },
      {
        id: 'negotiation',
        name: 'Negociação',
        color: 'bg-purple-500',
        leads: [
          {
            id: '5',
            name: 'Carlos Ferreira',
            company: 'Inovação Ltd',
            phone: '(11) 55555-5555',
            email: 'carlos@inovacao.com',
            group: 'Pessoa Física',
            lastUpdate: '2024-01-11'
          }
        ]
      },
      {
        id: 'closed',
        name: 'Fechado',
        color: 'bg-green-500',
        leads: [
          {
            id: '6',
            name: 'Lucia Mendes',
            company: 'Global Solutions',
            phone: '(11) 44444-4444',
            email: 'lucia@global.com',
            group: 'Quente',
            lastUpdate: '2024-01-10'
          }
        ]
      }
    ];
    
    setTags(initialTags);
    setStages(initialStages);
  }, []);

  // Lead handlers
  const handleAddLead = (newLead: Omit<Lead, 'id'>) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
    };
    
    const updatedStages = stages.map(stage => 
      stage.id === 'prospecting' ? { ...stage, leads: [...stage.leads, lead] } : stage
    );
    
    setStages(updatedStages);
    toast({ title: "Lead adicionado com sucesso!" });
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditLeadModal(true);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    const updatedStages = stages.map(stage => ({
      ...stage,
      leads: stage.leads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    }));
    
    setStages(updatedStages);
    toast({ title: "Lead atualizado com sucesso!" });
  };

  const handleDeleteLead = (leadId: string) => {
    const updatedStages = stages.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.id !== leadId)
    }));
    
    setStages(updatedStages);
    toast({ title: "Lead removido com sucesso!" });
  };

  // Stage handlers
  const handleAddStage = (newStage: Omit<Stage, 'id' | 'leads'>) => {
    const stage: Stage = {
      ...newStage,
      id: Date.now().toString(),
      leads: []
    };
    
    setStages([...stages, stage]);
    toast({ title: "Etapa adicionada com sucesso!" });
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setEditStageModal(true);
  };

  const handleUpdateStage = (updatedStage: Stage) => {
    const updatedStages = stages.map(stage => 
      stage.id === updatedStage.id ? updatedStage : stage
    );
    
    setStages(updatedStages);
    toast({ title: "Etapa atualizada com sucesso!" });
  };

  return (
    <div className="h-screen flex flex-col bg-goat-black">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-goat-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Leads Kanban</h1>
            <p className="text-goat-gray-400">Gerencie seus leads em um quadro kanban</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setTagsModal(true)}
              variant="outline"
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
            >
              <TagIcon className="w-4 h-4 mr-2" />
              Gerenciar Tags
            </Button>
            <Button
              onClick={() => setAddStageModal(true)}
              variant="outline"
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Nova Etapa
            </Button>
            <Button
              onClick={() => setNewLeadModal(true)}
              className="bg-goat-purple hover:bg-goat-purple/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <FiltersBar
          tags={tags}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
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
        open={newLeadModal}
        onOpenChange={setNewLeadModal}
        tags={tags}
        onAddLead={handleAddLead}
      />

      <EditLeadModal
        open={editLeadModal}
        onOpenChange={setEditLeadModal}
        lead={selectedLead}
        tags={tags}
        onUpdateLead={handleUpdateLead}
      />

      <AddStageModal
        open={addStageModal}
        onOpenChange={setAddStageModal}
        onAddStage={handleAddStage}
      />

      <EditStageModal
        open={editStageModal}
        onOpenChange={setEditStageModal}
        stage={selectedStage}
        onUpdateStage={handleUpdateStage}
      />

      <TagsManagementModal
        open={tagsModal}
        onOpenChange={setTagsModal}
        tags={tags}
        onUpdateTags={setTags}
      />
    </div>
  );
}
