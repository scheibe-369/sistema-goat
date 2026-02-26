
import { Card } from "@/components/ui/card";
import { Building2, Calendar, UserX } from "lucide-react";

interface Client {
  id: string;
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
      <Card className="premium-card p-6 animate-premium-in [animation-delay:100ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">{clients.length}</p>
            <p className="text-goat-gray-400 text-sm font-medium">Total de Clientes</p>
          </div>
        </div>
      </Card>

      <Card className="premium-card p-6 animate-premium-in [animation-delay:200ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
            <Building2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {clients.filter(c => c.tags.includes("Ativo")).length}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Clientes Ativos</p>
          </div>
        </div>
      </Card>

      <Card className="premium-card p-6 animate-premium-in [animation-delay:300ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
            <Calendar className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {clients.filter(c => c.tags.includes("A vencer")).length}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Contratos A Vencer</p>
          </div>
        </div>
      </Card>

      <Card className="premium-card p-6 animate-premium-in [animation-delay:400ms]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <UserX className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {clients.filter(c => c.tags.includes("Inativo") || c.tags.includes("Vencido")).length}
            </p>
            <p className="text-goat-gray-400 text-sm font-medium">Clientes Inativos</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
