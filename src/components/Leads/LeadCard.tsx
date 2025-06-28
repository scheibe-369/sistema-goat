
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

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

interface LeadCardProps {
  lead: Lead;
  tags: Tag[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export function LeadCard({ lead, tags, onEditLead, onDeleteLead }: LeadCardProps) {
  const getGroupColor = (group: string) => {
    const tag = tags.find(t => t.name === group);
    if (tag) {
      return `${tag.color} text-white hover:${tag.color}`;
    }
    return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
  };

  return (
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
                onClick={() => onEditLead(lead)}
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
          onClick={() => onEditLead(lead)}
          className="text-white data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Lead
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDeleteLead(lead.id)}
          className="text-red-400 data-[highlighted]:bg-goat-gray-700 data-[highlighted]:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Lead
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
