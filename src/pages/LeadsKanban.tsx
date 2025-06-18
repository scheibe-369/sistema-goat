
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Calendar, MoreVertical } from "lucide-react";
import { useState } from "react";

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

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

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

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'Clientes GOAT':
        return 'bg-goat-purple text-white';
      case 'Networking':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kanban de Leads</h1>
          <p className="text-goat-gray-400">Gerencie seu pipeline de vendas</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Filtros:</span>
          <Button variant="outline" size="sm" className="text-white border-goat-gray-600">
            Todos os grupos
          </Button>
          <Button variant="outline" size="sm" className="text-white border-goat-gray-600">
            Clientes GOAT
          </Button>
          <Button variant="outline" size="sm" className="text-white border-goat-gray-600">
            Networking
          </Button>
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
                <Badge variant="secondary" className="text-xs">
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
                <Card key={lead.id} className="bg-goat-gray-800 border-goat-gray-700 p-4 cursor-pointer hover:border-goat-purple/50 transition-all duration-200">
                  <div className="space-y-3">
                    {/* Lead Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                        <p className="text-goat-gray-400 text-xs">{lead.company}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-goat-gray-400 hover:text-white h-6 w-6">
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
    </div>
  );
}
