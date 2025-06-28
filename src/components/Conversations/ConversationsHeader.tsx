
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ConversationsHeaderProps {
  onNewConversation: () => void;
}

export function ConversationsHeader({ onNewConversation }: ConversationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Conversas WhatsApp</h1>
        <p className="text-gray-400">Central de mensagens via Evolution API</p>
      </div>
      
      <Button 
        className="btn-primary h-10 px-4"
        onClick={onNewConversation}
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Nova Conversa
      </Button>
    </div>
  );
}
