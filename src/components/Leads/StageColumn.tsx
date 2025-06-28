
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { Droppable } from 'react-beautiful-dnd';
import { LeadCard } from "./LeadCard";
import { Stage, Lead, Tag } from "@/types/kanban";

interface StageColumnProps {
  stage: Stage;
  tags: Tag[];
  selectedFilter: string;
  onEditStage: (stage: Stage) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export function StageColumn({ 
  stage, 
  tags, 
  selectedFilter, 
  onEditStage, 
  onEditLead, 
  onDeleteLead 
}: StageColumnProps) {
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
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-goat-gray-400 hover:text-white"
          onClick={() => onEditStage(stage)}
        >
          <MoreVertical className="w-4 h-4" />
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
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                tags={tags}
                onEditLead={onEditLead}
                onDeleteLead={onDeleteLead}
              />
            ))}
            {provided.placeholder}

            {/* Empty State */}
            {stage.leads.length === 0 && (
              <div className="border-2 border-dashed border-goat-gray-700 rounded-lg p-6 text-center">
                <p className="text-goat-gray-400 text-sm">
                  {selectedFilter === 'all' 
                    ? 'Arraste leads para cá' 
                    : `Nenhum lead de "${selectedFilter}" nesta etapa`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
