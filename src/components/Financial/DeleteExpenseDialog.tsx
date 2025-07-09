
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  expenseDescription: string;
}

export function DeleteExpenseDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  expenseDescription 
}: DeleteExpenseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Excluir Despesa</AlertDialogTitle>
          <AlertDialogDescription className="text-goat-gray-300">
            Tem certeza que deseja excluir a despesa "{expenseDescription}"? Essa ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="bg-goat-gray-600 hover:bg-goat-gray-500 text-white border-0">
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
