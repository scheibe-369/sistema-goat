
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

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
}

interface EditLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  tags: Tag[];
  stages: Stage[];
  onUpdateLead: (lead: Lead) => void;
}

export function EditLeadModal({ open, onOpenChange, lead, tags, stages, onUpdateLead }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead>(
    lead || {
      id: '',
      name: '',
      company: '',
      phone: '',
      email: '',
      group: '',
      lastUpdate: '',
      value: '',
      stage: ''
    }
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.company.trim() || !formData.phone.trim() || !formData.stage) return;
    
    onUpdateLead({
      ...formData,
      lastUpdate: new Date().toISOString().split('T')[0]
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se não há números, retorna vazio
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleValueChange = (value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange('value', formatted);
  };

  // Reset form when lead changes
  if (lead && lead.id !== formData.id) {
    setFormData(lead);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription className="text-goat-gray-400">
            Altere as informações do lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nome do lead"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Empresa</Label>
            <Input
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Nome da empresa"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Etapa</Label>
            <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
              <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Email (Opcional)</Label>
            <Input
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Valor (Opcional)</Label>
            <Input
              value={formData.value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="R$ 0,00"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Tag (Opcional)</Label>
            <Select value={formData.group} onValueChange={(value) => handleInputChange('group', value)}>
              <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name} className="text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tag.color}`}></div>
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="btn-primary flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="flex-1 btn-outline-danger"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
