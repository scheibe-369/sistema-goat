import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Send, Phone, MessageCircle, Filter, Plus } from "lucide-react";
import { NewConversationModal } from "@/components/Conversations/NewConversationModal";
import { ConversationSidebarFilters } from "@/components/Conversations/ConversationSidebarFilters";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  time: string;
  sender: "user" | "client";
}

interface Conversation {
  id: number;
  client: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  tag: string;
  direction: "inbound" | "outbound";
  stage: string;
  messages: Message[];
}

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

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      client: "Tech Solutions LTDA",
      phone: "+55 11 99999-9999",
      lastMessage: "Olá, gostaria de saber mais sobre os serviços",
      time: "10:30",
      unread: 2,
      tag: "Lead",
      direction: "inbound",
      stage: "Sem atendimento",
      messages: [
        { id: 1, text: "Olá, gostaria de saber mais sobre os serviços", time: "10:30", sender: "client" },
        { id: 2, text: "Olá! Claro, vou te explicar sobre nossos serviços.", time: "10:32", sender: "user" }
      ]
    },
    {
      id: 2,
      client: "Marketing Digital Pro",
      phone: "+55 11 88888-8888",
      lastMessage: "Perfeito, vamos agendar a reunião",
      time: "09:15",
      unread: 0,
      tag: "Cliente",
      direction: "outbound",
      stage: "Em atendimento",
      messages: [
        { id: 1, text: "Boa tarde! Como está o projeto?", time: "09:10", sender: "user" },
        { id: 2, text: "Está indo muito bem! Já temos os primeiros resultados.", time: "09:12", sender: "client" },
        { id: 3, text: "Perfeito, vamos agendar a reunião", time: "09:15", sender: "client" }
      ]
    },
    {
      id: 3,
      client: "Startup XYZ",
      phone: "+55 11 77777-7777",
      lastMessage: "Quando podemos conversar sobre o projeto?",
      time: "Ontem",
      unread: 1,
      tag: "Lead",
      direction: "inbound",
      stage: "Reunião agendada",
      messages: [
        { id: 1, text: "Quando podemos conversar sobre o projeto?", time: "Ontem", sender: "client" }
      ]
    }
  ]);

  const handleNewConversation = (client: string, phone: string) => {
    const newConversation: Conversation = {
      id: conversations.length + 1,
      client,
      phone,
      lastMessage: "Conversa iniciada",
      time: "Agora",
      unread: 0,
      tag: "Lead",
      direction: "outbound",
      stage: "Sem atendimento",
      messages: []
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setIsNewConversationModalOpen(false);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const currentTime = getCurrentTime();
      const newMsg: Message = {
        id: selectedConversation.messages.length + 1,
        text: newMessage.trim(),
        time: currentTime,
        sender: "user"
      };

      // Atualizar a conversa com a nova mensagem
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: newMessage.trim(), 
              time: currentTime,
              messages: [...conv.messages, newMsg]
            }
          : conv
      ));

      // Atualizar a conversa selecionada
      setSelectedConversation(prev => prev ? {
        ...prev,
        lastMessage: newMessage.trim(),
        time: currentTime,
        messages: [...prev.messages, newMsg]
      } : null);
      
      setNewMessage("");
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      });

      // Simular resposta automática do cliente após 2-5 segundos
      setTimeout(() => {
        simulateClientResponse(selectedConversation.id);
      }, Math.random() * 3000 + 2000);
    }
  };

  const simulateClientResponse = (conversationId: number) => {
    const responses = [
      "Obrigado pela informação!",
      "Entendi, vou analisar isso.",
      "Perfeito, faz sentido.",
      "Isso resolve minha dúvida.",
      "Ótimo, vamos prosseguir então.",
      "Combinado!",
      "Vou avaliar as opções e te retorno.",
      "Excelente, muito obrigado!"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const currentTime = getCurrentTime();

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const newMsg: Message = {
          id: conv.messages.length + 1,
          text: randomResponse,
          time: currentTime,
          sender: "client"
        };
        
        return {
          ...conv,
          lastMessage: randomResponse,
          time: currentTime,
          messages: [...conv.messages, newMsg],
          unread: selectedConversation?.id === conversationId ? 0 : conv.unread + 1
        };
      }
      return conv;
    }));

    // Se a conversa atual está selecionada, atualizar ela também
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => {
        if (!prev) return null;
        const newMsg: Message = {
          id: prev.messages.length + 1,
          text: randomResponse,
          time: currentTime,
          sender: "client"
        };
        return {
          ...prev,
          lastMessage: randomResponse,
          time: currentTime,
          messages: [...prev.messages, newMsg]
        };
      });
    }
  };

  const handleFiltersChange = (newFilters: { stages: string[], tags: string[], direction: string[], client: string }) => {
    setFilters(newFilters);
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.phone.includes(searchTerm);
    
    const matchesClient = !filters.client || conversation.client.toLowerCase().includes(filters.client.toLowerCase());
    
    const matchesStages = filters.stages.length === 0 || filters.stages.includes(conversation.stage);
    
    const matchesTags = filters.tags.length === 0 || filters.tags.includes(conversation.tag);
    
    const directionMap: { [key: string]: string } = {
      "Entrada": "inbound",
      "Saída": "outbound"
    };
    const matchesDirection = filters.direction.length === 0 || 
                           filters.direction.some(dir => directionMap[dir] === conversation.direction);
    
    return matchesSearch && matchesClient && matchesStages && matchesTags && matchesDirection;
  });

  const hasActiveFilters = filters.stages.length > 0 || filters.tags.length > 0 || filters.direction.length > 0 || filters.client !== "";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Conversas WhatsApp</h1>
          <p className="text-goat-gray-400">Central de mensagens via Evolution API</p>
        </div>
        <Button 
          onClick={() => setIsNewConversationModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova conversa
        </Button>
      </div>

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
          variant="outline" 
          className="btn-outline"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-2 bg-goat-purple text-white text-xs">
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
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-goat-purple/20 border-goat-purple/50'
                      : 'bg-goat-gray-900/50 border-goat-gray-700 hover:border-goat-purple/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{conversation.client}</h4>
                      <p className="text-goat-gray-400 text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {conversation.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <Badge 
                        variant={conversation.tag === "Cliente" ? "default" : "secondary"}
                        className={`text-xs ${
                          conversation.tag === "Cliente" ? "bg-goat-purple text-white" : "bg-goat-gray-700 text-goat-gray-300"
                        }`}
                      >
                        {conversation.tag}
                      </Badge>
                      {conversation.unread > 0 && (
                        <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-goat-gray-300 text-sm mb-2 line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-goat-gray-500 text-xs">{conversation.time}</span>
                      <Badge className="bg-goat-gray-600 text-goat-gray-300 text-xs">
                        {conversation.stage}
                      </Badge>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      conversation.direction === "inbound" ? "bg-green-400" : "bg-blue-400"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
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
                      <h3 className="text-lg font-semibold text-white">{selectedConversation.client}</h3>
                      <p className="text-goat-gray-400 text-sm">{selectedConversation.phone}</p>
                    </div>
                  </div>
                </div>
                
                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                        message.sender === "user" 
                          ? "bg-goat-purple text-white" 
                          : "bg-goat-gray-700 text-white"
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <span className={`text-xs ${
                          message.sender === "user" ? "text-purple-200" : "text-goat-gray-400"
                        }`}>
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Input de envio */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Digite sua mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary"
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

      {/* Modais */}
      <NewConversationModal 
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onNewConversation={handleNewConversation} 
      />

      <ConversationSidebarFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}