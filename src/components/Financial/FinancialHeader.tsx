
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FinancialHeaderProps {
  onNewTransaction: () => void;
}

export function FinancialHeader({ onNewTransaction }: FinancialHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
        <p className="text-goat-gray-400">Controle suas receitas e despesas</p>
      </div>
      <Button 
        className="btn-primary h-10 px-4"
        onClick={onNewTransaction}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Transação
      </Button>
    </div>
  );
}
