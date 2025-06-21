
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ContractsHeaderProps {
  onNewContract: () => void;
}

export function ContractsHeader({ onNewContract }: ContractsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Contratos</h1>
        <p className="text-goat-gray-400">Gerencie seus contratos e propostas</p>
      </div>
      <Button 
        className="btn-primary"
        onClick={onNewContract}
      >
        <Plus className="w-4 h-4 mr-2" />
        Novo Contrato
      </Button>
    </div>
  );
}
