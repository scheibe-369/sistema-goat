import { DragDropContext, DropResult, DragUpdate } from 'react-beautiful-dnd';
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { StageColumn } from "./StageColumn";
import { Stage, Lead, Tag } from "@/types/kanban";
import { useState, useEffect } from "react";

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
  const { scrollContainerRef, stopAutoScroll, handleDragUpdate } = useAutoScroll({
    triggerZone: 120,
    maxSpeed: 12,
    speedMultiplier: 0.15
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCardBeingDragged) {
        handleDragUpdate({ clientX: e.clientX, clientY: e.clientY });
      }
    };

    if (isCardBeingDragged) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        stopAutoScroll();
      };
    }
  }, [isCardBeingDragged, handleDragUpdate, stopAutoScroll]);

  const getFilteredStages = () => {
    if (selectedFilter === 'all') {
      return stages;
    }
    
    return stages.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.group === selectedFilter)
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    stopAutoScroll();
    
    if (!result.destination) {
      setIsCardBeingDragged(false);
      return;
    }

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      setIsCardBeingDragged(false);
      return;
    }

    const sourceStageIndex = stages.findIndex(stage => stage.id === source.droppableId);
    const destStageIndex = stages.findIndex(stage => stage.id === destination.droppableId);

    const newStages = [...stages];
    const [movedLead] = newStages[sourceStageIndex].leads.splice(source.index, 1);
    newStages[destStageIndex].leads.splice(destination.index, 0, movedLead);

    onStagesChange(newStages);
    
    setTimeout(() => {
      setIsCardBeingDragged(false);
      setIsDragging(false);
    }, 50);
  };

  const handleDragStart = () => {
    setIsCardBeingDragged(true);
  };

  const onDragUpdate = (update: DragUpdate) => {
    handleDragUpdate(update);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isCardBeingDragged) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: isCardBeingDragged ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: isCardBeingDragged ? 'none' : 'pan-x'
      }}
    >
      <DragDropContext 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={onDragUpdate}
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
