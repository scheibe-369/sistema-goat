import { DragDropContext, DropResult, DragUpdate, DragStart } from 'react-beautiful-dnd';
import { useAutoScroll } from "@/hooks/useAutoScroll";
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
  const autoScrollRef = useRef<number | null>(null);
  const lastMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  // Configurações do auto-scroll
  const AUTO_SCROLL_CONFIG = {
    triggerZone: 120,
    maxSpeed: 12,
    speedMultiplier: 0.15,
    acceleration: 1.2
  };

  // Função para calcular a velocidade do auto-scroll baseada na distância da borda
  const calculateScrollSpeed = useCallback((mouseX: number, containerRect: DOMRect) => {
    const { triggerZone, maxSpeed, speedMultiplier } = AUTO_SCROLL_CONFIG;
    
    const leftDistance = mouseX - containerRect.left;
    const rightDistance = containerRect.right - mouseX;
    
    let speed = 0;
    let direction = 0;
    
    // Scroll para a esquerda
    if (leftDistance < triggerZone && leftDistance > 0) {
      const intensity = (triggerZone - leftDistance) / triggerZone;
      speed = Math.min(maxSpeed, intensity * maxSpeed * speedMultiplier * 10);
      direction = -1;
    }
    // Scroll para a direita
    else if (rightDistance < triggerZone && rightDistance > 0) {
      const intensity = (triggerZone - rightDistance) / triggerZone;
      speed = Math.min(maxSpeed, intensity * maxSpeed * speedMultiplier * 10);
      direction = 1;
    }
    
    return { speed, direction };
  }, []);

  // Função para executar o auto-scroll
  const performAutoScroll = useCallback(() => {
    if (!scrollContainerRef.current || !isCardBeingDragged) return;
    
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const { x: mouseX } = lastMousePositionRef.current;
    
    const { speed, direction } = calculateScrollSpeed(mouseX, containerRect);
    
    if (speed > 0) {
      container.scrollLeft += direction * speed;
      
      // Continua o auto-scroll se ainda estiver na zona de trigger
      autoScrollRef.current = requestAnimationFrame(performAutoScroll);
    } else {
      // Para o auto-scroll se saiu da zona de trigger
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    }
  }, [isCardBeingDragged, calculateScrollSpeed]);

  // Função para parar o auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Atualiza a posição do mouse e gerencia o auto-scroll
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isCardBeingDragged) return;
    
    lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    
    if (!scrollContainerRef.current) return;
    
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const { speed } = calculateScrollSpeed(e.clientX, containerRect);
    
    // Inicia o auto-scroll se não estiver rodando e estiver na zona de trigger
    if (speed > 0 && !autoScrollRef.current) {
      autoScrollRef.current = requestAnimationFrame(performAutoScroll);
    }
    // Para o auto-scroll se saiu da zona de trigger
    else if (speed === 0 && autoScrollRef.current) {
      stopAutoScroll();
    }
  }, [isCardBeingDragged, calculateScrollSpeed, performAutoScroll, stopAutoScroll]);

  // Effect para gerenciar eventos de mouse durante o drag
  useEffect(() => {
    if (isCardBeingDragged) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        stopAutoScroll();
      };
    }
  }, [isCardBeingDragged, handleMouseMove, stopAutoScroll]);

  // Limpa o auto-scroll quando o componente é desmontado
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
    
    // Captura a posição inicial do mouse
    const handleInitialMouseMove = (e: MouseEvent) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
      document.removeEventListener('mousemove', handleInitialMouseMove);
    };
    
    document.addEventListener('mousemove', handleInitialMouseMove, { once: true });
  };

  const handleDragUpdate = (update: DragUpdate) => {
    // O auto-scroll é gerenciado pelo evento mousemove
    // Aqui podemos adicionar outras lógicas se necessário
  };

  const handleDragEnd = (result: DropResult) => {
    stopAutoScroll();
    setIsCardBeingDragged(false);
    
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

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
        overflow: 'auto'
      }}
    >
      <DragDropContext 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
      >
        <div className="kanban-stages-wrapper">
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