
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Excluir Despesa</DialogTitle>
          <DialogDescription className="text-goat-gray-300">
            Tem certeza que deseja excluir a despesa "{expenseDescription}"? Essa ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-goat-gray-600 hover:bg-goat-gray-500 text-white border-0 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
