
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Lead } from "@/hooks/useLeads";

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

export function EditLeadModal({ 
  open, 
  onOpenChange, 
  lead, 
  tags, 
  stages, 
  onUpdateLead 
}: EditLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    stage: '',
    tags: [] as string[],
    value: '',
    notes: '',
  });

  // Atualizar form quando lead mudar
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        phone: lead.phone || '',
        email: lead.email || '',
        stage: lead.stage || '',
        tags: lead.tags || [],
        value: lead.value ? lead.value.toString() : '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const updatedLead: Lead = {
      ...lead,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email || null,
      stage: formData.stage,
      tags: formData.tags,
      value: formData.value ? parseFloat(formData.value) : null,
      notes: formData.notes || null,
    };

    onUpdateLead(updatedLead);
    onOpenChange(false);
  };

  const handleAddTag = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagName)
    }));
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag ? tag.color : 'bg-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-goat-gray-700 border-goat-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-goat-gray-700 border-goat-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-goat-gray-700 border-goat-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-goat-gray-700 border-goat-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">Etapa</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id} className="text-white hover:bg-goat-gray-600">
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="bg-goat-gray-700 border-goat-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              {/* Tags selecionadas */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tagName) => (
                  <Badge 
                    key={tagName} 
                    className={`${getTagColor(tagName)} text-white hover:bg-opacity-80 cursor-pointer`}
                    onClick={() => handleRemoveTag(tagName)}
                  >
                    {tagName}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              
              {/* Tags disponíveis */}
              <div className="flex flex-wrap gap-2">
                {tags.filter(tag => !formData.tags.includes(tag.name)).map((tag) => (
                  <Badge 
                    key={tag.id}
                    variant="outline"
                    className="border-goat-gray-600 text-goat-gray-300 hover:bg-goat-gray-700 cursor-pointer"
                    onClick={() => handleAddTag(tag.name)}
                  >
                    + {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-goat-gray-600 text-white hover:bg-goat-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-goat-purple hover:bg-goat-purple/80 text-white"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
