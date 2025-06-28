
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  stage: string;
  lastUpdate: string;
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
  stages: Stage[];
  onUpdateLead: (lead: Lead) => void;
}

export function EditLeadModal({ open, onOpenChange, lead, stages, onUpdateLead }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead>(
    lead || {
      id: '',
      name: '',
      company: '',
      phone: '',
      stage: '',
      lastUpdate: ''
    }
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.company.trim()) return;
    
    onUpdateLead({
      ...formData,
      lastUpdate: new Date().toISOString().split('T')[0]
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  <SelectItem key={stage.id} value={stage.name} className="text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      {stage.name}
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
              variant="outline"
              className="text-white border-goat-gray-600 flex-1"
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
