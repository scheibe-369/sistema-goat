
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
      <DialogContent className="border-white/5 text-white max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 outline-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">Excluir Despesa</DialogTitle>
          <DialogDescription className="text-white/60 text-sm leading-relaxed mt-2">
            Tem certeza que deseja excluir a despesa <span className="text-white font-bold">"{expenseDescription}"</span>? Essa ação não poderá ser desfeita e os dados serão removidos permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="liquid-glass hover:bg-white/10 text-white/60 h-12 rounded-xl font-bold transition-all border border-white/5"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
