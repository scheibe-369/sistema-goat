
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { KanbanStage } from "./KanbanStage";
import { useKanbanScroll } from "@/hooks/useKanbanScroll";

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  group: string;
  lastUpdate: string;
  value?: string;
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

interface KanbanBoardProps {
  stages: Stage[];
  tags: Tag[];
  isCardBeingDragged: boolean;
  onDragStart: () => void;
  onDragEnd: (result: DropResult) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export function KanbanBoard({ 
  stages, 
  tags, 
  isCardBeingDragged, 
  onDragStart, 
  onDragEnd, 
  onEditLead, 
  onDeleteLead 
}: KanbanBoardProps) {
  const {
    scrollContainerRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useKanbanScroll(isCardBeingDragged);

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
        cursor: isCardBeingDragged ? 'default' : (isDragging ? 'grabbing' : 'grab')
      }}
    >
      <DragDropContext 
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        <div className="kanban-stages-wrapper">
          {stages.map((stage) => (
            <KanbanStage
              key={stage.id}
              stage={stage}
              tags={tags}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
