
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Send, Phone, Filter } from "lucide-react";

export default function Conversations() {
  const conversations = [
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
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Conversas WhatsApp</h1>
        <p className="text-goat-gray-400">Central de mensagens via Evolution API</p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
          <Input 
            placeholder="Buscar conversas..." 
            className="pl-10 bg-goat-gray-800 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
          />
        </div>
        <Button variant="outline" className="border-goat-gray-600 text-white hover:bg-goat-gray-800">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <div className="lg:col-span-1">
          <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-goat-purple" />
              <h3 className="text-lg font-semibold text-white">Conversas</h3>
            </div>
            
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className="p-3 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700 cursor-pointer hover:border-goat-purple/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{conversation.client}</h4>
                      <p className="text-goat-gray-400 text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {conversation.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={conversation.tag === "Cliente" ? "default" : "secondary"}
                        className={conversation.tag === "Cliente" ? "bg-goat-purple" : "bg-goat-gray-700"}
                      >
                        {conversation.tag}
                      </Badge>
                      {conversation.unread > 0 && (
                        <Badge className="bg-red-500 text-white">
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
                    <div className={`w-2 h-2 rounded-full ${
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
            <div className="border-b border-goat-gray-700 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-white">Tech Solutions LTDA</h3>
              <p className="text-goat-gray-400 text-sm">+55 11 99999-9999</p>
            </div>
            
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              <div className="flex justify-start">
                <div className="bg-goat-gray-700 p-3 rounded-lg max-w-xs">
                  <p className="text-white text-sm">Olá, gostaria de saber mais sobre os serviços</p>
                  <span className="text-goat-gray-400 text-xs">10:30</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-goat-purple p-3 rounded-lg max-w-xs">
                  <p className="text-white text-sm">Olá! Claro, vou te explicar sobre nossos serviços.</p>
                  <span className="text-purple-200 text-xs">10:32</span>
                </div>
              </div>
            </div>
            
            {/* Input de envio */}
            <div className="flex gap-2">
              <Input 
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
              />
              <Button className="bg-goat-purple hover:bg-purple-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
