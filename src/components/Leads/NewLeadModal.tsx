
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

interface Lead {
  name: string;
  company: string;
  phone: string;
  email: string;
  group: string;
  value?: string;
}

interface NewLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onAddLead: (lead: Lead) => void;
}

export function NewLeadModal({ open, onOpenChange, tags, onAddLead }: NewLeadModalProps) {
  const [formData, setFormData] = useState<Lead>({
    name: '',
    company: '',
    phone: '',
    email: '',
    group: '',
    value: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.phone || !formData.email || !formData.group) {
      return;
    }

    onAddLead(formData);
    
    // Reset form
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      group: '',
      value: ''
    });
    
    onOpenChange(false);
  };

  const handleChange = (field: keyof Lead, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <Label htmlFor="email" className="text-white">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="group" className="text-white">Grupo *</Label>
            <Select value={formData.group} onValueChange={(value) => handleChange('group', value)}>
              <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name} className="text-white">
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
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="Ex: R$ 5.000"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="btn-outline"
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
