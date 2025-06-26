// Em seu arquivo: /components/ColorPicker.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

// Sua lista de cores permanece a mesma
const predefinedColors = [
    { name: "Roxo", value: "bg-purple-600 text-white hover:bg-purple-700" },
    { name: "Azul", value: "bg-blue-600 text-white hover:bg-blue-700" },
    { name: "Verde", value: "bg-green-600 text-white hover:bg-green-700" },
    { name: "Vermelho", value: "bg-red-600 text-white hover:bg-red-700" },
    { name: "Rosa", value: "bg-pink-600 text-white hover:bg-pink-700" },
    { name: "Amarelo", value: "bg-yellow-600 text-white hover:bg-yellow-700" },
    { name: "Laranja", value: "bg-orange-600 text-white hover:bg-orange-700" },
    { name: "Índigo", value: "bg-indigo-600 text-white hover:bg-indigo-700" },
    { name: "Cinza", value: "bg-gray-600 text-white hover:bg-gray-700" },
    { name: "Teal", value: "bg-teal-600 text-white hover:bg-teal-700" },
];

export function ColorPicker({ 
  selectedColor, 
  onColorChange, 
  label = "Cor da Tag" 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSelectedColorName = () => {
    const found = predefinedColors.find(color => color.value === selectedColor);
    return found ? found.name : "Personalizada";
  };

  return (
    <div className="space-y-2">
      <label className="text-white text-sm font-medium">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {/* MUDANÇA CRÍTICA AQUI:
            1. Removemos a prop 'variant="outline"' que injeta estilos indesejados.
            2. Removemos o 'style' inline.
            3. Aplicamos as classes do Input DIRETAMENTE, incluindo background, borda, texto e anéis de foco para consistência total.
          */}
          <Button
            className="w-full justify-between h-10 px-3 py-2 text-sm text-white placeholder:text-white/70 
                       bg-goat-gray-700 border border-goat-gray-600 
                       hover:bg-goat-gray-700
                       focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-goat-purple/50 focus-visible:ring-offset-goat-gray-800"
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${selectedColor.split(' ')[0]}`} />
              <span>{getSelectedColorName()}</span>
            </div>
          </Button>
        </PopoverTrigger>
        {/* MUDANÇA CRÍTICA NO POPOVER:
          1. Adicionamos as classes de fundo e borda para corrigir o pop-up preto.
          2. 'w-auto' permite que o conteúdo defina a largura.
        */}
        <PopoverContent 
          className="w-auto p-2 bg-goat-gray-800 border-goat-gray-700 shadow-lg"
        >
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  onColorChange(color.value);
                  setIsOpen(false);
                }}
                className={`w-10 h-10 p-0 rounded-lg border-2 transition-all
                  ${selectedColor === color.value 
                    ? 'border-white ring-2 ring-white/50' 
                    : 'border-transparent hover:border-goat-gray-500'
                  } 
                  ${color.value.split(' ')[0]}`
                }
                title={color.name}
              >
                {selectedColor === color.value && (
                  <Check className="w-4 h-4 text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}