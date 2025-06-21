
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ConversationsHeaderProps {
  onNewConversation: () => void;
}

export function ConversationsHeader({ onNewConversation }: ConversationsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Conversas</h1>
        <p className="text-goat-gray-400">Gerencie suas conversas e atendimentos</p>
      </div>
      <Button 
        className="btn-primary"
        onClick={onNewConversation}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Conversa
      </Button>
    </div>
  );
}
