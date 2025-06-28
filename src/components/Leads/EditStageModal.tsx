import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  { value: 'bg-gray-500', label: 'Cinza', class: 'bg-gray-500' },
  { value: 'bg-red-500', label: 'Vermelho', class: 'bg-red-500' },
  { value: 'bg-yellow-500', label: 'Amarelo', class: 'bg-yellow-500' },
  { value: 'bg-green-500', label: 'Verde', class: 'bg-green-500' },
  { value: 'bg-blue-500', label: 'Azul', class: 'bg-blue-500' },
  { value: 'bg-purple-500', label: 'Roxo', class: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'bg-orange-500', label: 'Laranja', class: 'bg-orange-500' }
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
    if (!name.trim()) return;
    onUpdateStage({ name: name.trim(), color });
    onOpenChange(false);
  };

  if (!stage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Etapa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stageName" className="text-white">Nome da Etapa *</Label>
            <Input
              id="stageName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-white"
              placeholder="Digite o nome da etapa"
              required
            />
          </div>

          <div>
            <Label htmlFor="stageColor" className="text-white">Cor da Etapa</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger
                className={`
                  bg-goat-purple
                  text-white
                  font-semibold
                  border-0
                  focus:ring-2 focus:ring-goat-purple/60
                  min-h-[44px]
                  rounded-md
                  px-3
                  w-full
                  transition-colors
                  hover:bg-goat-purple/90
                  placeholder:text-white
                `}
              >
                <SelectValue placeholder="Selecione uma cor" />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.class}`}></div>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
