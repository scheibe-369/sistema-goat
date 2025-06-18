
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, Edit, Trash2, Building, User, Calendar } from "lucide-react";

export default function Clients() {
  const clients = [
    {
      id: 1,
      company: "Tech Solutions LTDA",
      cnpj: "12.345.678/0001-90",
      responsible: "João Silva",
      phone: "+55 11 99999-9999",
      contractEnd: "2024-12-31",
      paymentDay: 15,
      tags: ["Tecnologia", "Premium"],
      status: "Ativo"
    },
    {
      id: 2,
      company: "Marketing Digital Pro",
      cnpj: "98.765.432/0001-10",
      responsible: "Maria Santos",
      phone: "+55 11 88888-8888",
      contractEnd: "2024-08-15",
      paymentDay: 10,
      tags: ["Marketing", "Mensal"],
      status: "A vencer"
    },
    {
      id: 3,
      company: "Consultoria ABC",
      cnpj: "11.222.333/0001-44",
      responsible: "Pedro Costa",
      phone: "+55 11 77777-7777",
      contractEnd: "2023-12-31",
      paymentDay: 5,
      tags: ["Consultoria"],
      status: "Vencido"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500";
      case "A vencer":
        return "bg-yellow-500";
      case "Vencido":
        return "bg-red-500";
      default:
        return "bg-goat-gray-500";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-goat-gray-400">Gestão central de clientes</p>
        </div>
        <Button className="bg-goat-purple hover:bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
          <Input 
            placeholder="Buscar por empresa, CNPJ ou responsável..." 
            className="pl-10 bg-goat-gray-800 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-goat-gray-600 text-white hover:bg-goat-gray-800">
            Todos
          </Button>
          <Button variant="outline" className="border-goat-gray-600 text-white hover:bg-goat-gray-800">
            Ativos
          </Button>
          <Button variant="outline" className="border-goat-gray-600 text-white hover:bg-goat-gray-800">
            A vencer
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-goat-gray-400 text-sm">Clientes Ativos</p>
              <p className="text-xl font-bold text-white">18</p>
            </div>
          </div>
        </Card>
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-goat-gray-400 text-sm">A Vencer (30 dias)</p>
              <p className="text-xl font-bold text-white">3</p>
            </div>
          </div>
        </Card>
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-goat-gray-400 text-sm">Contratos Vencidos</p>
              <p className="text-xl font-bold text-white">2</p>
            </div>
          </div>
        </Card>
        <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-goat-purple/20 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-goat-purple" />
            </div>
            <div>
              <p className="text-goat-gray-400 text-sm">Total de Clientes</p>
              <p className="text-xl font-bold text-white">23</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card className="bg-goat-gray-800 border-goat-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-goat-purple" />
            <h3 className="text-lg font-semibold text-white">Lista de Clientes</h3>
          </div>
          
          <div className="space-y-4">
            {clients.map((client) => (
              <div 
                key={client.id}
                className="p-4 rounded-lg bg-goat-gray-900/50 border border-goat-gray-700 hover:border-goat-purple/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{client.company}</h4>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-goat-gray-400">CNPJ</p>
                        <p className="text-white">{client.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-goat-gray-400">Responsável</p>
                        <p className="text-white flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {client.responsible}
                        </p>
                      </div>
                      <div>
                        <p className="text-goat-gray-400">Telefone</p>
                        <p className="text-white">{client.phone}</p>
                      </div>
                      <div>
                        <p className="text-goat-gray-400">Fim do Contrato</p>
                        <p className="text-white">{client.contractEnd}</p>
                      </div>
                      <div>
                        <p className="text-goat-gray-400">Dia de Pagamento</p>
                        <p className="text-white">Todo dia {client.paymentDay}</p>
                      </div>
                      <div>
                        <p className="text-goat-gray-400">Tags</p>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {client.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-goat-gray-700 text-goat-gray-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="border-goat-gray-600 text-white hover:bg-goat-gray-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
