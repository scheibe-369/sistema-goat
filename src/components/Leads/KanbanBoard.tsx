import { DragDropContext, DropResult, DragUpdate, DragStart } from 'react-beautiful-dnd';
import { StageColumn } from "./StageColumn";
import { Stage, Lead, Tag } from "@/types/kanban";
import { useState, useEffect, useRef, useCallback } from "react";

interface KanbanBoardProps {
  stages: Stage[];
  tags: Tag[];
  selectedFilter: string;
  onStagesChange: (stages: Stage[]) => void;
  onEditStage: (stage: Stage) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export function KanbanBoard({ 
  stages, 
  tags, 
  selectedFilter, 
  onStagesChange,
  onEditStage,
  onEditLead,
  onDeleteLead
}: KanbanBoardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const dragXRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  // Auto-scroll config
  const EDGE_SIZE = 100;
  const MAX_SPEED = 20;
  const MIN_SPEED = 4;

  // Função para calcular a velocidade de auto-scroll
  const getAutoScrollSpeed = (mouseX: number, rect: DOMRect) => {
    const leftDist = mouseX - rect.left;
    const rightDist = rect.right - mouseX;

    if (leftDist < EDGE_SIZE && leftDist > 0) {
      const pct = 1 - (leftDist / EDGE_SIZE);
      return -((MAX_SPEED - MIN_SPEED) * pct + MIN_SPEED);
    }
    if (rightDist < EDGE_SIZE && rightDist > 0) {
      const pct = 1 - (rightDist / EDGE_SIZE);
      return (MAX_SPEED - MIN_SPEED) * pct + MIN_SPEED;
    }
    return 0;
  };

  // Loop de auto-scroll usando requestAnimationFrame
  const autoScrollLoop = useCallback(() => {
    if (!isCardBeingDragged || !scrollContainerRef.current || dragXRef.current === null) return;

    const rect = scrollContainerRef.current.getBoundingClientRect();
    const speed = getAutoScrollSpeed(dragXRef.current, rect);

    if (speed !== 0) {
      scrollContainerRef.current.scrollLeft += speed;
      animationRef.current = requestAnimationFrame(autoScrollLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isCardBeingDragged]);

  // Listener global para capturar posição do mouse durante drag
  useEffect(() => {
    if (!isCardBeingDragged) return;
    const handler = (e: MouseEvent) => {
      dragXRef.current = e.clientX;
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(autoScrollLoop);
      }
    };
    document.addEventListener('mousemove', handler, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handler);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      dragXRef.current = null;
    };
  }, [isCardBeingDragged, autoScrollLoop]);

  // Touch support para auto-scroll (opcional, pode melhorar ainda mais para touch events)
  useEffect(() => {
    if (!isCardBeingDragged) return;
    const handler = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        dragXRef.current = e.touches[0].clientX;
        if (!animationRef.current) {
          animationRef.current = requestAnimationFrame(autoScrollLoop);
        }
      }
    };
    document.addEventListener('touchmove', handler, { passive: true });
    return () => document.removeEventListener('touchmove', handler);
  }, [isCardBeingDragged, autoScrollLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Filtro dos stages
  const getFilteredStages = () => {
    if (selectedFilter === 'all') return stages;
    return stages.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.group === selectedFilter)
    }));
  };

  // Drag and drop events
  const handleDragStart = (start: DragStart) => {
    setIsCardBeingDragged(true);
  };

  const handleDragUpdate = (update: DragUpdate) => {
    // Não precisa implementar nada aqui, só usamos o mousemove global!
  };

  const handleDragEnd = (result: DropResult) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsCardBeingDragged(false);
    dragXRef.current = null;

    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStageIndex = stages.findIndex(stage => stage.id === source.droppableId);
    const destStageIndex = stages.findIndex(stage => stage.id === destination.droppableId);

    if (sourceStageIndex === -1 || destStageIndex === -1) return;

    const newStages = [...stages];
    const [movedLead] = newStages[sourceStageIndex].leads.splice(source.index, 1);
    newStages[destStageIndex].leads.splice(destination.index, 0, movedLead);

    onStagesChange(newStages);
  };

  // Scroll manual quando NÃO está arrastando
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isCardBeingDragged) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-rbd-draggable-id]')) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    e.preventDefault();
  };
  const handleMouseMoveScroll = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current || isCardBeingDragged) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Touch scroll manual
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || isCardBeingDragged) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current || isCardBeingDragged) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchEnd = () => setIsDragging(false);

  const filteredStages = getFilteredStages();

  return (
    <div
      ref={scrollContainerRef}
      className="kanban-scroll-fluid"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveScroll}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isCardBeingDragged ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: isCardBeingDragged ? 'none' : 'pan-x',
        position: 'relative',
        overflow: 'auto',
        height: '100%',
        width: '100%'
      }}
    >
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
      >
        <div
          className="kanban-stages-wrapper"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            minHeight: '100%',
            position: 'relative',
            width: 'max-content'
          }}
        >
          {filteredStages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              tags={tags}
              selectedFilter={selectedFilter}
              onEditStage={onEditStage}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
