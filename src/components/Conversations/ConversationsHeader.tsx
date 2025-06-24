import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Send, Phone, Filter, Plus, MessageCircle } from "lucide-react";

interface Conversation {
  id: number;
  client: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  tag: string;
  direction: "inbound" | "outbound";
}

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      client: "Tech Solutions LTDA",
      phone: "+55 11 99999-9999",
      lastMessage: "Olá, gostaria de saber mais sobre os serviços",
      time: "10:30",
      unread: 2,
      tag: "Lead",
      direction: "inbound"
    },
    {
      id: 2,
      client: "Marketing Digital Pro",
      phone: "+55 11 88888-8888",
      lastMessage: "Perfeito, vamos agendar a reunião",
      time: "09:15",
      unread: 0,
      tag: "Cliente",
      direction: "outbound"
    },
    {
      id: 3,
      client: "Startup XYZ",
      phone: "+55 11 77777-7777",
      lastMessage: "Quando podemos conversar sobre o projeto?",
      time: "Ontem",
      unread: 1,
      tag: "Lead",
      direction: "inbound"
    }
  ]);

  const handleNewConversation = () => {
    // Lógica para iniciar nova conversa
    console.log("Nova conversa");
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Lógica para enviar mensagem
      console.log("Enviando mensagem:", newMessage);
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com botão de nova conversa */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Conversas</h1>
          <p className="text-goat-gray-400">Gerencie suas conversas e atendimentos</p>
        </div>
        <Button 
          className="btn-primary"
          onClick={handleNewConversation}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
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
          variant="outline" 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="border-goat-gray-600 text-white hover:bg-goat-gray-800"
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: 'auto',
            width: 'auto'
          }}
        >
          <Filter className="w-4 h-4" />
          Filtros
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
                    <span className="text-goat-gray-500 text-xs">{conversation.time}</span>
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
                  <div className="flex justify-start">
                    <div className="bg-goat-gray-700 p-3 rounded-lg max-w-xs lg:max-w-md">
                      <p className="text-white text-sm">{selectedConversation.lastMessage}</p>
                      <span className="text-goat-gray-400 text-xs">{selectedConversation.time}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-goat-purple p-3 rounded-lg max-w-xs lg:max-w-md">
                      <p className="text-white text-sm">Olá! Claro, vou te explicar sobre nossos serviços.</p>
                      <span className="text-purple-200 text-xs">10:32</span>
                    </div>
                  </div>
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
                    className="bg-goat-purple hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-4"
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      width: 'auto'
                    }}
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
    </div>
  );
}

