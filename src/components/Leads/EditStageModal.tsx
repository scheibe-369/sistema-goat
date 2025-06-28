import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { ChevronDown } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: any[];
}

interface EditStageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: Stage | null;
  onUpdateStage: (updatedStage: { name: string; color: string }) => void;
}

const colorOptions = [
  { value: "bg-gray-500", label: "Cinza", dot: "bg-gray-500" },
  { value: "bg-red-500", label: "Vermelho", dot: "bg-red-500" },
  { value: "bg-yellow-500", label: "Amarelo", dot: "bg-yellow-500" },
  { value: "bg-green-500", label: "Verde", dot: "bg-green-500" },
  { value: "bg-blue-500", label: "Azul", dot: "bg-blue-500" },
  { value: "bg-purple-500", label: "Roxo", dot: "bg-purple-500" },
  { value: "bg-pink-500", label: "Rosa", dot: "bg-pink-500" },
  { value: "bg-orange-500", label: "Laranja", dot: "bg-orange-500" },
];

export function EditStageModal({
  open,
  onOpenChange,
  stage,
  onUpdateStage,
}: EditStageModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorOptions[0].value);

  useEffect(() => {
    if (stage) {
      setName(stage.name);
      setColor(stage.color);
    }
  }, [stage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateStage({ name: name.trim(), color });
    onOpenChange(false);
  };

  // Helper visual do valor selecionado
  const getColorSelected = () => {
    const selected = colorOptions.find((opt) => opt.value === color);
    if (!selected)
      return <span className="text-white">Selecione uma cor</span>;
    return (
      <span className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${selected.dot}`} />
        {selected.label}
      </span>
    );
  };

  // CSS customizado para remover verificado e forçar apenas um ChevronDown
  const selectStyle = `
    .edit-stage-trigger {
      background-color: #404040 !important;
      border-color: #525252 !important;
      color: #fff !important;
      border-radius: 0.75rem !important;
      min-height: 44px;
      font-size: 1rem;
      padding-left: 1rem;
      padding-right: 2.5rem;
      transition: border-color 0.15s;
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem;
      font-weight: 500;
      position: relative;
    }
    .edit-stage-trigger svg {
      color: #fff !important;
      opacity: 0.7;
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    .edit-stage-value,
    .edit-stage-value span {
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem;
      color: #fff !important;
    }
    .edit-stage-content {
      background-color: #404040 !important;
      border-color: #525252 !important;
      border-radius: 0.75rem !important;
      min-width: var(--radix-select-trigger-width) !important;
      width: var(--radix-select-trigger-width) !important;
      box-shadow: none !important;
      margin-top: 0.2rem;
      padding: 0.25rem 0;
    }
    .edit-stage-item {
      color: #fff !important;
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
      position: relative;
    }
    .edit-stage-item[data-state="checked"], .edit-stage-item:hover, .edit-stage-item[data-highlighted] {
      background-color: #525252 !important;
    }
    /* Remove ícone de verificado (check) */
    .edit-stage-item [data-select-item-indicator] {
      display: none !important;
    }
    [data-radix-popper-content-wrapper] { background: transparent !important; }
    .radix-select-overlay { display: none !important; }
  `;

  if (!stage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <style>{selectStyle}</style>
        <DialogHeader>
          <DialogTitle className="text-white">Editar Etapa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stageName" className="text-white">
              Nome da Etapa *
            </Label>
            <Input
              id="stageName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              placeholder="Digite o nome da etapa"
              required
            />
          </div>
          <div>
            <Label className="text-white mb-1">Cor da Etapa</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="edit-stage-trigger">
                <SelectValue className="edit-stage-value">{getColorSelected()}</SelectValue>
                <ChevronDown className="w-4 h-4 ml-auto" />
              </SelectTrigger>
              <SelectContent className="edit-stage-content">
                {colorOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="edit-stage-item"
                  >
                    <span className={`w-3 h-3 rounded-full ${option.dot}`} />
                    <span className="whitespace-nowrap">{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white border-0 transition-colors duration-200"
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary flex-1 h-12 text-lg font-semibold">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
