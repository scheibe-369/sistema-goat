
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface KanbanHeaderProps {
  onOpenTagsModal: () => void;
  onOpenAddStageModal: () => void;
}

export function KanbanHeader({ onOpenTagsModal, onOpenAddStageModal }: KanbanHeaderProps) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {/* Title Section */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
          <p className="text-goat-gray-400 text-sm lg:text-base">Gerencie seu pipeline de vendas</p>
        </div>
        
        {/* Buttons Section */}
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <Button
            className="btn-primary text-xs lg:text-sm px-2 lg:px-3 py-2 min-w-0 flex-shrink-0"
            onClick={onOpenTagsModal}
          >
            <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
            <span className="hidden xs:inline">Gerenciar</span>
            <span className="xs:hidden">Tags</span>
            <span className="hidden xs:inline ml-1">Tags</span>
          </Button>
          <Button
            className="btn-primary text-xs lg:text-sm px-2 lg:px-3 py-2 min-w-0 flex-shrink-0"
            onClick={onOpenAddStageModal}
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
            <span className="hidden xs:inline">Nova</span>
            <span className="xs:hidden">Etapa</span>
            <span className="hidden xs:inline ml-1">Etapa</span>
          </Button>
          <Button className="btn-primary text-xs lg:text-sm px-2 lg:px-3 py-2 min-w-0 flex-shrink-0">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
            <span className="hidden xs:inline">Novo</span>
            <span className="xs:hidden">Lead</span>
            <span className="hidden xs:inline ml-1">Lead</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
