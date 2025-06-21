
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ClientsHeaderProps {
  onNewClient: () => void;
}

export function ClientsHeader({ onNewClient }: ClientsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
        <p className="text-goat-gray-400">Gerencie seu cadastro de clientes</p>
      </div>
      <Button 
        className="btn-primary"
        onClick={onNewClient}
      >
        <Plus className="w-4 h-4 mr-2" />
        Novo Cliente
      </Button>
    </div>
  );
}
