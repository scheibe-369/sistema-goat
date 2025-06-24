
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";

interface FilterState {
  stages: string[];
  tags: string[];
  direction: string[];
  client: string;
}

interface ConversationSidebarFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function ConversationSidebarFilters({ isOpen, onClose, filters, onFiltersChange }: ConversationSidebarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const stageOptions = [
    "Sem atendimento",
    "Em atendimento", 
    "Reunião agendada",
    "Proposta enviada",
    "Frio"
  ];

  const tagOptions = ["Lead", "Cliente", "Prospect"];
  const directionOptions = ["Entrada", "Saída"];

  const handleStageChange = (stage: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      stages: checked 
        ? [...prev.stages, stage]
        : prev.stages.filter(s => s !== stage)
    }));
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };

  const handleDirectionChange = (direction: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      direction: checked 
        ? [...prev.direction, direction]
        : prev.direction.filter(d => d !== direction)
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      stages: [],
      tags: [],
      direction: [],
      client: ""
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Custom Overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Filters Panel - Slide from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md animate-slide-in-right">
        <div 
          className="h-full bg-goat-gray-800 shadow-2xl border-l border-goat-gray-700 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-goat-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Filtros</h2>
                <p className="text-goat-gray-400 text-sm">Filtre as conversas conforme necessário</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content with Custom Scrollbar */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #404040;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #5315CB;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6B21D3;
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #5315CB #404040;
              }

              /* Animações */
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes slide-in-right {
                from { 
                  transform: translateX(100%); 
                  opacity: 0;
                }
                to { 
                  transform: translateX(0); 
                  opacity: 1;
                }
              }

              .animate-fade-in {
                animation: fade-in 0.2s ease-out;
              }

              .animate-slide-in-right {
                animation: slide-in-right 0.3s ease-out;
              }
            `}</style>
            
            <div className="p-6 space-y-8">
              {/* Nome do Cliente */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Cliente
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-white">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    placeholder="Buscar por nome..."
                    value={localFilters.client}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, client: e.target.value }))}
                    className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                  />
                </div>
              </div>

              {/* Etapas do Kanban */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Etapa do Kanban
                </h3>
                
                <div className="space-y-3">
                  {stageOptions.map((stage) => (
                    <div key={stage} className="flex items-center space-x-3">
                      <Checkbox
                        id={`stage-${stage}`}
                        checked={localFilters.stages.includes(stage)}
                        onCheckedChange={(checked) => handleStageChange(stage, checked as boolean)}
                        className="border-goat-gray-600 data-[state=checked]:bg-goat-purple data-[state=checked]:border-goat-purple"
                      />
                      <Label 
                        htmlFor={`stage-${stage}`} 
                        className="text-white cursor-pointer hover:text-goat-purple transition-colors"
                      >
                        {stage}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Tags
                </h3>
                
                <div className="space-y-3">
                  {tagOptions.map((tag) => (
                    <div key={tag} className="flex items-center space-x-3">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={localFilters.tags.includes(tag)}
                        onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
                        className="border-goat-gray-600 data-[state=checked]:bg-goat-purple data-[state=checked]:border-goat-purple"
                      />
                      <Label 
                        htmlFor={`tag-${tag}`} 
                        className="text-white cursor-pointer hover:text-goat-purple transition-colors"
                      >
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direção */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Direção
                </h3>
                
                <div className="space-y-3">
                  {directionOptions.map((direction) => (
                    <div key={direction} className="flex items-center space-x-3">
                      <Checkbox
                        id={`direction-${direction}`}
                        checked={localFilters.direction.includes(direction)}
                        onCheckedChange={(checked) => handleDirectionChange(direction, checked as boolean)}
                        className="border-goat-gray-600 data-[state=checked]:bg-goat-purple data-[state=checked]:border-goat-purple"
                      />
                      <Label 
                        htmlFor={`direction-${direction}`} 
                        className="text-white cursor-pointer hover:text-goat-purple transition-colors"
                      >
                        {direction}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="p-6 border-t border-goat-gray-700">
            <div className="flex gap-4">
              <Button
                onClick={handleApplyFilters}
                className="btn-primary flex-1 h-12 text-lg font-semibold"
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={handleClearFilters}
                className="flex-1 h-12 text-lg font-semibold bg-goat-gray-600 hover:bg-goat-gray-500 text-white border-0 transition-colors duration-200"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
