import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Calendar, MoreVertical, Settings, Edit, Trash2, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  stage: string;
  lastUpdate: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

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
        stage: 'Sem atendimento',
        lastUpdate: '2024-01-15'
      },
      {
        id: '2',
        name: 'Maria Santos',
        company: 'Digital Marketing',
        phone: '(11) 88888-8888',
        stage: 'Sem atendimento',
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
        stage: 'Em atendimento',
        lastUpdate: '2024-01-16'
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
        stage: 'Reunião agendada',
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
        stage: 'Proposta enviada',
        lastUpdate: '2024-01-18'
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
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getGroupColor = (group: string) => {
    const tag = tags.find(t => t.name === group);
    if (tag) {
      return `${tag.color} text-white hover:${tag.color}`;
    }
    return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
  };

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

  const handleAddLead = (newLeadData: Omit<Lead, 'id' | 'lastUpdate'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    
    // Find the stage by name and add the lead there
    const targetStageIndex = stages.findIndex(stage => stage.name === newLeadData.stage);
    if (targetStageIndex !== -1) {
      setStages(prev => prev.map((stage, index) => 
        index === targetStageIndex ? { ...stage, leads: [...stage.leads, newLead] } : stage
      ));
    }
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setIsEditStageModalOpen(true);
  };

  const handleUpdateStage = (updatedStage: { name: string; color: string }) => {
    if (!selectedStage) return;
    
    setStages(prev => prev.map(stage =>
      stage.id === selectedStage.id 
        ? { ...stage, name: updatedStage.name, color: updatedStage.color }
        : stage
    ));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStageIndex = stages.findIndex(stage => stage.id === source.droppableId);
    const destStageIndex = stages.findIndex(stage => stage.id === destination.droppableId);

    const newStages = [...stages];
    const [movedLead] = newStages[sourceStageIndex].leads.splice(source.index, 1);
    newStages[destStageIndex].leads.splice(destination.index, 0, movedLead);

    setStages(newStages);
  };

  // Função de filtro
  const getFilteredStages = () => {
    if (activeFilter === 'all') {
      return stages;
    }
    
    return stages.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.group === activeFilter)
    }));
  };

  const filteredStages = getFilteredStages();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
          <p className="text-goat-gray-400">Gerencie seu pipeline de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="btn-primary"
            onClick={() => setIsTagsModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Tags
          </Button>
          <Button
            className="btn-primary"
            onClick={() => setIsAddStageModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
          <Button 
            className="btn-primary"
            onClick={() => setIsNewLeadModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Filtros:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white ${
              activeFilter === 'all' ? 'bg-goat-purple border-goat-purple' : ''
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Todos os grupos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant="outline"
              size="sm"
              className={`text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white ${
                activeFilter === tag.name ? 'bg-goat-purple border-goat-purple' : ''
              }`}
              onClick={() => setActiveFilter(tag.name)}
            >
              <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`}></div>
              {tag.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div 
          className="flex gap-6 min-h-[600px] overflow-x-auto overflow-y-hidden pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {filteredStages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80 space-y-4">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  <h3 className="font-semibold text-white">{stage.name}</h3>
                  <Badge className="bg-goat-gray-600 text-white text-xs hover:bg-goat-gray-700">
                    {stage.leads.length}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-goat-gray-400 hover:text-white"
                  onClick={() => handleEditStage(stage)}
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Lead Cards */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-goat-gray-700/50' : ''
                    }`}
                  >
                    {stage.leads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform`}
                          >
                            <ContextMenu>
                              <ContextMenuTrigger>
                                <Card className="bg-goat-gray-800 border-goat-gray-700 p-4 cursor-pointer hover:border-goat-purple/50 transition-all duration-200 shadow-lg">
                                  <div className="space-y-3">
                                    {/* Lead Header */}
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                                        <p className="text-goat-gray-400 text-xs">{lead.company}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-goat-gray-400 hover:text-white h-6 w-6"
                                        onClick={() => handleEditLead(lead)}
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    {/* Group Badge */}
                                    <Badge className={`text-xs ${getGroupColor(lead.group)}`}>
                                      {lead.group}
                                    </Badge>

                                    {/* Lead Value */}
                                    {lead.value && (
                                      <div className="text-goat-purple font-semibold text-sm">
                                        {lead.value}
                                      </div>
                                    )}

                                    {/* Contact Info */}
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-xs text-goat-gray-400">
                                        <Phone className="w-3 h-3" />
                                        <span>{lead.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-goat-gray-400">
                                        <Mail className="w-3 h-3" />
                                        <span>{lead.email}</span>
                                      </div>
                                    </div>

                                    {/* Last Update */}
                                    <div className="flex items-center gap-2 text-xs text-goat-gray-500 pt-2 border-t border-goat-gray-700">
                                      <Calendar className="w-3 h-3" />
                                      <span>Atualizado em {new Date(lead.lastUpdate).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                </Card>
                              </ContextMenuTrigger>

                              <ContextMenuContent className="bg-goat-gray-800 border-goat-gray-700">
                                <ContextMenuItem
                                  onClick={() => handleEditLead(lead)}
                                  className="text-white data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Lead
                                </ContextMenuItem>
                                <ContextMenuItem
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="text-red-400 data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir Lead
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Empty State */}
                    {stage.leads.length === 0 && (
                      <div className="border-2 border-dashed border-goat-gray-700 rounded-lg p-6 text-center">
                        <p className="text-goat-gray-400 text-sm">Arraste leads para cá</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

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
        stages={stages}
        onUpdateLead={handleUpdateLead}
      />

      <AddStageModal
        open={isAddStageModalOpen}
        onOpenChange={setIsAddStageModalOpen}
        onAddStage={handleAddStage}
      />

      <NewLeadModal
        open={isNewLeadModalOpen}
        onOpenChange={setIsNewLeadModalOpen}
        stages={stages}
        onAddLead={handleAddLead}
      />

      <EditStageModal
        open={isEditStageModalOpen}
        onOpenChange={setIsEditStageModalOpen}
        stage={selectedStage}
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
