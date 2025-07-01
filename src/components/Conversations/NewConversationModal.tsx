
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Phone, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: (client: string, phone: string) => void;
}

export function NewConversationModal({ 
  isOpen, 
  onClose, 
  onNewConversation 
}: NewConversationModalProps) {
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client.trim() || !phone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome do cliente e telefone",
        variant: "destructive",
      });
      return;
    }

    onNewConversation(client.trim(), phone.trim());
    setClient("");
    setPhone("");
    onClose(); 
    
    toast({
      title: "Conversa iniciada",
      description: `Nova conversa criada com ${client}`,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Container do Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div 
          className="relative bg-goat-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-goat-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-goat-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nova Conversa</h2>
                <p className="text-goat-gray-400 text-sm">Preencha os dados para começar</p>
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

          {/* Conteúdo e Formulário */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-white">Nome do Cliente</Label>
                <Input
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Digite o nome do cliente..."
                  className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="pl-10 bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  className="btn-outline"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  Iniciar Conversa
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
