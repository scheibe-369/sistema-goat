
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

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
  onUpdateStage: (updatedStage: Stage) => void;
}

const colorOptions = [
  { name: 'Cinza', value: 'bg-gray-500' },
  { name: 'Amarelo', value: 'bg-yellow-500' },
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Verde', value: 'bg-green-500' },
  { name: 'Vermelho', value: 'bg-red-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
  { name: 'Laranja', value: 'bg-orange-500' },
];

export function EditStageModal({ open, onOpenChange, stage, onUpdateStage }: EditStageModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('bg-gray-500');

  useEffect(() => {
    if (stage) {
      setName(stage.name);
      setColor(stage.color);
    }
  }, [stage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stage) return;

    const updatedStage = {
      ...stage,
      name,
      color,
    };

    onUpdateStage(updatedStage);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Etapa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Nome da Etapa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-white">Cor da Etapa</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-8 h-8 rounded-full ${option.value} ${
                    color === option.value ? 'ring-2 ring-white' : ''
                  }`}
                  title={option.name}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
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
