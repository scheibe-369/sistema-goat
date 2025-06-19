
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Client {
  id: number;
  company: string;
  cnpj: string;
  responsible: string;
  phone: string;
  email: string;
  contractEnd: string;
  paymentDay: number;
  tags: string[];
  address: string;
  plan?: string;
  startDate?: string;
}

interface DeleteClientDialogProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteClientDialog({ isOpen, client, onClose, onConfirm }: DeleteClientDialogProps) {
  if (!client) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-white">
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-goat-gray-300">
            Tem certeza que deseja excluir o cliente "{client.company}"?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="border-goat-gray-600 text-white hover:bg-goat-gray-700"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white border-none"
          >
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
