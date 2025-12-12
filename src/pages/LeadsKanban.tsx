import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Edit,
  EllipsisVertical,
  GripVertical,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";

import { useIsMobile } from "@/hooks/use-mobile";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { useTags, type Tag } from "@/hooks/useTags";
import { useStages, type Stage } from "@/hooks/useStages";
import { useToast } from "@/hooks/use-toast";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DragStart,
} from "@hello-pangea/dnd";

export default function LeadsKanban() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const {
    leads,
    isLoading: leadsLoading,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStage,
  } = useLeads();

  const { tags, isLoading: tagsLoading } = useTags();
  const {
    stages,
    isLoading: stagesLoading,
    createStage,
    updateStage,
    deleteStage,
  } = useStages();

  // ===== Modais / Seleções =====
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("all");

  // ===== Otimista =====
  const [optimisticLeads, setOptimisticLeads] = useState<Lead[]>([]);
  useEffect(() => {
    if (leads) setOptimisticLeads(leads);
  }, [leads]);

  // ===== DnD state =====
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  // ===== Drag-to-scroll (mouse/pen) =====
  const kanbanRef = useRef<HTMLDivElement | null>(null);

  const pan = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastT: 0,
    v: 0, // px/ms
    raf: 0 as number | 0,
  });

  const stopInertia = () => {
    if (pan.current.raf) {
      cancelAnimationFrame(pan.current.raf);
      pan.current.raf = 0;
    }
  };

  const startInertia = () => {
    const container = kanbanRef.current;
    if (!container) return;

    const DECAY = 0.94;
    const MIN = 0.02;

    const step = () => {
      const c = kanbanRef.current;
      if (!c) return;

      // 16ms ~ frame
      c.scrollLeft -= pan.current.v * 16;
      pan.current.v *= DECAY;

      if (Math.abs(pan.current.v) > MIN) {
        pan.current.raf = requestAnimationFrame(step);
      } else {
        stopInertia();
      }
    };

    stopInertia();
    pan.current.raf = requestAnimationFrame(step);
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest(
      [
        "button",
        "[role='button']",
        "a",
        "input",
        "textarea",
        "select",
        "[data-dnd-handle]", // o handle do card
        "[data-rbd-drag-handle-draggable-id]",
        "[data-no-pan]", // deixa só pros botões/menus se você quiser
      ].join(",")
    );
  };

  const onPointerDownPan = (e: React.PointerEvent<HTMLDivElement>) => {
    // só mouse/pen. Touch: deixa nativo (melhor no mobile)
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    if (isDraggingCard) return;

    const container = kanbanRef.current;
    if (!container) return;

    // se clicou em algo interativo, não inicia pan
    if (isInteractiveTarget(e.target)) return;

    stopInertia();

    pan.current.active = true;
    pan.current.pointerId = e.pointerId;
    pan.current.startX = e.clientX;
    pan.current.startScrollLeft = container.scrollLeft;
    pan.current.lastX = e.clientX;
    pan.current.lastT = performance.now();
    pan.current.v = 0;

    container.setPointerCapture(e.pointerId);
  };

  const onPointerMovePan = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = kanbanRef.current;
    if (!container) return;
    if (!pan.current.active) return;
    if (e.pointerId !== pan.current.pointerId) return;

    e.preventDefault();

    const dx = e.clientX - pan.current.startX;
    container.scrollLeft = pan.current.startScrollLeft - dx;

    const now = performance.now();
    const dt = now - pan.current.lastT;
    if (dt > 0) {
      const seg = e.clientX - pan.current.lastX;
      pan.current.v = seg / dt; // px/ms
      pan.current.lastX = e.clientX;
      pan.current.lastT = now;
    }
  };

  const endPan = () => {
    if (!pan.current.active) return;
    pan.current.active = false;

    if (Math.abs(pan.current.v) > 0.02) startInertia();
  };

  const onPointerUpPan = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    if (e.pointerId !== pan.current.pointerId) return;
    endPan();
  };

  const onPointerCancelPan = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    if (e.pointerId !== pan.current.pointerId) return;
    endPan();
  };

  useEffect(() => {
    return () => stopInertia();
  }, []);

  // ===== Helpers =====
  const tagColorClass = (tagName: string) => {
    const t = tags.find((x) => x.name === tagName);
    return t?.color ?? "bg-goat-gray-600";
  };

  const getLeadsByStage = (stageId: string) =>
    optimisticLeads.filter((l) => l.stage === stageId);

  const getFilteredLeads = (stageLeads: Lead[]) => {
    if (activeFilter === "all") return stageLeads;
    return stageLeads.filter((l) => l.tags?.includes(activeFilter));
  };

  // ===== Handlers (CRUD) =====
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
      console.error("Erro ao atualizar lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lead.",
        variant: "destructive",
      });
    }
  };

  const handleAddStage = async (newStageData: { name: string; color: string }) => {
    try {
      await createStage(newStageData);
    } catch (error) {
      console.error("Erro ao criar etapa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a etapa.",
        variant: "destructive",
      });
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
      console.error("Erro ao atualizar etapa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a etapa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      await deleteStage(stageId);
    } catch (error) {
      console.error("Erro ao deletar etapa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a etapa.",
        variant: "destructive",
      });
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
      console.error("Erro ao criar lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead.",
        variant: "destructive",
      });
    }
  };

  // ===== DnD =====
  const onDragStart = (_: DragStart) => setIsDraggingCard(true);

  const onDragEnd = async (result: DropResult) => {
    setIsDraggingCard(false);

    const { source, destination, draggableId } = result;
    if (!destination) return;

    // mesma coluna -> não faz nada (mantém simples; você pode implementar reorder depois)
    if (source.droppableId === destination.droppableId) return;

    const leadToMove = optimisticLeads.find((l) => l.id === draggableId);
    if (!leadToMove) return;

    const previousStage = leadToMove.stage;
    const nextStage = destination.droppableId;

    // UI otimista
    setOptimisticLeads((prev) =>
      prev.map((l) => (l.id === draggableId ? { ...l, stage: nextStage } : l))
    );

    try {
      await updateLeadStage(draggableId, nextStage);
    } catch (error) {
      console.error("Erro ao mover lead:", error);

      // rollback
      setOptimisticLeads((prev) =>
        prev.map((l) => (l.id === draggableId ? { ...l, stage: previousStage } : l))
      );

      toast({
        title: "Erro",
        description: "Não foi possível mover o lead. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // ===== Loading =====
  if (leadsLoading || tagsLoading || stagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div className="relative">
      {/* HEADER FIXO */}
      <div className="fixed inset-x-0 top-0 z-30 bg-goat-dark">
        <div className="px-6 lg:px-10 pt-4 pb-2 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Funil</h1>
              <p className="text-goat-gray-400 text-sm sm:text-base">
                Gerencie seus leads e clientes
              </p>
            </div>

            <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2">
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

          {/* Filtros */}
          <Card
            className="pr-3 pt-3 pb-3 sm:pr-4 sm:pt-4 sm:pb-4 pl-0"
            style={{ backgroundColor: "#080808", border: "none", boxShadow: "none" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-white font-medium text-sm sm:text-base">Filtros:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs sm:text-sm text-white border-goat-gray-600 hover:bg-goat-purple/80 hover:text-white focus:text-white ${
                    activeFilter === "all" ? "bg-goat-purple border-goat-purple" : ""
                  }`}
                  onClick={() => setActiveFilter("all")}
                >
                  Todos os grupos
                </Button>

                {tags.map((tag: Tag) => (
                  <Button
                    key={tag.id}
                    variant="outline"
                    size="sm"
                    className={`text-xs sm:text-sm text-white border-goat-gray-600 hover:bg-goat-purple/80 hover:text-white focus:text-white ${
                      activeFilter === tag.name ? "bg-goat-purple border-goat-purple" : ""
                    }`}
                    onClick={() => setActiveFilter(tag.name)}
                  >
                    <div className={`w-2 h-2 rounded-full ${tag.color} mr-1 sm:mr-2`} />
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="pt-32 pb-6">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div
            ref={kanbanRef}
            className="flex gap-3 sm:gap-6 min-h-[520px] sm:min-h-[620px] overflow-x-auto overflow-y-hidden select-none px-6 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            onPointerDown={onPointerDownPan}
            onPointerMove={onPointerMovePan}
            onPointerUp={onPointerUpPan}
            onPointerCancel={onPointerCancelPan}
          >
            {/* Espaço inicial arrastável */}
            <div className="flex-shrink-0 w-4 h-full" aria-hidden="true" />

            {stages.map((stage: Stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const filteredLeads = getFilteredLeads(stageLeads);

              return (
                <div
                  key={stage.id}
                  className={`flex-shrink-0 space-y-3 sm:space-y-4 ${
                    isMobile ? "w-72" : "w-80"
                  }`}
                >
                  {/* Header da etapa */}
                  <div className="flex items-center justify-between gap-2 pt-8 pb-4 px-3 min-h-[5rem] rounded-t-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${stage.color}`} />
                      <h3 className="font-bold text-white text-base sm:text-lg leading-tight whitespace-nowrap">
                        {stage.name}
                      </h3>
                      <Badge className="bg-goat-gray-600 text-white text-xs hover:bg-goat-purple/80">
                        {filteredLeads.length}
                      </Badge>
                    </div>

                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-goat-gray-400 hover:bg-goat-purple/80 hover:text-white w-7 h-7 sm:w-8 sm:h-8"
                          data-no-pan
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

                  {/* Coluna */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[300px] sm:min-h-[400px] p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? "bg-goat-gray-700/50" : ""
                        }`}
                      >
                        {filteredLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`transition-transform ${
                                  snapshot.isDragging ? "rotate-1 scale-[1.02]" : ""
                                }`}
                              >
                                <ContextMenu>
                                  <ContextMenuTrigger asChild>
                                    <Card className="bg-goat-gray-800 border-goat-gray-700 p-3 sm:p-4 shadow-lg hover:border-goat-purple/50 transition-all duration-200">
                                      <div className="space-y-2 sm:space-y-3">
                                         <div className="flex items-center gap-2">
                                           {/* HANDLE À ESQUERDA */}
                                           <div
                                             {...provided.dragHandleProps}
                                             data-dnd-handle
                                             className="h-7 w-7 sm:h-8 sm:w-8 grid place-items-center rounded-md text-goat-gray-400 hover:bg-goat-gray-700/60 hover:text-white transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
                                             title="Arrastar"
                                           >
                                             <GripVertical className="w-4 h-4" />
                                           </div>

                                           {/* TEXTO */}
                                           <div className="flex-1 min-w-0 pt-1.5">
                                             <h4 className="font-semibold text-white text-sm truncate">{lead.name}</h4>
                                             <p className="text-goat-gray-400 text-xs truncate">{lead.company}</p>
                                           </div>

                                          {/* MENU (3 PONTOS) À DIREITA */}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-goat-gray-400 hover:bg-goat-purple/80 hover:text-white h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                                            onClick={() => handleEditLead(lead)}
                                            data-no-pan
                                          >
                                            <EllipsisVertical className="w-4 h-4" />
                                          </Button>
                                        </div>

                                        {lead.tags && lead.tags.length > 0 && (
                                          <Badge
                                            className={`text-xs text-white truncate max-w-full ${tagColorClass(
                                              lead.tags[0]
                                            )} hover:opacity-90`}
                                          >
                                            {lead.tags[0]}
                                          </Badge>
                                        )}

                                        {lead.value != null && (
                                          <div className="text-goat-purple font-semibold text-xs sm:text-sm">
                                            R$ {lead.value.toLocaleString("pt-BR")}
                                          </div>
                                        )}

                                        <div className="flex items-center gap-1 sm:gap-2 text-xs text-goat-gray-500 pt-2 border-t border-goat-gray-700">
                                          <Calendar className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">
                                            {isMobile
                                              ? new Date(lead.updated_at).toLocaleDateString("pt-BR", {
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                })
                                              : `Atualizado em ${new Date(lead.updated_at).toLocaleDateString(
                                                  "pt-BR"
                                                )}`}
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

            {/* Espaço final arrastável */}
            <div className="flex-shrink-0 w-6 h-full" aria-hidden="true" />
          </div>
        </DragDropContext>

        {/* Modais */}
        <TagsManagementModal open={isTagsModalOpen} onOpenChange={setIsTagsModalOpen} />

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
    </div>
  );
}
