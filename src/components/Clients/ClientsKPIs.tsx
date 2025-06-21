
import { Card } from "@/components/ui/card";
import { Building2, Calendar, UserX } from "lucide-react";

interface Client {
  id: number;
  company: string;
  cnpj: string;
  responsible: string;
  phone: string;
  email: string;
  contractEnd: string;
  paymentDay: number;
  tags: string[];
  address: string;
  plan?: string;
  startDate?: string;
}

interface ClientsKPIsProps {
  clients: Client[];
}

export function ClientsKPIs({ clients }: ClientsKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-goat-purple/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-goat-purple" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{clients.length}</p>
            <p className="text-goat-gray-400 text-sm">Total de Clientes</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {clients.filter(c => c.tags.includes("Ativo")).length}
            </p>
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
            <p className="text-2xl font-bold text-white">
              {clients.filter(c => c.tags.includes("A vencer")).length}
            </p>
            <p className="text-goat-gray-400 text-sm">Contratos A Vencer</p>
          </div>
        </div>
      </Card>

      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
            <UserX className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {clients.filter(c => c.tags.includes("Vencido")).length}
            </p>
            <p className="text-goat-gray-400 text-sm">Clientes Inativos</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
