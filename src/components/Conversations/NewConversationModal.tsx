
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewConversationModalProps {
  onNewConversation: (client: string, phone: string) => void;
}

export function NewConversationModal({ onNewConversation }: NewConversationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    
    toast({
      title: "Conversa iniciada",
      description: `Nova conversa criada com ${client}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Conversa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
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
