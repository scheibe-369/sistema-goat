
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

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
  monthlyValue?: string;
}

interface ClientData {
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
  monthlyValue?: number;
}

interface EditClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (clientData: ClientData) => void;
  onPlanColorChange: (planName: string, color: string) => void;
  planColors: Record<string, string>;
}

export function EditClientModal({
  isOpen,
  client,
  onClose,
  onSave,
  onPlanColorChange,
  planColors,
}: EditClientModalProps) {
  const [formData, setFormData] = useState<Client>({
    id: "",
    company: "",
    cnpj: "",
    responsible: "",
    phone: "",
    email: "",
    contractEnd: "",
    paymentDay: 1,
    tags: ["Ativo"],
    address: "",
    plan: "Vendas",
    startDate: "",
    monthlyValue: "0,00",
  });

  const planOptions = [
    "Vendas",
    "Branding", 
    "Landing Page",
    "Automação"
  ];

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert monthlyValue from string to number for the callback
    const monthlyValueNumber = parseFloat(formData.monthlyValue?.replace(',', '.') || '0');
    
    const clientData: ClientData = {
      company: formData.company,
      cnpj: formData.cnpj,
      responsible: formData.responsible,
      phone: formData.phone,
      email: formData.email,
      contractEnd: formData.contractEnd,
      paymentDay: formData.paymentDay,
      tags: formData.tags,
      address: formData.address,
      plan: formData.plan,
      startDate: formData.startDate,
      monthlyValue: monthlyValueNumber,
    };
    
    onSave(clientData);
  };

  const handleChange = (field: keyof Client, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    value = value.replace(/\D/g, '');
    
    const numValue = parseInt(value);
    
    if (numValue > 31) {
      value = '31';
    } else if (numValue < 1 && value !== '') {
      value = '1';
    }
    
    handleChange("paymentDay", value === '' ? 1 : parseInt(value));
  };

  if (!isOpen || !client) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        className="relative bg-goat-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-goat-gray-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scale-in {
            from { 
              transform: scale(0.95);
              opacity: 0;
            }
            to { 
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-goat-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Editar Cliente</h2>
            <p className="text-goat-gray-400 text-sm">Atualize os dados do cliente</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content with Custom Scrollbar */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Nome da Empresa *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-white">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible" className="text-white">Responsável *</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleChange("responsible", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-white">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan" className="text-white">Plano</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-goat-gray-700 border-goat-gray-600 text-white hover:bg-goat-gray-600"
                    >
                      {formData.plan || "Selecione um plano"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-goat-gray-700 border-goat-gray-600">
                    {planOptions.map((plan) => (
                      <DropdownMenuItem
                        key={plan}
                        onClick={() => handleChange("plan", plan)}
                        className="text-white hover:bg-goat-gray-600 cursor-pointer"
                      >
                        {plan}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyValue" className="text-white">Valor Mensal (R$)</Label>
                <Input
                  id="monthlyValue"
                  value={formData.monthlyValue || "0,00"}
                  onChange={(e) => handleChange("monthlyValue", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-white">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractEnd" className="text-white">Fim do Contrato</Label>
                <Input
                  id="contractEnd"
                  type="date"
                  value={formData.contractEnd}
                  onChange={(e) => handleChange("contractEnd", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDay" className="text-white">Dia de Pagamento</Label>
                <Input
                  id="paymentDay"
                  type="text"
                  value={formData.paymentDay.toString()}
                  onChange={handlePaymentDayChange}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                  placeholder="1-31"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-white">Endereço</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white resize-none focus:border-goat-purple focus:ring-goat-purple/20"
                  rows={3}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t border-goat-gray-700">
              <Button
                type="submit"
                className="btn-primary flex-1 h-12 text-lg font-semibold"
              >
                Salvar Alterações
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white border-0 transition-colors duration-200"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
