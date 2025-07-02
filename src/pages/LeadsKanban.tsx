
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, EllipsisVertical, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useIsMobile } from "@/hooks/use-mobile";
import { useLeads, Lead } from "@/hooks/useLeads";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
}

// Stages predefinidas
const DEFAULT_STAGES: Stage[] = [
  { id: 'Sem atendimento', name: 'Sem atendimento', color: 'bg-gray-500' },
  { id: 'Em atendimento', name: 'Em atendimento', color: 'bg-yellow-500' },
  { id: 'Reunião agendada', name: 'Reunião agendada', color: 'bg-blue-500' },
  { id: 'Proposta enviada', name: 'Proposta enviada', color: 'bg-purple-500' },
  { id: 'Frio', name: 'Frio', color: 'bg-gray-400' }
];

const defaultTags: Tag[] = [];

export default function LeadsKanban() {
  const isMobile = useIsMobile();
  const { leads, isLoading, createLead, updateLead, deleteLead } = useLeads();
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Momentum Scroll
  const kanbanRef = useRef<HTMLDivElement>(null);
  const momentumRef = useRef<number | null>(null);
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const lastMoveX = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const velocity = useRef<number>(0);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchScrollLeft, setTouchScrollLeft] = useState(0);
  const touchLastX = useRef(0);
  const touchLastTime = useRef(0);
  const touchVelocity = useRef(0);

  useEffect(() => {
    return () => {
      if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
    };
  }, []);

  // Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-drag-card]')) return;
    setIsDraggingScroll(true);
    setStartX(e.pageX - (kanbanRef.current?.offsetLeft || 0));
    setScrollLeft(kanbanRef.current?.scrollLeft || 0);
    lastMoveX.current = e.pageX;
    lastMoveTime.current = Date.now();
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
    document.body.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll || !kanbanRef.current) return;
    e.preventDefault();
    const x = e.pageX - (kanbanRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.2;
    kanbanRef.current.scrollLeft = scrollLeft - walk;

    const now = Date.now();
    velocity.current = (e.pageX - lastMoveX.current) / (now - lastMoveTime.current + 1e-6);
    lastMoveX.current = e.pageX;
    lastMoveTime.current = now;
  };

  const handleMouseUp = () => {
    setIsDraggingScroll(false);
    document.body.style.cursor = "";
    if (!kanbanRef.current) return;

    let momentum = velocity.current * 50;
    const deceleration = 0.93;

    function animate() {
      if (Math.abs(momentum) < 0.2) return;
      kanbanRef.current!.scrollLeft -= momentum;
      momentum *= deceleration;
      momentumRef.current = requestAnimationFrame(animate);
    }
    if (Math.abs(momentum) > 1) animate();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-card]')) return;
    setIsDraggingScroll(true);
    setTouchStartX(e.touches[0].pageX - (kanbanRef.current?.offsetLeft || 0));
    setTouchScrollLeft(kanbanRef.current?.scrollLeft || 0);
    touchLastX.current = e.touches[0].pageX;
    touchLastTime.current = Date.now();
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingScroll || !kanbanRef.current) return;
    const x = e.touches[0].pageX - (kanbanRef.current.offsetLeft || 0);
    const walk = (x - touchStartX) * 1.1;
    kanbanRef.current.scrollLeft = touchScrollLeft - walk;

    const now = Date.now();
    touchVelocity.current = (e.touches[0].pageX - touchLastX.current) / (now - touchLastTime.current + 1e-6);
    touchLastX.current = e.touches[0].pageX;
    touchLastTime.current = now;
  };

  const handleTouchEnd = () => {
    setIsDraggingScroll(false);

    let momentum = touchVelocity.current * 70;
    const deceleration = 0.92;

    function animate() {
      if (!kanbanRef.current) return;
      if (Math.abs(momentum) < 0.3) return;
      kanbanRef.current.scrollLeft -= momentum;
      momentum *= deceleration;
      momentumRef.current = requestAnimationFrame(animate);
    }
    if (Math.abs(momentum) > 1) animate();
  };

  const getGroupColor = (group: string) => {
    const tag = tags.find(t => t.name === group);
    if (tag) return `${tag.color} text-white hover:${tag.color}`;
    return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalOpen(true);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    try {
      await updateLead(updatedLead.id, {
        name: updatedLead.name,
        company: updatedLead.company,
        phone: updatedLead.phone,
        email: updatedLead.email,
        stage: updatedLead.stage,
        tags: updatedLead.tags,
        value: updatedLead.value,
        notes: updatedLead.notes,
      });
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
    }
  };

  const handleAddStage = (newStageData: { name: string; color: string }) => {
    const newStage: Stage = {
      id: newStageData.name,
      name: newStageData.name,
      color: newStageData.color,
    };
    setStages(prev => [...prev, newStage]);
  };

  const handleAddLead = async (newLeadData: { name: string; company: string; phone: string; email?: string; stage: string; tags?: string[]; value?: number }) => {
    try {
      // Converter valor de string para número se necessário
      const value = typeof newLeadData.value === 'string' 
        ? parseFloat(newLeadData.value.replace(/[^\d,.-]/g, '').replace(',', '.')) || null
        : newLeadData.value || null;

      await createLead({
        name: newLeadData.name,
        company: newLeadData.company,
        phone: newLeadData.phone,
        email: newLeadData.email,
        stage: newLeadData.stage,
        tags: newLeadData.tags,
        value: value,
      });
    } catch (error) {
      console.error('Erro ao criar lead:', error);
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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Encontrar o lead sendo movido
    const sourceStageLeads = getLeadsByStage(source.droppableId);
    const movedLead = sourceStageLeads[source.index];
    
    if (movedLead) {
      try {
        await updateLead(movedLead.id, {
          stage: destination.droppableId
        });
      } catch (error) {
        console.error('Erro ao mover lead:', error);
      }
    }
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.stage === stageId);
  };

  const getFilteredStages = () => {
    return stages.map(stage => ({
      ...stage,
      leads: getLeadsByStage(stage.id).filter(lead => {
        if (activeFilter === 'all') return true;
        return lead.tags?.includes(activeFilter);
      })
    }));
  };

  const filteredStages = getFilteredStages();
  const totalLeads = leads.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-goat-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-goat-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Funil</h1>
          <p className="text-goat-gray-400 text-sm sm:text-base">Gerencie seus leads e clientes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button 
            className="btn-primary h-10 px-3 sm:px-4 text-xs sm:text-sm" 
            onClick={() => setIsTagsModalOpen(true)}
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {isMobile ? "Tags" : "Gerenciar Tags"}
          </Button>
          <Button 
            className="btn-primary h-10 px-3 sm:px-4 text-xs sm:text-sm" 
            onClick={() => setIsAddStageModalOpen(true)}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {isMobile ? "Etapa" : "Nova Etapa"}
          </Button>
          <Button 
            className="btn-primary h-10 px-3 sm:px-4 text-xs sm:text-sm" 
            onClick={() => setIsNewLeadModalOpen(true)}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {isMobile ? "Lead" : "Novo Lead"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card 
        className="p-3 sm:p-4" 
        style={{ backgroundColor: '#080808', border: 'none', boxShadow: 'none' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <span className="text-white font-medium text-sm sm:text-base">Filtros:</span>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs sm:text-sm text-white border-goat-gray-600 hover:bg-goat-purple/80 hover:text-white focus:text-white ${
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
                className={`text-xs sm:text-sm text-white border-goat-gray-600 hover:bg-goat-purple/80 hover:text-white focus:text-white ${
                  activeFilter === tag.name ? 'bg-goat-purple border-goat-purple' : ''
                }`}
                onClick={() => setActiveFilter(tag.name)}
              >
                <div className={`w-2 h-2 rounded-full ${tag.color} mr-1 sm:mr-2`}></div>
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {totalLeads === 0 && (
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-12">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum lead encontrado</h3>
            <p className="text-goat-gray-400 mb-6">Comece adicionando seu primeiro lead ao funil de vendas.</p>
            <Button 
              onClick={() => setIsNewLeadModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Lead
            </Button>
          </div>
        </Card>
      )}

      {/* Kanban Board */}
      {totalLeads > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div
            ref={kanbanRef}
            className={`flex gap-3 sm:gap-6 min-h-[500px] sm:min-h-[600px] overflow-x-auto overflow-y-hidden pb-4 ${
              isMobile ? 'px-1' : ''
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              cursor: isDraggingScroll ? "grabbing" : "grab",
              userSelect: isDraggingScroll ? "none" : "auto",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {filteredStages.map((stage) => (
              <div key={stage.id} className={`flex-shrink-0 space-y-3 sm:space-y-4 ${
                isMobile ? 'w-72' : 'w-80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${stage.color}`}></div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">{stage.name}</h3>
                    <Badge className="bg-goat-gray-600 text-goat-gray-300 text-xs">
                      {stage.leads.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-goat-gray-400 hover:text-white p-1"
                    onClick={() => handleEditStage(stage)}
                  >
                    <EllipsisVertical className="w-4 h-4" />
                  </Button>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[400px] p-3 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-goat-gray-700/50' : 'bg-goat-gray-800/30'
                      }`}
                    >
                      {stage.leads.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-goat-gray-500 text-sm">Nenhum lead nesta etapa</p>
                        </div>
                      ) : (
                        stage.leads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                data-drag-card
                                className={`p-3 sm:p-4 bg-goat-gray-800 border border-goat-gray-700 rounded-lg cursor-pointer hover:border-goat-purple/50 transition-all ${
                                  snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                }`}
                                onClick={() => handleEditLead(lead)}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium text-white text-sm">{lead.name}</h4>
                                  </div>
                                  {lead.company && <p className="text-goat-gray-300 text-xs">{lead.company}</p>}
                                  {lead.phone && <p className="text-goat-gray-400 text-xs">{lead.phone}</p>}
                                  {lead.value && (
                                    <p className="text-goat-purple font-semibold text-sm">
                                      R$ {lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                  )}
                                  {lead.tags && lead.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {lead.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} className={`text-xs ${getGroupColor(tag)}`}>
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

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
        onUpdateLead={handleUpdateLead}
        stages={stages}
        tags={tags}
      />

      <AddStageModal
        open={isAddStageModalOpen}
        onOpenChange={setIsAddStageModalOpen}
        onAddStage={handleAddStage}
      />

      <NewLeadModal
        open={isNewLeadModalOpen}
        onOpenChange={setIsNewLeadModalOpen}
        onAddLead={handleAddLead}
        stages={stages}
        tags={tags}
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
