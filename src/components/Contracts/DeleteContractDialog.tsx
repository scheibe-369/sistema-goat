
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Contract {
  id: string;
  client: string;
  type: string;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expiring';
}

interface DeleteContractDialogProps {
  isOpen: boolean;
  contract: Contract | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteContractDialog({ isOpen, contract, onClose, onConfirm }: DeleteContractDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Excluir Contrato</AlertDialogTitle>
          <AlertDialogDescription className="text-goat-gray-400">
            Tem certeza que deseja excluir o contrato de <strong className="text-white">{contract?.client}</strong>? 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
