import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddStageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStage: (stage: { name: string; color: string }) => void;
}

const colorOptions = [
  { name: "Cinza", value: "bg-gray-500" },
  { name: "Vermelho", value: "bg-red-500" },
  { name: "Amarelo", value: "bg-yellow-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Azul", value: "bg-blue-500" },
  { name: "Roxo", value: "bg-purple-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Laranja", value: "bg-orange-500" },
];

export function AddStageModal({ open, onOpenChange, onAddStage }: AddStageModalProps) {
  const [stageName, setStageName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-gray-500");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageName.trim()) {
      onAddStage({
        name: stageName.trim(),
        color: selectedColor,
      });
      setStageName("");
      setSelectedColor("bg-gray-500");
      onOpenChange(false);
    }
  };

  // Custom style: texto branco, placeholder branco, labels das cores brancas, buttons alinhados
  const gridStyle = `
    .add-stage-color-btn {
      background: transparent !important;
      border-radius: 0.75rem !important;
      border-width: 2px;
      border-style: solid;
      color: #fff !important;
      transition: border 0.15s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
      min-width: 70px;
      min-height: 70px;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      cursor: pointer;
      outline: none;
    }
    .add-stage-color-btn .add-stage-dot {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 9999px;
      margin-bottom: 0.25rem;
      border: 2px solid #222;
      box-shadow: 0 0 0 1.5px #222;
    }
    .add-stage-color-btn.selected {
      border-color: #6B21D3 !important;
      background: #34205322 !important;
      color: #fff !important;
    }
    .add-stage-color-btn:not(.selected) {
      border-color: #525252 !important;
    }
    .add-stage-color-btn:hover:not(.selected) {
      border-color: #6B21D3 !important;
    }
    .add-stage-color-label {
      font-size: 0.9rem;
      color: #fff !important;
      font-weight: 500;
      margin: 0;
    }
    /* Placeholder branco */
    input#stage-name::placeholder {
      color: #fff !important;
      opacity: 0.7 !important;
    }
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <style>{gridStyle}</style>
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Nova Etapa</DialogTitle>
          <DialogDescription className="text-goat-gray-400">
            Crie uma nova etapa para organizar seus leads
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stage-name" className="text-white">
              Nome da Etapa *
            </Label>
            <Input
              id="stage-name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Ex: Negociação, Fechamento..."
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-white">Cor da Etapa</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  type="button"
                  key={color.value}
                  tabIndex={0}
                  className={`add-stage-color-btn ${
                    selectedColor === color.value ? "selected" : ""
                  }`}
                  onClick={() => setSelectedColor(color.value)}
                >
                  <div className={`add-stage-dot ${color.value}`}></div>
                  <span className="add-stage-color-label">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 flex-row-reverse flex">
            <Button
              type="submit"
              className="flex-1 bg-goat-purple hover:bg-goat-purple/80 text-white text-lg font-semibold h-12 border-0"
            >
              Adicionar
            </Button>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold h-12 border-0"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
