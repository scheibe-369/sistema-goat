
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { Tag } from "@/hooks/useTags";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

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
  onUpdateLead,
}: EditLeadModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    stage: "",
    tags: [] as string[],
    value: "",
    notes: "",
    meeting_date: "",
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || "",
        company: lead.company || "",
        phone: lead.phone || "",
        email: lead.email || "",
        stage: lead.stage || "",
        tags: lead.tags || [],
        value: lead.value ? `R$ ${lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "",
        notes: lead.notes || "",
        meeting_date: lead.meeting_date || "",
      });
    }
  }, [lead]);

  const handleSave = () => {
    // Validação básica - apenas Nome e Etapa são obrigatórios
    if (!lead || !formData.name.trim() || !formData.stage) {
      console.log('Validation failed:', { lead, name: formData.name, stage: formData.stage });
      return;
    }

    // Converter valor monetário
    const value = formData.value
      ? parseFloat(formData.value.replace(/[^\d,.-]/g, '').replace(',', '.')) || null
      : null;

    const updatedLead: Lead = {
      ...lead,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email || null,
      stage: formData.stage,
      tags: formData.tags.length > 0 ? formData.tags : null,
      value: value,
      notes: formData.notes || null,
      meeting_date: formData.meeting_date || null,
      updated_at: new Date().toISOString(),
    };

    onUpdateLead(updatedLead);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    handleInputChange("value", formatted);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white w-full max-w-[500px] max-h-[85vh] overflow-y-auto">
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
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nome do lead"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Empresa</Label>
            <Input
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Nome da empresa"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
            />
          </div>

          <div>
            <Label className="text-white">Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Etapa</Label>
            <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
              <SelectTrigger>
                <SelectValue>{getStageSelected()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${stage.color}`}></span>
                      {stage.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Email (Opcional)</Label>
            <Input
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="email@exemplo.com"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
            />
          </div>

          <div>
            <Label className="text-white">Valor (Opcional)</Label>
            <Input
              value={formData.value || ""}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="R$ 0,00"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
              inputMode="decimal"
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
            <Label className="text-white">Observações (Opcional)</Label>
            <Input
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Observações sobre o lead"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
            />
          </div>

          <div>
            <Label className="text-white">Data da Reunião (Agendamento)</Label>
            <DatePicker
              date={formData.meeting_date ? parseISO(formData.meeting_date) : undefined}
              setDate={(newDate) => {
                handleInputChange("meeting_date", newDate ? format(newDate, "yyyy-MM-dd") : "");
              }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="btn-primary flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
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
