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

  // Atualiza o formData ao abrir/receber um lead diferente
  useEffect(() => {
    if (lead) setFormData(lead);
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

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
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

  // Estilo para remover o ícone de verificado e padronizar o dropdown
  const selectStyle = `
    .lead-select-trigger {
      background-color: #404040 !important;
      border: 1px solid #525252 !important;
      color: #fff !important;
      min-height: 44px;
      font-size: 1rem;
      font-weight: 500;
      transition: border 0.2s;
    }
    .lead-select-trigger:hover, .lead-select-trigger:focus {
      border-color: #6b21d3 !important;
      box-shadow: 0 0 0 1px #6b21d3 !important;
    }
    .lead-select-content {
      background-color: #404040 !important;
      border: 1px solid #525252 !important;
      min-width: var(--radix-select-trigger-width, 220px) !important;
      box-shadow: 0 8px 32px 0 #00000022;
      margin-top: 5px;
    }
    .lead-select-item {
      color: #fff !important;
      background-color: transparent !important;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      transition: background 0.1s;
    }
    .lead-select-item:hover, .lead-select-item[data-highlighted] {
      background-color: #525252 !important;
      color: #fff !important;
    }
    .lead-select-item > [data-select-item-indicator],
    .lead-select-item svg,
    .lead-select-item [data-radix-select-item-indicator] {
      display: none !important;
    }
  `;

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

          {/* ETAPA */}
          <div>
            <Label className="text-white">Etapa</Label>
            <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
              <SelectTrigger className="lead-select-trigger w-full flex items-center">
                <div className="flex items-center gap-2">
                  {stages.find((s) => s.id === formData.stage) && (
                    <span className={`w-3 h-3 rounded-full ${stages.find((s) => s.id === formData.stage)?.color}`}></span>
                  )}
                  <SelectValue placeholder="Selecione uma etapa" />
                </div>
              </SelectTrigger>
              <SelectContent className="lead-select-content">
                {stages.map((stage) => (
                  <SelectItem
                    key={stage.id}
                    value={stage.id}
                    className="lead-select-item"
                  >
                    <span className={`w-3 h-3 rounded-full ${stage.color}`}></span>
                    {stage.name}
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
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
              inputMode="decimal"
            />
          </div>

          <div>
            <Label className="text-white">Tag (Opcional)</Label>
            <Select value={formData.group || ""} onValueChange={(value) => handleInputChange("group", value)}>
              <SelectTrigger className="lead-select-trigger w-full flex items-center">
                <div className="flex items-center gap-2">
                  {tags.find((t) => t.name === formData.group) && (
                    <span className={`w-3 h-3 rounded-full ${tags.find((t) => t.name === formData.group)?.color}`}></span>
                  )}
                  <SelectValue placeholder="Selecione uma tag" />
                </div>
              </SelectTrigger>
              <SelectContent className="lead-select-content">
                {tags.map((tag) => (
                  <SelectItem
                    key={tag.id}
                    value={tag.name}
                    className="lead-select-item"
                  >
                    <span className={`w-3 h-3 rounded-full ${tag.color}`}></span>
                    {tag.name}
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
