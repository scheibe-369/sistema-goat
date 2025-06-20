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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, X, Check } from "lucide-react";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
}

export function NewClientModal({
  isOpen,
  onClose,
  onSave,
}: NewClientModalProps) {
  const [formData, setFormData] = useState({
    company: "",
    cnpj: "",
    responsible: "",
    phone: "",
    email: "",
    plan: "Vendas",
    contractEnd: "",
    startDate: "",
    paymentDay: 1,
    monthlyValue: "0,00", // Valor inicial já formatado
    address: "",
    tags: ["Ativo"],
  });

  const [customPlans, setCustomPlans] = useState<string[]>([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [showAddPlan, setShowAddPlan] = useState(false);

  const defaultPlans = [
    "Vendas",
    "Branding", 
    "Automação",
    "Premium",
    "Gold",
    "Standard",
  ];
  const allPlans = [...defaultPlans, ...customPlans];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      company: "",
      cnpj: "",
      responsible: "",
      phone: "",
      email: "",
      plan: "Vendas",
      contractEnd: "",
      startDate: "",
      paymentDay: 1,
      monthlyValue: "0,00", // Reset para valor formatado
      address: "",
      tags: ["Ativo"],
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Função para formatar valor quando o campo perde o foco
  const handleMonthlyValueBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (value === '' || value === '0' || value === '0,') {
      handleChange("monthlyValue", "0,00");
      return;
    }
    
    // Se não tem vírgula, adiciona ,00
    if (!value.includes(',')) {
      value = value + ',00';
    } else {
      // Se tem vírgula mas nenhum dígito depois, adiciona 00
      const parts = value.split(',');
      if (!parts[1] || parts[1] === '') {
        value = parts[0] + ',00';
      } else if (parts[1].length === 1) {
        // Se tem vírgula mas só um dígito depois, adiciona um zero
        value = parts[0] + ',' + parts[1] + '0';
      }
    }
    
    handleChange("monthlyValue", value);
  };

  // Função para lidar com mudanças no input de valor
  const handleMonthlyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove tudo que não é número ou vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Garante apenas uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita a 2 dígitos após a vírgula
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    handleChange("monthlyValue", value);
  };

  const handleAddCustomPlan = () => {
    if (newPlanName.trim() && !allPlans.includes(newPlanName.trim())) {
      setCustomPlans((prev) => [...prev, newPlanName.trim()]);
      setFormData((prev) => ({ ...prev, plan: newPlanName.trim() }));
      setNewPlanName("");
      setShowAddPlan(false);
    }
  };

  const handleRemoveCustomPlan = (planToRemove: string) => {
    setCustomPlans((prev) => prev.filter((plan) => plan !== planToRemove));
    if (formData.plan === planToRemove) {
      setFormData((prev) => ({ ...prev, plan: "Vendas" }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Custom Overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div 
          className="relative bg-goat-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] border border-goat-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-goat-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Novo Cliente</h2>
                <p className="text-goat-gray-400 text-sm">Preencha os dados do novo cliente</p>
              </div>
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
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #404040;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #5315CB;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6B21D3;
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #5315CB #404040;
              }
              /* Estilos customizados para Select */
              [data-radix-select-trigger] {
                background-color: #4B5563 !important;
              }
              [data-radix-select-content] {
                background-color: #4B5563 !important;
                border-color: #6B7280 !important;
              }
              [data-radix-select-item] {
                color: white !important;
              }
              [data-radix-select-item][data-highlighted] {
                background-color: #374151 !important;
                color: white !important;
              }
              [data-radix-select-item][data-state="checked"] {
                background-color: #374151 !important;
                color: white !important;
              }
              [data-radix-select-item][data-state="checked"] [data-radix-select-item-indicator] {
                color: white !important;
              }
              /* Remove o fundo amarelo do item selecionado */
              [data-radix-select-viewport] [data-radix-select-item][data-state="checked"] {
                background-color: #374151 !important;
              }
            `}</style>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Informações Básicas */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Informações Básicas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white">Nome da Empresa *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                      placeholder="Ex: Tech Solutions LTDA"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-white">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleChange("cnpj", e.target.value)}
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
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
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                      placeholder="Nome do responsável"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                      placeholder="(11) 99999-9999"
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
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                      placeholder="cliente@empresa.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Plano e Valores */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Plano e Valores
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex justify-between text-white">
                      Plano
                      <Button
                        type="button"
                        size="sm"
                        className="bg-goat-purple/20 hover:bg-goat-purple/30 text-goat-purple border-goat-purple/50 h-6 px-2 text-xs"
                        onClick={() => setShowAddPlan(!showAddPlan)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Novo
                      </Button>
                    </Label>

                    {showAddPlan && (
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newPlanName}
                          onChange={(e) => setNewPlanName(e.target.value)}
                          placeholder="Nome do novo plano"
                          className="bg-goat-gray-700 border-goat-gray-600 text-white text-sm focus:border-goat-purple placeholder:text-white/70"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCustomPlan()}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCustomPlan}
                          className="bg-goat-purple hover:bg-goat-purple/80 px-3 text-white"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    )}

                    <Select
                      value={formData.plan}
                      onValueChange={(value) => handleChange("plan", value)}
                    >
                      <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20">
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent className="bg-goat-gray-700 border-goat-gray-600 z-[60]">
                        {allPlans.map((plan) => (
                          <SelectItem
                            key={plan}
                            value={plan}
                            className="text-white hover:bg-goat-gray-600 focus:bg-goat-gray-600 data-[state=checked]:bg-goat-gray-600 cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-white">{plan}</span>
                              {customPlans.includes(plan) && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveCustomPlan(plan);
                                  }}
                                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 h-5 w-5 p-0 ml-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyValue" className="text-white">Valor Mensal (R$)</Label>
                    <Input
                      id="monthlyValue"
                      type="text"
                      value={formData.monthlyValue}
                      onChange={handleMonthlyValueChange}
                      onBlur={handleMonthlyValueBlur}
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                      placeholder="0,00"
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
                      onChange={(e) =>
                        handleChange("paymentDay", parseInt(e.target.value))
                      }
                      className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Status</Label>
                    <Select
                      value={formData.tags[0]}
                      onValueChange={(value) =>
                        handleChange("tags", [value, formData.plan])
                      }
                    >
                      <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent className="bg-goat-gray-700 border-goat-gray-600 z-[60]">
                        <SelectItem 
                          value="Ativo" 
                          className="text-white hover:bg-goat-gray-600 focus:bg-goat-gray-600 data-[state=checked]:bg-goat-gray-600 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {formData.tags[0] === "Ativo" && <Check className="w-4 h-4 text-white" />}
                            <span className="text-white">Ativo</span>
                          </div>
                        </SelectItem>
                        <SelectItem 
                          value="A vencer" 
                          className="text-white hover:bg-goat-gray-600 focus:bg-goat-gray-600 data-[state=checked]:bg-goat-gray-600 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {formData.tags[0] === "A vencer" && <Check className="w-4 h-4 text-white" />}
                            <span className="text-white">A vencer</span>
                          </div>
                        </SelectItem>
                        <SelectItem 
                          value="Vencido" 
                          className="text-white hover:bg-goat-gray-600 focus:bg-goat-gray-600 data-[state=checked]:bg-goat-gray-600 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {formData.tags[0] === "Vencido" && <Check className="w-4 h-4 text-white" />}
                            <span className="text-white">Vencido</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Datas e Localização */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Datas e Localização
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-white">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-white">Endereço</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="bg-goat-gray-700 border-goat-gray-600 text-white resize-none focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                      rows={3}
                      placeholder="Endereço completo do cliente"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6 border-t border-goat-gray-700">
                <Button
                  type="submit"
                  className="btn-primary flex-1 h-12 text-lg font-semibold"
                >
                  Salvar Cliente
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
    </>
  );
}