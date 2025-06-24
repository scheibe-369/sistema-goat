"use client"; // Manter esta diretiva

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Phone, X } from "lucide-react"; // Adicionado X para o botão de fechar
import { useToast } from "@/hooks/use-toast";

// 1. As props agora são iguais às do NewClientModal
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
  // 2. REMOVIDO o estado de 'isOpen'. Ele agora vem de fora.
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
    // 3. Em vez de setar o estado interno, chamamos a função 'onClose' que veio de fora.
    onClose(); 
    
    toast({
      title: "Conversa iniciada",
      description: `Nova conversa criada com ${client}`,
    });
  };

  // O Dialog agora é controlado pelas props isOpen e onOpenChange (que chama onClose)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 4. REMOVIDO o <DialogTrigger>. O modal não cria mais seu próprio botão. */}
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Conversa</DialogTitle>
           {/* Botão de fechar (X) para consistência, opcional mas recomendado */}
           <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-goat-gray-400 hover:text-white hover:bg-goat-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="client" className="text-white">Nome do Cliente</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Digite o nome do cliente..."
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-white">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="pl-10 bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              // 5. O botão Cancelar agora também chama a função 'onClose'.
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
      </DialogContent>
    </Dialog>
  );
}