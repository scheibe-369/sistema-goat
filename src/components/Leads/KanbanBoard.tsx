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
  const autoScrollAnimationRef = useRef<number | null>(null);
  const dragPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  // Configurações do auto-scroll
  const SCROLL_CONFIG = {
    EDGE_SIZE: 100, // Zona de ativação do auto-scroll (100px da borda)
    MAX_SPEED: 15,  // Velocidade máxima
    MIN_SPEED: 2    // Velocidade mínima
  };

  // Função para calcular a velocidade e direção do scroll
  const getScrollSpeed = useCallback((mouseX: number, containerRect: DOMRect) => {
    const { EDGE_SIZE, MAX_SPEED, MIN_SPEED } = SCROLL_CONFIG;
    
    // Distâncias das bordas
    const leftEdgeDistance = mouseX - containerRect.left;
    const rightEdgeDistance = containerRect.right - mouseX;
    
    // Scroll para a esquerda
    if (leftEdgeDistance < EDGE_SIZE && leftEdgeDistance > 0) {
      const intensity = 1 - (leftEdgeDistance / EDGE_SIZE);
      const speed = MIN_SPEED + (intensity * (MAX_SPEED - MIN_SPEED));
      return { speed: -speed, shouldScroll: true };
    }
    
    // Scroll para a direita  
    if (rightEdgeDistance < EDGE_SIZE && rightEdgeDistance > 0) {
      const intensity = 1 - (rightEdgeDistance / EDGE_SIZE);
      const speed = MIN_SPEED + (intensity * (MAX_SPEED - MIN_SPEED));
      return { speed: speed, shouldScroll: true };
    }
    
    return { speed: 0, shouldScroll: false };
  }, []);

  // Função que executa o auto-scroll
  const autoScroll = useCallback(() => {
    if (!scrollContainerRef.current || !isCardBeingDragged) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const { x: mouseX } = dragPositionRef.current;
    
    const { speed, shouldScroll } = getScrollSpeed(mouseX, containerRect);
    
    if (shouldScroll && Math.abs(speed) > 0) {
      // Aplica o scroll
      container.scrollLeft += speed;
      
      // Continua o auto-scroll
      autoScrollAnimationRef.current = requestAnimationFrame(autoScroll);
    } else {
      // Para o auto-scroll se não deve mais scrollar
      if (autoScrollAnimationRef.current) {
        cancelAnimationFrame(autoScrollAnimationRef.current);
        autoScrollAnimationRef.current = null;
      }
    }
  }, [isCardBeingDragged, getScrollSpeed]);

  // Para o auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current);
      autoScrollAnimationRef.current = null;
    }
  }, []);

  // Listener global para capturar movimento do mouse durante drag
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isCardBeingDragged) return;
    
    // Atualiza a posição do drag
    dragPositionRef.current = { x: e.clientX, y: e.clientY };
    
    if (!scrollContainerRef.current) return;
    
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const { shouldScroll } = getScrollSpeed(e.clientX, containerRect);
    
    // Inicia o auto-scroll se necessário
    if (shouldScroll && !autoScrollAnimationRef.current) {
      autoScrollAnimationRef.current = requestAnimationFrame(autoScroll);
    }
  }, [isCardBeingDragged, getScrollSpeed, autoScroll]);

  // Effect para gerenciar eventos globais durante drag
  useEffect(() => {
    if (isCardBeingDragged) {
      // Adiciona listener global
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        stopAutoScroll();
      };
    }
  }, [isCardBeingDragged, handleGlobalMouseMove, stopAutoScroll]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  const getFilteredStages = () => {
    if (selectedFilter === 'all') {
      return stages;
    }
    
    return stages.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.group === selectedFilter)
    }));
  };

  const handleDragStart = (start: DragStart) => {
    setIsCardBeingDragged(true);
    
    // Captura posição inicial do mouse
    const captureInitialPosition = (e: MouseEvent) => {
      dragPositionRef.current = { x: e.clientX, y: e.clientY };
      document.removeEventListener('mousemove', captureInitialPosition);
    };
    
    document.addEventListener('mousemove', captureInitialPosition, { once: true });
  };

  const handleDragUpdate = (update: DragUpdate) => {
    // O auto-scroll é gerenciado pelo mousemove global
    if (!update.destination) return;
  };

  const handleDragEnd = (result: DropResult) => {
    stopAutoScroll();
    setIsCardBeingDragged(false);
    
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // Se dropped no mesmo lugar, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStageIndex = stages.findIndex(stage => stage.id === source.droppableId);
    const destStageIndex = stages.findIndex(stage => stage.id === destination.droppableId);

    if (sourceStageIndex === -1 || destStageIndex === -1) {
      return;
    }

    const newStages = [...stages];
    const [movedLead] = newStages[sourceStageIndex].leads.splice(source.index, 1);
    newStages[destStageIndex].leads.splice(destination.index, 0, movedLead);

    onStagesChange(newStages);
  };

  // Handlers para scroll manual (quando não está arrastando card)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isCardBeingDragged) return;
    
    // Evita conflito com drag de cards
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Handlers para touch (mobile)
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

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

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
        // CRÍTICO: Define o container de scroll para o react-beautiful-dnd
        scrollContainer={scrollContainerRef.current}
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