import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MoreVertical, Settings, Edit, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";
import { AddStageModal } from "@/components/Leads/AddStageModal";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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

const defaultTags: Tag[] = [
  { id: '1', name: 'Clientes GOAT', color: 'bg-purple-600' },
  { id: '2', name: 'Networking', color: 'bg-blue-600' },
];

const mockStages: Stage[] = [
  {
    id: 'no-service',
    name: 'Sem atendimento',
    color: 'bg-gray-500',
    leads: [
      {
        id: '1',
        name: 'João Silva',
        company: 'Tech Innovations',
        phone: '(11) 99999-9999',
        email: 'joao@tech.com',
        group: 'Clientes GOAT',
        lastUpdate: '2024-01-15',
        value: 'R$ 5.000'
      },
      {
        id: '2',
        name: 'Maria Santos',
        company: 'Digital Marketing',
        phone: '(11) 88888-8888',
        email: 'maria@digital.com',
        group: 'Networking',
        lastUpdate: '2024-01-14'
      }
    ]
  },
  {
    id: 'in-service',
    name: 'Em atendimento',
    color: 'bg-yellow-500',
    leads: [
      {
        id: '3',
        name: 'Pedro Costa',
        company: 'E-commerce Plus',
        phone: '(11) 77777-7777',
        email: 'pedro@ecommerce.com',
        group: 'Clientes GOAT',
        lastUpdate: '2024-01-16',
        value: 'R$ 8.000'
      }
    ]
  },
  {
    id: 'meeting-scheduled',
    name: 'Reunião agendada',
    color: 'bg-blue-500',
    leads: [
      {
        id: '4',
        name: 'Ana Oliveira',
        company: 'Startup XYZ',
        phone: '(11) 66666-6666',
        email: 'ana@startup.com',
        group: 'Networking',
        lastUpdate: '2024-01-17'
      }
    ]
  },
  {
    id: 'proposal-sent',
    name: 'Proposta enviada',
    color: 'bg-purple-500',
    leads: [
      {
        id: '5',
        name: 'Carlos Ferreira',
        company: 'Consultoria Pro',
        phone: '(11) 55555-5555',
        email: 'carlos@consultoria.com',
        group: 'Clientes GOAT',
        lastUpdate: '2024-01-18',
        value: 'R$ 12.000'
      }
    ]
  },
  {
    id: 'cold',
    name: 'Frio',
    color: 'bg-gray-400',
    leads: []
  }
];

export default function LeadsKanban() {
  const [stages, setStages] = useState(mockStages);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Scroll horizontal fluido
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Estado para controlar quando um card está sendo arrastado
  const [isCardBeingDragged, setIsCardBeingDragged] = useState(false);

  // ✅ NOVO: Estados para auto-scroll durante drag
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const getGroupColor = (group: string) => {
    const tag = tags.find(t => t.name === group);
    if (tag) {
      return `${tag.color} text-white hover:${tag.color}`;
    }
    return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalOpen(true);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      leads: stage.leads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      )
    })));
  };

  const handleDeleteLead = (leadId: string) => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      leads: stage.leads.filter(lead => lead.id !== leadId)
    })));
  };

  const handleAddStage = (newStageData: { name: string; color: string }) => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: newStageData.name,
      color: newStageData.color,
      leads: []
    };
    setStages(prev => [...prev, newStage]);
  };

  // ✅ NOVO: Função para auto-scroll durante drag
  const startAutoScroll = (direction: 'left' | 'right', speed: number) => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
    }

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -speed : speed;
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
    }, 16); // ~60fps

    setAutoScrollInterval(interval);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
  };

  // ✅ NOVO: Detecta posição do mouse durante drag para auto-scroll
  const handleDragUpdate = (e: MouseEvent) => {
    if (!isCardBeingDragged || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    
    // Zona de trigger para auto-scroll (100px da borda)
    const triggerZone = 100;
    const leftBoundary = containerRect.left + triggerZone;
    const rightBoundary = containerRect.right - triggerZone;

    if (mouseX < leftBoundary) {
      // Próximo da borda esquerda - scroll para esquerda
      const distance = leftBoundary - mouseX;
      const speed = Math.min(distance / 10, 10); // Velocidade proporcional, máximo 10
      startAutoScroll('left', speed);
    } else if (mouseX > rightBoundary) {
      // Próximo da borda direita - scroll para direita
      const distance = mouseX - rightBoundary;
      const speed = Math.min(distance / 10, 10); // Velocidade proporcional, máximo 10
      startAutoScroll('right', speed);
    } else {
      // Fora das zonas de trigger - para o auto-scroll
      stopAutoScroll();
    }
  };

  // ✅ NOVO: Adiciona event listener para mouse move durante drag
  useEffect(() => {
    if (isCardBeingDragged) {
      document.addEventListener('mousemove', handleDragUpdate);
      return () => {
        document.removeEventListener('mousemove', handleDragUpdate);
        stopAutoScroll();
      };
    }
  }, [isCardBeingDragged]);

  const handleDragEnd = (result: DropResult) => {
    // Para o auto-scroll ao finalizar o drag
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

    setStages(newStages);
    setIsCardBeingDragged(false);
  };

  const handleDragStart = () => {
    setIsCardBeingDragged(true);
  };

  // Handlers para scroll horizontal fluido
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

  // Touch events para mobile
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

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="space-y-6 animate-fade-in">
          {/* Header - Fixed Width */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
              <p className="text-goat-gray-400">Gerencie seu pipeline de vendas</p>
            </div>
            <div className="kanban-header-buttons">
              <Button
                className="btn-primary"
                onClick={() => setIsTagsModalOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Tags
              </Button>
              <Button
                className="btn-primary"
                onClick={() => setIsAddStageModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Etapa
              </Button>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>
            </div>
          </div>

          {/* Filters - Fixed Width */}
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Filtros:</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white"
              >
                Todos os grupos
              </Button>
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  className="text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white"
                >
                  <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`}></div>
                  {tag.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Kanban Board - Full Width com Scroll Horizontal */}
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
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="kanban-stages-wrapper">
            {stages.map((stage) => (
              <div key={stage.id} className="kanban-stage">
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

                                      {/* Group Badge */}
                                      <Badge className={`text-xs ${getGroupColor(lead.group)}`}>
                                        {lead.group}
                                      </Badge>

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
      </div>

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
        onUpdateLead={handleUpdateLead}
      />

      <AddStageModal
        open={isAddStageModalOpen}
        onOpenChange={setIsAddStageModalOpen}
        onAddStage={handleAddStage}
      />
    </div>
  );
}
