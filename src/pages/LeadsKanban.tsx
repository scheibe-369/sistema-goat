import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MoreVertical, Settings, Edit, Trash2, EllipsisVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useIsMobile } from "@/hooks/use-mobile";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { useTags, type Tag } from "@/hooks/useTags";
import { useStages, type Stage } from "@/hooks/useStages";
import { useToast } from "@/hooks/use-toast";

export default function LeadsKanban() {
  const isMobile = useIsMobile();
  const { leads, isLoading: leadsLoading, createLead, updateLead, deleteLead, updateLeadStage } = useLeads();
  const { tags, isLoading: tagsLoading } = useTags();
  const { stages, isLoading: stagesLoading, createStage, updateStage, deleteStage } = useStages();
  const { toast } = useToast();
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Estado local otimista para drag and drop
  const [optimisticLeads, setOptimisticLeads] = useState<Lead[]>([]);

  // Sincronizar leads do hook com estado otimista
  useEffect(() => {
    setOptimisticLeads(leads);
  }, [leads]);

  // ========== Momentum Scroll ==============
  const kanbanRef = useRef<HTMLDivElement>(null);
  const momentumRef = useRef<number | null>(null);
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Para mouse
  const lastMoveX = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const velocity = useRef<number>(0);

  // Para touch
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

  // Mouse handlers
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

  // Touch handlers
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
    const x = e.touches[0].pageX - (kanbanRef.current?.offsetLeft || 0);
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

  // Utility functions
  const getGroupColor = (group: string) => {
    const tag = tags.find(t => t.name === group);
    if (tag) return `${tag.color} text-white hover:${tag.color}`;
    return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
  };

  // Lead handlers using Supabase
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

  const handleAddStage = async (newStageData: { name: string; color: string }) => {
    try {
      await createStage(newStageData);
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
    }
  };

  const handleAddLead = async (newLeadData: {
    name: string;
    company: string;
    phone: string;
    email?: string;
    stage: string;
    tags?: string[];
    value?: number;
  }) => {
    try {
      await createLead(newLeadData);
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    }
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setIsEditStageModalOpen(true);
  };

  const handleUpdateStage = async (updatedStage: { name: string; color: string }) => {
    if (!selectedStage) return;
    try {
      await updateStage(selectedStage.id, updatedStage);
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      await deleteStage(stageId);
    } catch (error) {
      console.error('Erro ao deletar etapa:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    // Encontrar o lead que foi movido
    const leadToMove = optimisticLeads.find(lead => lead.id === draggableId);
    if (!leadToMove) return;

    // Guardar a etapa anterior para possível rollback
    const previousStage = leadToMove.stage;

    // OPTIMISTIC UI: Atualizar imediatamente o estado local
    setOptimisticLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === draggableId 
          ? { ...lead, stage: destination.droppableId }
          : lead
      )
    );

    try {
      // Tentar atualizar no Supabase
      await updateLeadStage(draggableId, destination.droppableId);
      
      // Se chegou até aqui, deu certo - não precisa fazer nada
      console.log('Lead movido com sucesso para:', destination.droppableId);
      
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      
      // ROLLBACK: Reverter para a etapa anterior em caso de erro
      setOptimisticLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === draggableId 
            ? { ...lead, stage: previousStage }
            : lead
        )
      );

      // Mostrar feedback de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o lead. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Organizar leads por etapas usando o estado otimista
  const getLeadsByStage = (stageId: string) => {
    return optimisticLeads.filter(lead => lead.stage === stageId);
  };

  // Filtrar leads por grupo/tag
  const getFilteredLeads = (stageLeads: Lead[]) => {
    if (activeFilter === 'all') return stageLeads;
    return stageLeads.filter(lead => lead.tags?.includes(activeFilter));
  };

  if (leadsLoading || tagsLoading || stagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="leads-kanban-page">
      {/* HEADER + FILTROS (STICKY) */}
      <div className="leads-kanban-header bg-goat-dark/95 backdrop-blur-sm space-y-4 sm:space-y-6 pb-4 animate-fade-in">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Funil</h1>
          <p className="text-goat-gray-400 text-sm sm:text-base">Gerencie seus leads e clientes</p>
        </div>
        
        {/* Buttons - Responsive Stack */}
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

      {/* Filters - Responsive */}
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

      </div>

      {/* BOARD (colunas + drag & drop) */}
      <div className="mt-4">
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
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const filteredLeads = getFilteredLeads(stageLeads);
            
            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 space-y-3 sm:space-y-4 ${
                  isMobile ? "w-72" : "w-80"
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${stage.color}`}
                    ></div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">
                      {stage.name}
                    </h3>
                    <Badge className="bg-goat-gray-600 text-white text-xs hover:bg-goat-purple/80">
                      {filteredLeads.length}
                    </Badge>
                  </div>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-goat-gray-400 hover:bg-goat-purple/80 hover:text-white w-7 h-7 sm:w-8 sm:h-8"
                        onClick={() => handleEditStage(stage)}
                      >
                        <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="bg-goat-gray-800 border-goat-gray-700">
                      <ContextMenuItem
                        onClick={() => handleEditStage(stage)}
                        className="text-white data-[highlighted]:bg-goat-purple/80 data-[highlighted]:text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Etapa
                      </ContextMenuItem>
                      {!stage.is_default && (
                        <ContextMenuItem
                          onClick={() => handleDeleteStage(stage.id)}
                          className="text-red-400 data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Etapa
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                </div>

                {/* Coluna de cards */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[300px] sm:min-h-[400px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-goat-gray-700/50' : ''
                      }`}
                    >
                      {filteredLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform`}
                              data-drag-card
                            >
                              <ContextMenu>
                                <ContextMenuTrigger>
                                  <Card className="bg-goat-gray-800 border-goat-gray-700 p-3 sm:p-4 cursor-pointer hover:border-goat-purple/50 transition-all duration-200 shadow-lg">
                                    <div className="space-y-2 sm:space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-white text-sm truncate">
                                            {lead.name}
                                          </h4>
                                          <p className="text-goat-gray-400 text-xs truncate">
                                            {lead.company}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-goat-gray-400 hover:bg-goat-purple/80 hover:text-white h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ml-2"
                                          onClick={() => handleEditLead(lead)}
                                        >
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      {lead.tags && lead.tags.length > 0 && (
                                        <Badge
                                          className={`text-xs ${getGroupColor(
                                            lead.tags[0]
                                          )} truncate max-w-full`}
                                        >
                                          {lead.tags[0]}
                                        </Badge>
                                      )}

                                      {lead.value && (
                                        <div className="text-goat-purple font-semibold text-xs sm:text-sm">
                                          R$ {lead.value.toLocaleString("pt-BR")}
                                        </div>
                                      )}

                                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-goat-gray-500 pt-2 border-t border-goat-gray-700">
                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">
                                          {isMobile
                                            ? new Date(lead.updated_at).toLocaleDateString(
                                                "pt-BR",
                                                { day: "2-digit", month: "2-digit" }
                                              )
                                            : `Atualizado em ${new Date(
                                                lead.updated_at
                                              ).toLocaleDateString("pt-BR")}`}
                                        </span>
                                      </div>
                                    </div>
                                  </Card>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="bg-goat-gray-800 border-goat-gray-700">
                                  <ContextMenuItem
                                    onClick={() => handleEditLead(lead)}
                                    className="text-white data-[highlighted]:bg-goat-purple/80 data-[highlighted]:text-white"
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
                      {filteredLeads.length === 0 && (
                        <div className="border-2 border-dashed border-goat-gray-700 rounded-lg p-4 sm:p-6 text-center">
                          <p className="text-goat-gray-400 text-xs sm:text-sm">
                            {isMobile ? "Arraste leads" : "Arraste leads para cá"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
        </DragDropContext>
      </div>

      {/* Modais */}
      <TagsManagementModal
        open={isTagsModalOpen}
        onOpenChange={setIsTagsModalOpen}
      />
      <EditLeadModal
        open={isEditLeadModalOpen}
        onOpenChange={setIsEditLeadModalOpen}
        lead={selectedLead}
        tags={tags}
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
        tags={tags}
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
