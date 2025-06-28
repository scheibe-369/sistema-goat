
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface KanbanHeaderProps {
  onOpenTagsModal: () => void;
  onOpenAddStageModal: () => void;
}

export function KanbanHeader({ onOpenTagsModal, onOpenAddStageModal }: KanbanHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
        <p className="text-goat-gray-400 text-sm lg:text-base">Gerencie seu pipeline de vendas</p>
      </div>
      <div className="flex flex-wrap gap-2 lg:gap-3 justify-end">
        <Button
          className="btn-primary text-xs lg:text-sm px-3 lg:px-4 py-2 whitespace-nowrap"
          onClick={onOpenTagsModal}
        >
          <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Gerenciar</span> Tags
        </Button>
        <Button
          className="btn-primary text-xs lg:text-sm px-3 lg:px-4 py-2 whitespace-nowrap"
          onClick={onOpenAddStageModal}
        >
          <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
          Nova Etapa
        </Button>
        <Button className="btn-primary text-xs lg:text-sm px-3 lg:px-4 py-2 whitespace-nowrap">
          <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
          Novo Lead
        </Button>
      </div>
    </div>
  );
}
