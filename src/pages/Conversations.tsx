import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Send, Phone, MessageCircle, Filter } from "lucide-react"; 
import { ConversationSidebarFilters } from "@/components/Conversations/ConversationSidebarFilters";
import { WebhookTester } from "@/components/Conversations/WebhookTester";
import { MessageMedia } from "@/components/Conversations/MessageMedia";
import { useToast } from "@/hooks/use-toast";
import { ConversationsHeader } from "@/components/Conversations/ConversationsHeader";
import { NewConversationModal } from "@/components/Conversations/NewConversationModal";
import { useConversations, useMessages, useCreateConversation, type Conversation } from "@/hooks/useConversations";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useStages } from "@/hooks/useStages";
import { supabase } from "@/integrations/supabase/client";

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    stages: [] as string[], 
    tags: [] as string[], 
    direction: [] as string[],
    client: ""
  });
  const { toast } = useToast();

  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useConversations();
  const { data: messages = [], refetch: refetchMessages } = useMessages(selectedConversation?.id || "");
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateConversation();
  const { stages } = useStages();

  // Configurar tempo real para conversas
  useEffect(() => {
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          refetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchConversations]);

  // Configurar tempo real para mensagens da conversa selecionada
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id, refetchMessages]);

  // Função para marcar conversa como lida
  const markConversationAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
      
      // Atualizar a lista de conversas para refletir a mudança
      refetchConversations();
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
    }
  };

  // Função para selecionar conversa e marcar como lida
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Se a conversa tem mensagens não lidas, marcar como lida
    if (conversation.unread_count && conversation.unread_count > 0) {
      markConversationAsRead(conversation.id);
    }
  };

  const handleNewConversation = (client: string, phone: string) => {
    createConversationMutation.mutate(
      { phone, contactName: client },
      {
        onSuccess: (newConversation) => {
          setSelectedConversation(newConversation);
          setIsNewConversationModalOpen(false);
        }
      }
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate(
        { 
          numero: selectedConversation.phone,
          mensagem: newMessage.trim(),
          nome_contato: selectedConversation.contact_name
        },
        {
          onSuccess: () => {
            setNewMessage("");
          }
        }
      );
    }
  };

  const handleFiltersChange = (newFilters: { stages: string[], tags: string[], direction: string[], client: string }) => {
    setFilters(newFilters);
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = (conversation.contact_name || conversation.phone).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = !filters.client || (conversation.contact_name || "").toLowerCase().includes(filters.client.toLowerCase());
    const matchesStages = filters.stages.length === 0 || filters.stages.includes(conversation.stage || "");
    const matchesTags = filters.tags.length === 0 || filters.tags.includes(conversation.tag || "");
    const matchesDirection = filters.direction.length === 0 || filters.direction.includes(conversation.direction || "");
    return matchesSearch && matchesClient && matchesStages && matchesTags && matchesDirection;
  });

  const hasActiveFilters = filters.stages.length > 0 || filters.tags.length > 0 || filters.direction.length > 0 || filters.client !== "";

  // Função para converter timestamp UTC para horário local brasileiro (UTC-3)
  const formatTime = (dateString?: string) => {
    if (!dateString) return "Agora";
    try {
      // Criar Date do timestamp UTC armazenado no banco
      const dateUtc = new Date(dateString);
      
      // Converter para horário brasileiro (UTC-3) manualmente
      const brazilTime = new Date(dateUtc.getTime() - (3 * 60 * 60 * 1000));
      
      // Formatar no padrão brasileiro
      const hours = brazilTime.getUTCHours().toString().padStart(2, '0');
      const minutes = brazilTime.getUTCMinutes().toString().padStart(2, '0');
      
      return `${hours}:${minutes}`;
    } catch (error) {
      console.warn('Erro ao converter horário:', error, 'DateString:', dateString);
      return "Agora";
    }
  };

  const getStageName = (stageId?: string) => {
    if (!stageId) return "Sem atendimento";
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || "Sem atendimento";
  };

  // Determinar se a mensagem é do usuário usando o campo numero
  const isUserMessage = (message: any) => {
    return message.direcao === true || message.numero === "user";
  };

  if (conversationsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ConversationsHeader onNewConversation={() => setIsNewConversationModalOpen(true)} />
        <div className="flex items-center justify-center h-64">
          <div className="text-goat-gray-400">Carregando conversas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      <ConversationsHeader onNewConversation={() => setIsNewConversationModalOpen(true)} />

      {/* Webhook Tester */}
      <WebhookTester />

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
          <Input 
            placeholder="Buscar conversas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-goat-gray-800 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
          />
        </div>
        <Button 
          onClick={() => setIsFiltersOpen(true)}
          className="btn-primary"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-2 bg-white text-goat-purple text-xs">
              {filters.stages.length + filters.tags.length + filters.direction.length + (filters.client ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <div className="lg:col-span-1">
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-goat-purple" />
              <h3 className="text-lg font-semibold text-white">Conversas ({filteredConversations.length})</h3>
            </div>
            
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
                <p className="text-goat-gray-400 mb-4">Nenhuma conversa encontrada</p>
                <Button 
                  onClick={() => setIsNewConversationModalOpen(true)}
                  className="btn-primary"
                >
                  Iniciar Nova Conversa
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    onClick={() => handleSelectConversation(conversation)} 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-goat-purple/20 border-goat-purple/50' 
                        : 'bg-goat-gray-900/50 border-goat-gray-700 hover:border-goat-purple/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate">
                          {conversation.contact_name || conversation.phone}
                        </h4>
                        <p className="text-goat-gray-400 text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" /> 
                          {conversation.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <Badge 
                          variant={conversation.tag === "Cliente" ? "default" : "secondary"} 
                          className={`text-xs ${
                            conversation.tag === "Cliente" 
                              ? "bg-goat-purple text-white" 
                              : "bg-goat-gray-700 text-goat-gray-300"
                          }`}
                        >
                          {conversation.tag || "Lead"}
                        </Badge>
                        {(conversation.unread_count || 0) > 0 && (
                          <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-goat-gray-300 text-sm mb-2 line-clamp-2">
                      {conversation.last_message || "Sem mensagens"}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-goat-gray-500 text-xs">
                          {formatTime(conversation.updated_at)}
                        </span>
                        <Badge className="bg-goat-gray-600 text-goat-gray-300 text-xs">
                          {getStageName(conversation.stage)}
                        </Badge>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        conversation.direction === "inbound" ? "bg-green-400" : "bg-blue-400"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-4 h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="border-b border-goat-gray-700 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-goat-purple rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedConversation.contact_name || selectedConversation.phone}
                      </h3>
                      <p className="text-goat-gray-400 text-sm">{selectedConversation.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${isUserMessage(message) ? "justify-end" : "justify-start"}`}>
                      <div className={`p-2 rounded-2xl w-auto ${
                        message.media_type && message.media_type.startsWith('audio/')
                          ? ''
                          : ''
                      } ${
                        isUserMessage(message)
                          ? "bg-goat-purple text-white rounded-br-md"
                          : "bg-goat-gray-700 text-white rounded-bl-md"
                      }`}
                      style={{
                        minWidth: 48,
                        ...(message.media_type && message.media_type.startsWith('audio/')
                          ? { maxWidth: '50%' }
                          : { maxWidth: 320 })
                      }}
                      >
                        {(message.text || message.mensagem) && 
                         !(message.media_type && message.media_url) && (
                          <p className="text-sm break-words whitespace-pre-line">{message.text || message.mensagem}</p>
                        )}
                        
                        {/* Renderizar mídia se existir */}
                        {message.media_type && message.media_url && (
                          <MessageMedia
                            mediaType={message.media_type}
                            mediaUrl={message.media_url}
                            mediaFilename={message.media_filename || undefined}
                            mediaSize={message.media_size || undefined}
                            isUserMessage={isUserMessage(message)}
                          />
                        )}
                        
                        <span className={`text-xs block mt-2 ${
                          isUserMessage(message)
                            ? "text-purple-200" 
                            : "text-goat-gray-400"
                        }`}>
                          {formatTime(message.data_hora || message.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Digite sua mensagem..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                    className="flex-1 bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400" 
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sendMessageMutation.isPending} 
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-goat-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Selecione uma conversa</h3>
                  <p className="text-goat-gray-400">Escolha uma conversa da lista para começar a conversar</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de Filtros */}
      <ConversationSidebarFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Modal de Nova Conversa */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onNewConversation={handleNewConversation}
      />

    </div>
  );
}
