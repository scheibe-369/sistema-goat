
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

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

export function ColorPicker({ selectedColor, onColorChange, label = "Cor da Tag" }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getColorPreview = (colorClass: string) => {
    const bgColor = colorClass.split(' ')[0];
    return bgColor.replace('bg-', '');
  };

  const getSelectedColorName = () => {
    const found = predefinedColors.find(color => color.value === selectedColor);
    return found ? found.name : "Personalizada";
  };

  return (
    <div className="space-y-2">
      <label className="text-white text-sm">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-goat-gray-700 border-goat-gray-600 text-white hover:bg-goat-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${selectedColor.split(' ')[0]}`} />
              <span>{getSelectedColorName()}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 bg-goat-gray-800 border-goat-gray-700">
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
                } ${color.value.split(' ')[0]} hover:opacity-80`}
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
