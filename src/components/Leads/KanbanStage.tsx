
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { LeadCard } from "./LeadCard";

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

interface KanbanStageProps {
  stage: Stage;
  tags: Tag[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export function KanbanStage({ stage, tags, onEditLead, onDeleteLead }: KanbanStageProps) {
  return (
    <div className="kanban-stage">
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
          <h3 className="font-semibold text-white">{stage.name}</h3>
          <Badge className="bg-goat-gray-600 text-white text-xs hover:bg-goat-gray-700">
            {stage.leads.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="text-goat-gray-400 hover:text-white">
          <Plus className="w-4 h-4" />
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
                    style={{
                      ...provided.draggableProps.style,
                      cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                    }}
                  >
                    <LeadCard
                      lead={lead}
                      tags={tags}
                      onEditLead={onEditLead}
                      onDeleteLead={onDeleteLead}
                    />
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
  );
}
