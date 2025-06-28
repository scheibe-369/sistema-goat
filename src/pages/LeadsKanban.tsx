import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MoreVertical, Settings, Edit, Trash2, EllipsisVertical } from "lucide-react";
import { useState, useRef } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { NewLeadModal } from "@/components/Leads/NewLeadModal";
import { EditStageModal } from "@/components/Leads/EditStageModal";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  group?: string;
  lastUpdate: string;
  value?: string;
  stage: string;
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

const defaultTags: Tag[] = [
  { id: '1', name: 'Clientes GOAT', color: 'bg-purple-600' },
  { id: '2', name: 'Networking', color: 'bg-blue-600' },
];

const mockStages: Stage[] = [
  // ... (seus dados originais)
];

export default function LeadsKanban() {
  const [stages, setStages] = useState(mockStages);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // --- Scroll Manual States ---
  const kanbanRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setStartX(e.pageX - (kanbanRef.current?.offsetLeft || 0));
    setScrollLeft(kanbanRef.current?.scrollLeft || 0);
    document.body.style.cursor = 'grabbing';
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !kanbanRef.current) return;
    e.preventDefault();
    const x = e.pageX - kanbanRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    kanbanRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (kanbanRef.current?.offsetLeft || 0));
    setScrollLeft(kanbanRef.current?.scrollLeft || 0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !kanbanRef.current) return;
    const x = e.touches[0].pageX - kanbanRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    kanbanRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchEnd = () => setIsDragging(false);

  // --- Restante do código igual ao seu (handleEditLead, handleUpdateLead, etc) ---

  const getGroupColor = (group: string) => {
    const tag = tags.find(t => t.name === group);
    if (tag) return `${tag.color} text-white hover:${tag.color}`;
    return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
  };

  // ... demais handlers iguais ...

  // Função de filtro
  const getFilteredStages = () => {
    if (activeFilter === 'all') return stages;
    return stages.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.group === activeFilter)
    }));
  };
  const filteredStages = getFilteredStages();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Funil</h1>
          <p className="text-goat-gray-400">Gerencie seus leads e clientes</p>
        </div>
        <div className="flex gap-2">
          <Button className="btn-primary h-10 px-4" onClick={() => setIsTagsModalOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Tags
          </Button>
          <Button className="btn-primary h-10 px-4" onClick={() => setIsAddStageModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
          <Button className="btn-primary h-10 px-4" onClick={() => setIsNewLeadModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card 
        className="p-4" 
        style={{ backgroundColor: '#080808', border: 'none', boxShadow: 'none' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Filtros:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white ${
              activeFilter === 'all' ? 'bg-goat-purple border-goat-purple' : ''
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Todos os grupos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant="outline"
              size="sm"
              className={`text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white ${
                activeFilter === tag.name ? 'bg-goat-purple border-goat-purple' : ''
              }`}
              onClick={() => setActiveFilter(tag.name)}
            >
              <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`}></div>
              {tag.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          ref={kanbanRef}
          className="flex gap-6 min-h-[600px] overflow-x-auto overflow-y-hidden pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: isDragging ? 'none' : 'auto',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {filteredStages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80 space-y-4">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
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
                  onClick={() => handleEditStage(stage)}
                >
                  <EllipsisVertical className="w-4 h-4" />
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
                          >
                            <ContextMenu>
                              <ContextMenuTrigger>
                                <Card className="bg-goat-gray-800 border-goat-gray-700 p-4 cursor-pointer hover:border-goat-purple/50 transition-all duration-200 shadow-lg">
                                  <div className="space-y-3">
                                    {/* Lead Header */}
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                                        <p className="text-goat-gray-400 text-xs">{lead.company}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-goat-gray-400 hover:text-white h-6 w-6"
                                        onClick={() => handleEditLead(lead)}
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    {/* Group Badge - Only show if group exists */}
                                    {lead.group && (
                                      <Badge className={`text-xs ${getGroupColor(lead.group)}`}>
                                        {lead.group}
                                      </Badge>
                                    )}
                                    {/* Last Update */}
                                    <div className="flex items-center gap-2 text-xs text-goat-gray-500 pt-2 border-t border-goat-gray-700">
                                      <Calendar className="w-3 h-3" />
                                      <span>Atualizado em {new Date(lead.lastUpdate).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                </Card>
                              </ContextMenuTrigger>

                              <ContextMenuContent className="bg-goat-gray-800 border-goat-gray-700">
                                <ContextMenuItem
                                  onClick={() => handleEditLead(lead)}
                                  className="text-white data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Lead
                                </ContextMenuItem>
                                <ContextMenuItem
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="text-red-400 data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir Lead
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
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
          ))}
        </div>
      </DragDropContext>

      {/* Modals */}
      <TagsManagementModal
        open={isTagsModalOpen}
        onOpenChange={setIsTagsModalOpen}
        tags={tags}
        onUpdateTags={setTags}
      />
      <EditLeadModal
        open={isEditLeadModalOpen}
        onOpenChange={setIsEditLeadModalOpen}
        lead={selectedLead}
        tags={tags}
        stages={stages}
        onUpdateLead={handleUpdateLead}
      />
      <AddStageModal
        open={isAddStageModalOpen}
        onOpenChange={setIsAddStageModalOpen}
        onAddStage={handleAddStage}
      />
      <NewLeadModal
        open={isNewLeadModalOpen}
        onOpenChange={setIsNewLeadModalOpen}
        tags={tags}
        stages={stages}
        onAddLead={handleAddLead}
      />
      <EditStageModal
        open={isEditStageModalOpen}
        onOpenChange={setIsEditStageModalOpen}
        stage={selectedStage}
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
