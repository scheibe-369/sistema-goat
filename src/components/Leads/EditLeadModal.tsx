import { useState, useEffect } from "react";
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

export function EditLeadModal({
  open,
  onOpenChange,
  lead,
  tags,
  stages,
  onUpdateLead,
}: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead>(
    lead || {
      id: "",
      name: "",
      company: "",
      phone: "",
      email: "",
      group: "",
      lastUpdate: "",
      value: "",
      stage: "",
    }
  );

  useEffect(() => {
    if (lead && lead.id !== formData.id) setFormData(lead);
    // eslint-disable-next-line
  }, [lead]);

  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.company.trim() ||
      !formData.phone.trim() ||
      !formData.stage
    )
      return;

    onUpdateLead({
      ...formData,
      lastUpdate: new Date().toISOString().split("T")[0],
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Formata campo valor como moeda
  const handleValueChange = (value: string) => {
    let numbers = value.replace(/\D/g, "");
    if (!numbers) {
      setFormData((prev) => ({ ...prev, value: "" }));
      return;
    }
    const amount = parseInt(numbers) / 100;
    setFormData((prev) => ({
      ...prev,
      value: amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    }));
  };

  // Select custom styles
  const selectStyle = `
    .lead-select-trigger {
      background-color: #404040 !important;
      border-color: #525252 !important;
      color: white !important;
      border-radius: 0.75rem !important;
      min-height: 44px;
      font-size: 1rem;
      padding-left: 1rem;
      padding-right: 1rem;
      transition: border-color 0.15s;
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem;
    }
    .lead-select-value,
    .lead-select-value span {
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem;
    }
    .lead-select-content {
      background-color: #404040 !important;
      border-color: #525252 !important;
      border-radius: 0.75rem !important;
      min-width: var(--radix-select-trigger-width) !important;
      width: var(--radix-select-trigger-width) !important;
      box-shadow: none !important;
      margin-top: 0.2rem;
      padding: 0.25rem 0;
    }
    .lead-select-item {
      color: white !important;
      background-color: transparent !important;
      border-radius: 0.5rem !important;
      font-weight: 500;
      transition: background 0.1s;
      padding-left: 1rem;
      padding-right: 1rem;
      min-height: 40px;
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem;
    }
    .lead-select-item[data-state="checked"], .lead-select-item:hover, .lead-select-item[data-highlighted] {
      background-color: #525252 !important;
    }
    [data-radix-popper-content-wrapper] { background: transparent !important; }
    .radix-select-overlay { display: none !important; }
    /* Remove texto roxo do valor */
    input#value, input#value::placeholder {
      color: #fff !important;
    }
  `;

  const getStageSelected = () => {
    const selected = stages.find((s) => s.id === formData.stage);
    if (!selected) return <span className="text-white">Selecione uma etapa</span>;
    return (
      <span className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${selected.color}`} />
        {selected.name}
      </span>
    );
  };

  const getTagSelected = () => {
    const selected = tags.find((t) => t.name === formData.group);
    if (!selected) return <span className="text-white">Selecione uma tag</span>;
    return (
      <span className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${selected.color}`} />
        {selected.name}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <style>{selectStyle}</style>
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
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
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

          {/* Select Etapa */}
          <div>
            <Label className="text-white">Etapa</Label>
            <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
              <SelectTrigger className="lead-select-trigger">
                <SelectValue className="lead-select-value">{getStageSelected()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="lead-select-content">
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id} className="lead-select-item">
                    <span className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="whitespace-nowrap">{stage.name}</span>
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
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Valor (Opcional)</Label>
            <Input
              value={formData.value || ""}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="R$ 0,00"
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              id="value"
            />
          </div>

          {/* Select Tag */}
          <div>
            <Label className="text-white">Tag (Opcional)</Label>
            <Select value={formData.group} onValueChange={(value) => handleInputChange("group", value)}>
              <SelectTrigger className="lead-select-trigger">
                <SelectValue className="lead-select-value">{getTagSelected()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="lead-select-content">
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name} className="lead-select-item">
                    <span className={`w-3 h-3 rounded-full ${tag.color}`} />
                    <span className="whitespace-nowrap">{tag.name}</span>
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
