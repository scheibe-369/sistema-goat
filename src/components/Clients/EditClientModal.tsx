
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

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

interface EditClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (clientData: any) => void;
}

export function EditClientModal({ isOpen, client, onClose, onSave }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    company: "",
    cnpj: "",
    responsible: "",
    phone: "",
    email: "",
    plan: "Standard",
    contractEnd: "",
    startDate: "",
    paymentDay: 1,
    address: "",
    tags: ["Ativo"]
  });

  useEffect(() => {
    if (client) {
      setFormData({
        company: client.company,
        cnpj: client.cnpj,
        responsible: client.responsible,
        phone: client.phone,
        email: client.email,
        plan: client.plan || "Standard",
        contractEnd: client.contractEnd,
        startDate: client.startDate || "",
        paymentDay: client.paymentDay,
        address: client.address,
        tags: client.tags
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white">Nome da Empresa *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-white">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible" className="text-white">Responsável *</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => handleChange("responsible", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
                placeholder="+55 11 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan" className="text-white">Plano</Label>
              <select
                id="plan"
                value={formData.plan}
                onChange={(e) => handleChange("plan", e.target.value)}
                className="w-full px-3 py-2 bg-goat-gray-900 border border-goat-gray-600 text-white rounded-md"
              >
                <option value="Premium">Premium</option>
                <option value="Gold">Gold</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-white">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractEnd" className="text-white">Fim do Contrato</Label>
              <Input
                id="contractEnd"
                type="date"
                value={formData.contractEnd}
                onChange={(e) => handleChange("contractEnd", e.target.value)}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDay" className="text-white">Dia de Pagamento</Label>
              <Input
                id="paymentDay"
                type="number"
                min="1"
                max="31"
                value={formData.paymentDay}
                onChange={(e) => handleChange("paymentDay", parseInt(e.target.value))}
                className="bg-goat-gray-900 border-goat-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <select
                id="status"
                value={formData.tags[0]}
                onChange={(e) => handleChange("tags", [e.target.value, formData.plan])}
                className="w-full px-3 py-2 bg-goat-gray-900 border border-goat-gray-600 text-white rounded-md"
              >
                <option value="Ativo">Ativo</option>
                <option value="A vencer">A vencer</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="bg-goat-gray-900 border-goat-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="btn-primary flex-1">
              Salvar Alterações
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-goat-gray-600 text-white hover:bg-goat-gray-700"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
