import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface Lead {
  name: string;
  company: string;
  phone: string;
  email?: string;
  group?: string;
  value?: string;
  stage: string;
}

interface NewLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  stages: Stage[];
  onAddLead: (lead: Lead) => void;
}

export function NewLeadModal({ open, onOpenChange, tags, stages, onAddLead }: NewLeadModalProps) {
  const [formData, setFormData] = useState<Lead>({
    name: '',
    company: '',
    phone: '',
    email: '',
    group: '',
    value: '',
    stage: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.phone || !formData.stage) return;
    onAddLead(formData);

    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      group: '',
      value: '',
      stage: ''
    });
    onOpenChange(false);
  };

  const handleChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Formata campo valor como moeda
  const handleValueChange = (value: string) => {
    // Aceita apenas números e vírgula/ponto
    let v = value.replace(/[^\d,]/g, '').replace(',', '.');
    let num = parseFloat(v);
    if (isNaN(num)) {
      setFormData(prev => ({ ...prev, value: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, value: num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Novo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="company" className="text-white">Empresa *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="stage" className="text-white">Etapa *</Label>
            <Select value={formData.stage} onValueChange={(value) => handleChange('stage', value)}>
              <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                <SelectValue placeholder="Selecione uma etapa" />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                {stages.map((stage) => (
                  <SelectItem
                    key={stage.id}
                    value={stage.id}
                    className="text-white bg-goat-gray-700 hover:bg-goat-gray-600 data-[state=checked]:bg-goat-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="group" className="text-white">Tag (opcional)</Label>
            <Select value={formData.group} onValueChange={(value) => handleChange('group', value)}>
              <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                <SelectValue placeholder="Selecione uma tag" />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                {tags.map((tag) => (
                  <SelectItem
                    key={tag.id}
                    value={tag.name}
                    className="text-white bg-goat-gray-700 hover:bg-goat-gray-600 data-[state=checked]:bg-goat-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${tag.color}`}></div>
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value" className="text-white">Valor (opcional)</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Ex: R$ 5.000,00"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              inputMode="decimal"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary">
              Adicionar Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
