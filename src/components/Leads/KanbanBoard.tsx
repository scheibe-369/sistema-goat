
import { DragDropContext, DropResult, DragUpdate, DragStart } from 'react-beautiful-dnd';
import { StageColumn } from "./StageColumn";
import { Stage, Lead, Tag } from "@/types/kanban";
import { useState, useRef } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  const { scrollContainerRef, handleDragUpdate, stopAutoScroll } = useAutoScroll({
    triggerZone: 100,
    maxSpeed: 20,
    speedMultiplier: 0.3
  });

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

  const handleDragUpdateWithAutoScroll = (update: DragUpdate) => {
    // Pass the update to the auto-scroll hook
    handleDragUpdate(update);
  };

  const handleDragEnd = (result: DropResult) => {
    stopAutoScroll();
    setIsCardBeingDragged(false);

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
        width: '100vw',
        minWidth: '100vw',
        maxWidth: '100vw',
        marginLeft: 0,
        paddingLeft: 0,
        position: 'relative',
        overflow: 'auto',
        height: '100%',
        cursor: isCardBeingDragged ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: isCardBeingDragged ? 'none' : 'pan-x'
      }}
    >
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdateWithAutoScroll}
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
