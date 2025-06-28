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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  if (!stage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        {/* Força texto branco no hover e estados ativos */}
        <style>{`
          .stage-color-dropdown .dropdown-item,
          .stage-color-dropdown .dropdown-item:hover,
          .stage-color-dropdown .dropdown-item:focus {
            color: #fff !important;
            background-color: transparent;
          }
          .stage-color-dropdown .dropdown-item:hover,
          .stage-color-dropdown .dropdown-item[data-highlighted] {
            background-color: #525252 !important;
            color: #fff !important;
          }
        `}</style>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="dropdown-trigger w-full flex items-center justify-between bg-[#404040] border-[#525252] text-white"
                  style={{
                    backgroundColor: "#404040",
                    borderColor: "#525252",
                  }}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        colorOptions.find((c) => c.value === color)?.dot
                      }`}
                    ></span>
                    {
                      colorOptions.find((option) => option.value === color)
                        ?.label
                    }
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="stage-color-dropdown bg-[#404040] border-[#525252] p-0 w-full min-w-[150px]"
                align="start"
              >
                {colorOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setColor(option.value)}
                    className={`dropdown-item flex items-center gap-2 px-4 py-2 text-white text-sm cursor-pointer rounded-none
                      ${color === option.value ? "bg-goat-gray-700" : ""}
                      hover:bg-goat-gray-600 hover:text-white focus:bg-goat-gray-600 focus:text-white
                    `}
                  >
                    <span className={`w-3 h-3 rounded-full ${option.dot}`} />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
