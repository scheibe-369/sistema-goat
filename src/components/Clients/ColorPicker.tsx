// Em seu arquivo ColorPicker.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
  // 1. Adicione uma nova prop para receber a classe do gatilho
  triggerClassName?: string;
}

const predefinedColors = [
  // ... sua lista de cores permanece a mesma
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
  label = "Cor da Tag",
  // 2. Desestruture a nova prop com um valor padrão
  triggerClassName = "" 
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
          {/* 3. Remova os estilos fixos e aplique a prop */}
          <Button
            // Remova variant="outline" e o style={{...}}
            className={`w-full justify-between h-10 px-3 py-2 text-sm ${triggerClassName}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${selectedColor.split(' ')[0]}`} />
              <span>{getSelectedColorName()}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-4 border-goat-gray-700 bg-goat-gray-700" // Use classes do Tailwind se possível
        >
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((color) => (
              <Button
                key={color.name}
                onClick={() => {
                  onColorChange(color.value);
                  setIsOpen(false);
                }}
                className={`w-10 h-10 p-0 rounded-lg border-2 ${
                  selectedColor === color.value 
                    ? 'border-white' 
                    : 'border-transparent hover:border-goat-gray-500'
                } ${color.value.split(' ')[0]} hover:opacity-80 transition-all`}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}