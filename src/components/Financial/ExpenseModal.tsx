
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface ExpenseModalProps {
  onAddExpense: (expense: any) => void;
}

export function ExpenseModal({ onAddExpense }: ExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    value: "0,00",
    category: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurrence: "monthly",
  });

  const handleValueBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === "" || value === "0" || value === "0,") {
      setFormData({ ...formData, value: "0,00" });
      return;
    }
    if (!value.includes(",")) {
      value = value + ",00";
    } else {
      const parts = value.split(",");
      if (!parts[1] || parts[1] === "") {
        value = parts[0] + ",00";
      } else if (parts[1].length === 1) {
        value = parts[0] + "," + parts[1] + "0";
      }
    }
    setFormData({ ...formData, value });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d,]/g, "");
    const parts = value.split(",");
    if (parts.length > 2) {
      value = parts[0] + "," + parts.slice(1).join("");
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + "," + parts[1].substring(0, 2);
    }
    setFormData({ ...formData, value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expense = {
      id: Date.now(),
      description: formData.description,
      value: parseFloat(formData.value.replace(",", ".")),
      category: formData.category,
      date: formData.date,
      status: "Pendente",
      isRecurring: formData.isRecurring,
      recurrence: formData.isRecurring ? formData.recurrence : undefined,
    };

    onAddExpense(expense);
    setOpen(false);
    setFormData({
      description: "",
      value: "0,00",
      category: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      recurrence: "monthly",
    });
  };

  // CSS ultra-específico para remover QUALQUER ícone de verificado do Select
  const selectStyle = `
    /* Remove TODOS os indicadores de seleção do Radix Select */
    .expense-modal [data-radix-select-item-indicator],
    .expense-modal span[data-radix-select-item-indicator],
    .expense-modal [data-state="checked"] [data-radix-select-item-indicator],
    .expense-modal [data-highlighted] [data-radix-select-item-indicator] {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      position: absolute !important;
      left: -9999px !important;
      pointer-events: none !important;
    }

    /* Remove qualquer SVG de check dentro dos itens do select */
    .expense-modal [data-radix-select-item] svg,
    .expense-modal .expense-select-item svg,
    .expense-modal [role="option"] svg {
      display: none !important;
      visibility: hidden !important;
    }

    /* Ajusta o padding dos itens para remover o espaço do ícone */
    .expense-modal .expense-select-item,
    .expense-modal [data-radix-select-item] {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }

    .expense-select-trigger {
      background-color: #404040 !important;
      border-color: #525252 !important;
      color: white !important;
      border-radius: 0.75rem !important;
      min-height: 44px;
      font-size: 1rem;
      padding-left: 1rem;
      padding-right: 1rem;
      font-weight: 500;
    }
    .expense-select-content {
      background-color: #404040 !important;
      border-color: #525252 !important;
      border-radius: 0.75rem !important;
      min-width: var(--radix-select-trigger-width) !important;
      width: var(--radix-select-trigger-width) !important;
      box-shadow: none !important;
      margin-top: 0.2rem;
      padding: 0.25rem 0;
    }
    .expense-select-item {
      color: white !important;
      background-color: transparent !important;
      border-radius: 0.5rem !important;
      font-weight: 500;
      transition: background 0.1s;
      padding-left: 1rem;
      padding-right: 1rem;
      min-height: 40px;
      position: relative;
    }
    .expense-select-item[data-state="checked"],
    .expense-select-item:hover,
    .expense-select-item[data-highlighted] {
      background-color: #525252 !important;
      color: white !important;
    }
    [data-radix-popper-content-wrapper] { background: transparent !important; }
  `;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="expense-modal bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        {/* CSS matador para remover ícones de verificado */}
        <style>{selectStyle}</style>
        <DialogHeader>
          <DialogTitle className="text-white">Nova Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-white">
              Descrição *
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="value" className="text-white">
              Valor (R$) *
            </Label>
            <Input
              id="value"
              type="text"
              value={formData.value}
              onChange={handleValueChange}
              onBlur={handleValueBlur}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              placeholder="0,00"
              required
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-white">
              Categoria *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="expense-select-trigger">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="expense-select-content">
                <SelectItem value="Infraestrutura" className="expense-select-item">
                  Infraestrutura
                </SelectItem>
                <SelectItem value="Tecnologia" className="expense-select-item">
                  Tecnologia
                </SelectItem>
                <SelectItem value="Marketing" className="expense-select-item">
                  Marketing
                </SelectItem>
                <SelectItem value="Recursos Humanos" className="expense-select-item">
                  Recursos Humanos
                </SelectItem>
                <SelectItem value="Outros" className="expense-select-item">
                  Outros
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date" className="text-white">
              Data *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRecurring: checked as boolean })
              }
            />
            <Label htmlFor="isRecurring" className="text-white">
              Despesa recorrente
            </Label>
          </div>
          {formData.isRecurring && (
            <div>
              <Label htmlFor="recurrence" className="text-white">
                Recorrência
              </Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value) =>
                  setFormData({ ...formData, recurrence: value })
                }
              >
                <SelectTrigger className="expense-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="expense-select-content">
                  <SelectItem value="weekly" className="expense-select-item">
                    Semanal
                  </SelectItem>
                  <SelectItem value="monthly" className="expense-select-item">
                    Mensal
                  </SelectItem>
                  <SelectItem value="quarterly" className="expense-select-item">
                    Trimestral
                  </SelectItem>
                  <SelectItem value="yearly" className="expense-select-item">
                    Anual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-goat-purple hover:bg-goat-purple/90 text-white"
            >
              Adicionar Despesa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
