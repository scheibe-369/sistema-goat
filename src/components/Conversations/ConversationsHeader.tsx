// 1. Importe o NewConversationModal e o ícone PlusCircle
import { NewConversationModal } from "@/components/Conversations/NewConversationModal";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ConversationsHeaderProps {
  // A prop continua a mesma: uma função para criar a conversa
  onNewConversation: (client: string, phone: string) => void;
}

export function ConversationsHeader({ onNewConversation }: ConversationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Conversas WhatsApp</h1>
        <p className="text-gray-400">Central de mensagens via Evolution API</p>
      </div>

      {/* 2. A MUDANÇA CRUCIAL ESTÁ AQUI:
        O NewConversationModal agora "envelopa" o seu Button.
        Isso faz com que o modal use o seu botão roxo como gatilho,
        em vez de renderizar o próprio botão preto.
      */}
      <NewConversationModal onNewConversation={onNewConversation}>
        <Button className="btn-primary">
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </NewConversationModal>
    </div>
  );
}