import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ConversationsHeaderProps {
  onNewConversation: () => void;
}

export function ConversationsHeader({ onNewConversation }: ConversationsHeaderProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-30 bg-transparent">
      <div className="max-w-[1600px] mx-auto w-full pl-4 lg:pl-6 pr-6 lg:pr-10 pt-6 pb-2 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Conversas WhatsApp</h1>
            <p className="text-goat-gray-400 text-sm sm:text-base">
              Central de mensagens via Evolution API
            </p>
          </div>

          <Button
            className="btn-primary h-10 px-3 sm:px-4 text-xs sm:text-sm"
            onClick={onNewConversation}
          >
            <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Nova Conversa
          </Button>
        </div>
      </div>
    </div>
  );
}
