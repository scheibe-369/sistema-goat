import React, { useState } from 'react';
import { Plus, Phone, Mail, Calendar, MoreVertical, Settings, Edit, Trash2 } from "lucide-react";

// --- INÍCIO DAS CORREÇÕES DE ERRO ---

// Devido a um erro de compilação, a biblioteca 'react-beautiful-dnd' não pôde ser resolvida.
// As seguintes componentes são substitutos que permitem que o código seja renderizado,
// mas a funcionalidade de arrastar e soltar (drag-and-drop) estará DESATIVADA.

const DragDropContext = ({ children, onDragEnd }) => <>{children}</>;

const Droppable = ({ children, droppableId }) => {
  const provided = {
    innerRef: React.useRef(null),
    droppableProps: {},
    placeholder: null,
  };
  const snapshot = { isDraggingOver: false };
  return children(provided, snapshot);
};

const Draggable = ({ children, draggableId, index }) => {
  const provided = {
    innerRef: React.useRef(null),
    draggableProps: {},
    dragHandleProps: {},
  };
  const snapshot = { isDragging: false };
  return children(provided, snapshot);
};


// Os componentes de Modal não puderam ser importados.
// Criei um componente de Modal genérico e substitutos para que a aplicação possa ser renderizada.
// A funcionalidade completa dos modais (formulários, etc.) precisaria ser implementada aqui.

