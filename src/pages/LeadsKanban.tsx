
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Calendar, MoreVertical, Settings, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TagsManagementModal } from "@/components/Leads/TagsManagementModal";
import { EditLeadModal } from "@/components/Leads/EditLeadModal";

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
          <p className="text-goat-gray-400">Gerencie seu pipeline de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsTagsModalOpen(true)}
            className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Tags
          </Button>
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Filtros:</span>
          <Button variant="outline" size="sm" className="text-white border-goat-gray-600 hover:bg-goat-gray-700">
            Todos os grupos
          </Button>
          {tags.map((tag) => (
            <Button 
              key={tag.id}
              variant="outline" 
              size="sm" 
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
            >
              <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`}></div>
              {tag.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
        {stages.map((stage) => (
          <div key={stage.id} className="space-y-4">
            {/* Stage Header */}
            <div className="flex items-center justify-between">
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
            <div className="space-y-3">
              {stage.leads.map((lead) => (
                <ContextMenu key={lead.id}>
                  <ContextMenuTrigger>
                    <Card className="bg-goat-gray-800 border-goat-gray-700 p-4 cursor-pointer hover:border-goat-purple/50 transition-all duration-200">
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

                        {/* Lead Value */}
                        {lead.value && (
                          <div className="text-goat-purple font-semibold text-sm">
                            {lead.value}
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-goat-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-goat-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                          </div>
                        </div>

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
                      className="text-white hover:bg-goat-gray-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Lead
                    </ContextMenuItem>
                    <ContextMenuItem 
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-400 hover:bg-goat-gray-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Lead
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}

              {/* Empty State */}
              {stage.leads.length === 0 && (
                <div className="border-2 border-dashed border-goat-gray-700 rounded-lg p-6 text-center">
                  <p className="text-goat-gray-400 text-sm">Arraste leads para cá</p>
                </div>
              )}
            </div>
          </div>
        ))}
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
    </div>
  );
}
