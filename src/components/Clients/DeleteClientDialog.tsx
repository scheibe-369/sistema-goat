
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface Client {
  id: string;
  company: string;
  cnpj?: string;
  responsible?: string;
  phone?: string;
  email?: string;
  contractEnd?: string;
  paymentDay?: number;
  tags?: string[];
  address?: string;
  plan?: string;
  startDate?: string;
}

interface DeleteClientDialogProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteClientDialog({ 
  isOpen, 
  client, 
  onClose, 
  onConfirm 
}: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !client) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        className="relative bg-goat-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-goat-gray-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scale-in {
            from { 
              transform: scale(0.95);
              opacity: 0;
            }
            to { 
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-goat-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Excluir Cliente</h2>
              <p className="text-goat-gray-400 text-xs">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-700 rounded-lg h-8 w-8"
            disabled={isDeleting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Warning Section */}
          <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium text-red-400 text-sm">
                  Atenção: Exclusão Permanente
                </h3>
                <p className="text-red-300 text-xs leading-relaxed">
                  Você está prestes a excluir permanentemente este cliente. 
                  Todos os dados, histórico e informações relacionadas serão perdidos.
                </p>
              </div>
            </div>
          </div>

          {/* Client Info Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white border-b border-goat-gray-700 pb-1">
              Dados do Cliente
            </h4>
            
            <div className="bg-goat-gray-700/50 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-goat-gray-400 text-xs">Empresa:</span>
                  <p className="text-white font-medium text-sm">{client.company}</p>
                </div>
                
                {client.cnpj && client.responsible && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-goat-gray-400 text-xs">CNPJ:</span>
                      <p className="text-white text-xs">{client.cnpj}</p>
                    </div>
                    <div>
                      <span className="text-goat-gray-400 text-xs">Responsável:</span>
                      <p className="text-white text-xs">{client.responsible}</p>
                    </div>
                  </div>
                )}

                {client.phone && client.email && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-goat-gray-400 text-xs">Telefone:</span>
                      <p className="text-white text-xs">{client.phone}</p>
                    </div>
                    <div>
                      <span className="text-goat-gray-400 text-xs">E-mail:</span>
                      <p className="text-white text-xs break-all">{client.email}</p>
                    </div>
                  </div>
                )}

                {client.plan && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-goat-gray-400 text-xs">Plano:</span>
                      <p className="text-white text-xs">{client.plan}</p>
                    </div>
                    {client.tags && client.tags.length > 0 && (
                      <div>
                        <span className="text-goat-gray-400 text-xs">Status:</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          client.tags[0] === 'Ativo' 
                            ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                            : client.tags[0] === 'A vencer'
                            ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                            : 'bg-red-600/20 text-red-400 border border-red-600/30'
                        }`}>
                          {client.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-goat-gray-700">
          <Button
            onClick={onClose}
            className="flex-1 h-10 text-sm font-semibold bg-goat-gray-700 hover:bg-goat-gray-600 text-white border-0 transition-colors duration-200"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white border-0 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Excluindo...
              </div>
            ) : (
              'Excluir Cliente'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