const DummyModal = ({ open, onOpenChange, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div style={{
        backgroundColor: '#1f2937', color: 'white', padding: '2rem',
        borderRadius: '0.5rem', width: '90%', maxWidth: '500px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h2>
          <button onClick={() => onOpenChange(false)} style={{ color: 'white' }}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TagsManagementModal = ({ open, onOpenChange, tags, onUpdateTags }) => (
  <DummyModal open={open} onOpenChange={onOpenChange} title="Gerenciar Tags">
    <p className="text-goat-gray-400">A funcionalidade de gerenciamento de tags apareceria aqui.</p>
  </DummyModal>
);

const EditLeadModal = ({ open, onOpenChange, lead, tags, onUpdateLead }) => (
  <DummyModal open={open} onOpenChange={onOpenChange} title={`Editar Lead: ${lead?.name || ''}`}>
     <p className="text-goat-gray-400">O formulário de edição de lead apareceria aqui.</p>
  </DummyModal>
);

const AddStageModal = ({ open, onOpenChange, onAddStage }) => (
  <DummyModal open={open} onOpenChange={onOpenChange} title="Nova Etapa">
     <p className="text-goat-gray-400">O formulário para adicionar uma nova etapa apareceria aqui.</p>
  </DummyModal>
);

// Componentes UI falsos para evitar erros de importação
const Card = ({ className, children }) => <div className={className}>{children}</div>;
const Button = ({ className, children, onClick, variant, size }) => <button className={className} onClick={onClick}>{children}</button>;
const Badge = ({ className, children }) => <span className={className}>{children}</span>;
const ContextMenu = ({ children }) => <div>{children}</div>;
const ContextMenuTrigger = ({ children }) => <div>{children}</div>;
const ContextMenuContent = ({ className, children }) => <div className={`${className} hidden`}>{/* Escondido por defeito para simplicidade */}</div>;
const ContextMenuItem = ({ className, children, onClick }) => <div className={className} onClick={onClick}>{children}</div>;


// --- FIM DAS CORREÇÕES DE ERRO ---


// Interfaces e dados (inalterado)
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
    id: 'no-service', name: 'Sem atendimento', color: 'bg-gray-500',
    leads: [
      { id: '1', name: 'João Silva', company: 'Tech Innovations', phone: '(11) 99999-9999', email: 'joao@tech.com', group: 'Clientes GOAT', lastUpdate: '2024-01-15', value: 'R$ 5.000' },
      { id: '2', name: 'Maria Santos', company: 'Digital Marketing', phone: '(11) 88888-8888', email: 'maria@digital.com', group: 'Networking', lastUpdate: '2024-01-14' }
    ]
  },
  {
    id: 'in-service', name: 'Em atendimento', color: 'bg-yellow-500',
    leads: [ { id: '3', name: 'Pedro Costa', company: 'E-commerce Plus', phone: '(11) 77777-7777', email: 'pedro@ecommerce.com', group: 'Clientes GOAT', lastUpdate: '2024-01-16', value: 'R$ 8.000' } ]
  },
  {
    id: 'meeting-scheduled', name: 'Reunião agendada', color: 'bg-blue-500',
    leads: [ { id: '4', name: 'Ana Oliveira', company: 'Startup XYZ', phone: '(11) 66666-6666', email: 'ana@startup.com', group: 'Networking', lastUpdate: '2024-01-17' } ]
  },
  {
    id: 'proposal-sent', name: 'Proposta enviada', color: 'bg-purple-500',
    leads: [ { id: '5', name: 'Carlos Ferreira', company: 'Consultoria Pro', phone: '(11) 55555-5555', email: 'carlos@consultoria.com', group: 'Clientes GOAT', lastUpdate: '2024-01-18', value: 'R$ 12.000' } ]
  },
  { id: 'cold', name: 'Frio', color: 'bg-gray-400', leads: [] }
];


// Componente principal
export default function LeadsKanban() {
  const [stages, setStages] = useState(mockStages);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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

  const handleDragEnd = (result) => {
    // A lógica de Drag and Drop foi desativada devido ao erro de compilação.
    // Para reativar, a biblioteca 'react-beautiful-dnd' precisa ser instalada
    // e os componentes falsos no topo deste arquivo devem ser removidos.
    if (!result || !result.destination) return;
    
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStageIndex = stages.findIndex(stage => stage.id === source.droppableId);
    const destStageIndex = stages.findIndex(stage => stage.id === destination.droppableId);
    
    const newStages = [...stages];
    const [movedLead] = newStages[sourceStageIndex].leads.splice(source.index, 1);
    newStages[destStageIndex].leads.splice(destination.index, 0, movedLead);
    
    setStages(newStages);
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 bg-gray-900 text-white font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
          <p className="text-gray-400">Gerencie seu pipeline de vendas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsTagsModalOpen(true)}
            // ALTERAÇÃO AQUI
            className="bg-purple-600 text-white hover:bg-purple-700 p-2 rounded-md flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Tags
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddStageModalOpen(true)}
            // ALTERAÇÃO AQUI
            className="bg-purple-600 text-white hover:bg-purple-700 p-2 rounded-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
          <Button className="bg-purple-600 text-white hover:bg-purple-700 p-2 rounded-md flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-white font-medium">Filtros:</span>
          <Button
            variant="outline"
            size="sm"
            className="text-white bg-gray-800 border-gray-600 hover:bg-gray-700 hover:text-white focus:text-white p-2 text-sm rounded-md"
          >
            Todos os grupos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant="outline"
              size="sm"
              className="text-white bg-gray-800 border-gray-600 hover:bg-gray-700 hover:text-white focus:text-white p-2 text-sm rounded-md flex items-center"
            >
              <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`}></div>
              {tag.name}
            </Button>
          ))}
        </div>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-h-[600px]">
              {stages.map((stage) => (
                <div key={stage.id} className="space-y-4 w-[280px] flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <h3 className="font-semibold text-white">{stage.name}</h3>
                      <Badge className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {stage.leads.length}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors bg-gray-800/50 ${
                          snapshot.isDraggingOver ? 'bg-gray-700/50' : ''
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
                                    <Card className="bg-gray-800 border border-gray-700 p-4 cursor-pointer hover:border-purple-500/50 transition-all duration-200 shadow-lg rounded-lg">
                                      <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                                            <p className="text-gray-400 text-xs">{lead.company}</p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-white h-6 w-6"
                                            onClick={(e) => { e.stopPropagation(); handleEditLead(lead); }}
                                          >
                                            <MoreVertical className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        <Badge className={`text-xs ${getGroupColor(lead.group)} px-2 py-0.5 rounded-full`}>
                                          {lead.group}
                                        </Badge>
                                        {lead.value && (
                                          <div className="text-purple-400 font-semibold text-sm">
                                            {lead.value}
                                          </div>
                                        )}
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Phone className="w-3 h-3" />
                                            <span>{lead.phone}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Mail className="w-3 h-3" />
                                            <span>{lead.email}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-700">
                                          <Calendar className="w-3 h-3" />
                                          <span>Atualizado em {new Date(lead.lastUpdate).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                      </div>
                                    </Card>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent className="bg-gray-800 border-gray-700 w-48 rounded-md shadow-lg">
                                    <ContextMenuItem
                                      onClick={() => handleEditLead(lead)}
                                      className="text-white flex items-center px-3 py-2 text-sm hover:bg-gray-700 data-[highlighted]:bg-gray-700 data-[highlighted]:text-white cursor-pointer"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar Lead
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      onClick={() => handleDeleteLead(lead.id)}
                                      className="text-red-400 flex items-center px-3 py-2 text-sm hover:bg-gray-700 data-[highlighted]:bg-gray-700 data-[highlighted]:text-red-400 cursor-pointer"
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
                        {stage.leads.length === 0 && (
                          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                            <p className="text-gray-400 text-sm">Arraste leads para cá</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
        </div>
      </DragDropContext>

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
