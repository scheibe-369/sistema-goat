
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ClientsHeaderProps {
  onNewClient: () => void;
  onCreateTestClient?: () => void;
}

export function ClientsHeader({ onNewClient, onCreateTestClient }: ClientsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
        <p className="text-goat-gray-400">Gerencie seu cadastro de clientes</p>
      </div>
      <div className="flex gap-2">
        {onCreateTestClient && (
          <Button 
            className="btn-secondary h-10 px-4"
            onClick={onCreateTestClient}
          >
            🧪 Cliente Teste
          </Button>
        )}
        <Button 
          className="btn-primary h-10 px-4"
          onClick={onNewClient}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
}
