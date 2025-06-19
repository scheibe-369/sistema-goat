
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, Phone, Mail, Calendar, MapPin, Filter } from "lucide-react";

export default function Clients() {
  const clients = [
    {
      id: 1,
      company: "Tech Solutions LTDA",
      cnpj: "12.345.678/0001-90",
      responsible: "João Silva",
      phone: "+55 11 99999-9999",
      email: "contato@techsolutions.com",
      contractEnd: "2024-12-31",
      paymentDay: 15,
      tags: ["Ativo", "Premium"],
      address: "São Paulo, SP"
    },
    {
      id: 2,
      company: "Marketing Digital Pro",
      cnpj: "98.765.432/0001-10",
      responsible: "Maria Santos",
      phone: "+55 11 88888-8888",
      email: "maria@marketingpro.com",
      contractEnd: "2024-08-15",
      paymentDay: 5,
      tags: ["A vencer", "Gold"],
      address: "Rio de Janeiro, RJ"
    },
    {
      id: 3,
      company: "Consultoria ABC",
      cnpj: "11.222.333/0001-44",
      responsible: "Pedro Costa",
      phone: "+55 11 77777-7777",
      email: "pedro@consultoriaabc.com",
      contractEnd: "2025-01-31",
      paymentDay: 10,
      tags: ["Ativo", "Standard"],
      address: "Belo Horizonte, MG"
    }
  ];

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'ativo':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'a vencer':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      case 'vencido':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'premium':
        return 'bg-goat-purple text-white hover:bg-purple-600';
      case 'gold':
        return 'bg-yellow-700 text-white hover:bg-yellow-800';
      case 'standard':
        return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
      default:
        return 'bg-goat-gray-600 text-white hover:bg-goat-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-goat-gray-400">Gerencie seu cadastro de clientes</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
          <Input 
            placeholder="Buscar clientes..." 
            className="pl-10 bg-goat-gray-800 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
          />
        </div>
        <Button variant="outline" className="border-goat-gray-600 text-white hover:bg-goat-gray-800">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-goat-gray-400 text-sm">Clientes Ativos</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-goat-gray-400 text-sm">Contratos A Vencer</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-goat-purple/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-goat-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-goat-gray-400 text-sm">Total de Clientes</p>
            </div>
          </div>
        </Card>

        <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-goat-gray-400 text-sm">Estados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6 border-b border-goat-gray-700">
          <h3 className="text-lg font-semibold text-white">Lista de Clientes</h3>
        </div>

        <div className="divide-y divide-goat-gray-700">
          {clients.map((client) => (
            <div key={client.id} className="p-6 hover:bg-goat-gray-900/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Company name and tags */}
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-lg font-semibold text-white">{client.company}</h4>
                    <div className="flex gap-2">
                      {client.tags.map((tag, index) => (
                        <Badge key={index} className={`text-xs ${getTagColor(tag)}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Client details in organized grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-goat-purple" />
                        </div>
                        <div className="flex-1">
                          <span className="text-goat-gray-400 text-sm block">CNPJ:</span>
                          <span className="text-white font-medium">{client.cnpj}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-goat-purple" />
                        </div>
                        <div className="flex-1">
                          <span className="text-goat-gray-400 text-sm block">Responsável:</span>
                          <span className="text-white font-medium">{client.responsible}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-goat-purple" />
                        </div>
                        <div className="flex-1">
                          <span className="text-goat-gray-400 text-sm block">Telefone:</span>
                          <span className="text-white font-medium">{client.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-goat-purple" />
                        </div>
                        <div className="flex-1">
                          <span className="text-goat-gray-400 text-sm block">Email:</span>
                          <span className="text-white font-medium">{client.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-goat-purple" />
                        </div>
                        <div className="flex-1">
                          <span className="text-goat-gray-400 text-sm block">Fim do contrato:</span>
                          <span className="text-white font-medium">{new Date(client.contractEnd).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-goat-purple" />
                        </div>
                        <div className="flex-1">
                          <span className="text-goat-gray-400 text-sm block">Localização:</span>
                          <span className="text-white font-medium">{client.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment day section */}
                  <div className="mt-4 pt-4 border-t border-goat-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-goat-purple" />
                      </div>
                      <div className="flex-1">
                        <span className="text-goat-gray-400 text-sm">Dia de pagamento: </span>
                        <span className="text-white font-semibold">Todo dia {client.paymentDay}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  <Button variant="outline" size="sm" className="text-white border-goat-gray-600 hover:bg-goat-gray-700 min-w-[80px]">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400 border-red-800 hover:bg-red-900/20 min-w-[80px]">
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
