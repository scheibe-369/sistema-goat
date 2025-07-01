
"use client";

import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface Contract {
  id: string;
  monthlyValue: number;
  endDate: string;
}

interface DeleteContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contract: Contract | null;
}

export function DeleteContractDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  contract 
}: DeleteContractDialogProps) {

  if (!isOpen || !contract) return null;

  // --- Lógica de Cálculo ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(new Date(contract.endDate).valueOf() + new Date(contract.endDate).getTimezoneOffset() * 60000);
  const isExpired = today > endDate;

  let monthsRemaining = 0;
  if (!isExpired) {
    const yearDiff = endDate.getFullYear() - today.getFullYear();
    const monthDiff = endDate.getMonth() - today.getMonth();
    monthsRemaining = yearDiff * 12 + monthDiff;
    if (today.getDate() <= endDate.getDate()) {
      monthsRemaining += 1;
    }
    if (monthsRemaining < 0) monthsRemaining = 0;
  }

  const remainingValue = monthsRemaining * contract.monthlyValue;
  const penaltyFee = remainingValue * 0.20;

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  // --- Fim da Lógica de Cálculo ---

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div 
          className="relative bg-goat-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-goat-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-goat-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cancelar Contrato</h2>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-6 text-center space-y-4">
            {isExpired ? (
              <>
                <p className="text-lg text-white">Este contrato já está vencido.</p>
                <p className="text-goat-gray-400">
                  Deseja remover este contrato do sistema? Esta ação não pode ser desfeita.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-white">Tem certeza que deseja cancelar este contrato antes do prazo?</p>
                <div className="text-left bg-goat-gray-900/50 p-4 rounded-lg border border-goat-gray-700 space-y-2">
                  <div className="flex justify-between"><span className="text-goat-gray-400">Meses Restantes:</span> <span className="text-white font-semibold">{monthsRemaining}</span></div>
                  <div className="flex justify-between"><span className="text-goat-gray-400">Valor Restante do Contrato:</span> <span className="text-white font-semibold">{formatCurrency(remainingValue)}</span></div>
                  <div className="flex justify-between text-yellow-400"><span className="font-semibold">Multa de Cancelamento (20%):</span> <span className="font-bold">{formatCurrency(penaltyFee)}</span></div>
                </div>
                <p className="text-sm text-goat-gray-500 pt-2">
                  Ao confirmar, o contrato será marcado como inativo e a multa será registrada.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-4 p-6 bg-goat-gray-900/30 border-t border-goat-gray-700 rounded-b-xl">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 text-base btn-outline"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="flex-1 h-11 text-base bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              {isExpired ? 'Sim, Remover' : 'Sim, Cancelar Contrato'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
