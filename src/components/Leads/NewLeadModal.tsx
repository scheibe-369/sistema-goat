
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

interface NewLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  stages: Stage[];
  onAddLead: (lead: {
    name: string;
    company: string;
    phone: string;
    email?: string;
    stage: string;
    tags?: string[];
    value?: number;
  }) => void;
}

export function NewLeadModal({ open, onOpenChange, tags, stages, onAddLead }: NewLeadModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    stage: "",
    tags: [] as string[],
    value: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.phone || !formData.stage) return;

    // Converter valor monetário
    const value = formData.value 
      ? parseFloat(formData.value.replace(/[^\d,.-]/g, '').replace(',', '.')) || undefined
      : undefined;

    onAddLead({
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email || undefined,
      stage: formData.stage,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      value: value,
    });

    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
      stage: "",
      tags: [],
      value: "",
    });
    onOpenChange(false);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    const amount = parseInt(numbers) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleValueChange = (value: string) => {
    const formatted = formatCurrency(value);
    setFormData(prev => ({ ...prev, value: formatted }));
  };

  const getStageSelected = () => {
    const selected = stages.find(s => s.id === formData.stage);
    if (!selected) return <span className="text-white">Selecione uma etapa</span>;
    return (
      <span className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${selected.color}`} />
        {selected.name}
      </span>
    );
  };

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
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
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="company" className="text-white">Empresa *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-white">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="stage" className="text-white">Etapa *</Label>
            <Select value={formData.stage} onValueChange={value => setFormData(prev => ({ ...prev, stage: value }))}>
              <SelectTrigger>
                <SelectValue>{getStageSelected()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="whitespace-nowrap">{stage.name}</span>
                    </span>
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
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="tag" className="text-white">Tag (opcional)</Label>
            <Select
              value={formData.tags[0] || ""}
              onValueChange={value => setFormData(prev => ({ ...prev, tags: value ? [value] : [] }))}
            >
              <SelectTrigger>
                <SelectValue>
                  {(() => {
                    const selected = tags.find(t => t.name === formData.tags[0]);
                    if (!selected) return <span className="text-white">Selecione uma tag</span>;
                    return (
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${selected.color}`} />
                        {selected.name}
                      </span>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.name}>
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${tag.color}`} />
                      {tag.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="value" className="text-white">Valor (opcional)</Label>
            <Input
              id="value"
              value={formData.value || ""}
              onChange={e => handleValueChange(e.target.value)}
              placeholder="R$ 0,00"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
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
