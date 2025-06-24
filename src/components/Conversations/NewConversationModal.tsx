import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface NewConversationModalProps {
  onNewConversation: (client: string, phone: string) => void;
}

export function NewConversationModal({ onNewConversation }: NewConversationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client.trim() && phone.trim()) {
      onNewConversation(client.trim(), phone.trim());
      setClient("");
      setPhone("");
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setClient("");
    setPhone("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Conversa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-white">
              Nome do Cliente
            </Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Digite o nome do cliente"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Digite o telefone (ex: +55 11 99999-9999)"
              className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="btn-outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-primary"
            >
              Iniciar Conversa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

