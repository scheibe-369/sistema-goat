
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AddStageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStage: (stage: { name: string; color: string }) => void;
}

const colorOptions = [
  { name: "Cinza", value: "bg-gray-500", dot: "bg-gray-500" },
  { name: "Vermelho", value: "bg-red-500", dot: "bg-red-500" },
  { name: "Amarelo", value: "bg-yellow-500", dot: "bg-yellow-500" },
  { name: "Verde", value: "bg-green-500", dot: "bg-green-500" },
  { name: "Azul", value: "bg-blue-500", dot: "bg-blue-500" },
  { name: "Roxo", value: "bg-purple-500", dot: "bg-purple-500" },
  { name: "Rosa", value: "bg-pink-500", dot: "bg-pink-500" },
  { name: "Laranja", value: "bg-orange-500", dot: "bg-orange-500" },
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

  const getColorSelected = () => {
    const selected = colorOptions.find((opt) => opt.value === selectedColor);
    if (!selected) return <span className="text-white">Selecione uma cor</span>;
    return (
      <span className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${selected.dot}`} />
        {selected.name}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
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
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue>
                  {getColorSelected()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${option.dot}`} />
                      {option.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
