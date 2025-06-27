
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
  { name: 'Cinza', value: 'bg-gray-500' },
  { name: 'Vermelho', value: 'bg-red-500' },
  { name: 'Amarelo', value: 'bg-yellow-500' },
  { name: 'Verde', value: 'bg-green-500' },
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
  { name: 'Laranja', value: 'bg-orange-500' },
];

export function AddStageModal({ open, onOpenChange, onAddStage }: AddStageModalProps) {
  const [stageName, setStageName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-gray-500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageName.trim()) {
      onAddStage({
        name: stageName.trim(),
        color: selectedColor
      });
      setStageName('');
      setSelectedColor('bg-gray-500');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Etapa</DialogTitle>
          <DialogDescription className="text-goat-gray-400">
            Crie uma nova etapa para organizar seus leads
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage-name">Nome da Etapa</Label>
            <Input
              id="stage-name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Ex: Negociação, Fechamento..."
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cor da Etapa</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    selectedColor === color.value 
                      ? 'border-goat-purple' 
                      : 'border-goat-gray-600 hover:border-goat-gray-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${color.value} mx-auto`}></div>
                  <span className="text-xs text-goat-gray-400 mt-1 block">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary">
              Adicionar Etapa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
