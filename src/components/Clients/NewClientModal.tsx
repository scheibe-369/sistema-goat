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
import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { usePlansContext } from "@/contexts/PlansContext";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  onPlanColorChange?: (planName: string, color: string) => void;
  planColors?: Record<string, string>;
}

export function NewClientModal({
  isOpen,
  onClose,
  onSave,
  onPlanColorChange,
  planColors = {}
}: NewClientModalProps) {
  const { getPlanNames, createPlan, getPlanByName } = usePlansContext();
  const planOptions = getPlanNames();

  const [formData, setFormData] = useState({
    company: "",
    cnpj: "",
    responsible: "",
    phone: "",
    email: "",
    plan: planOptions[0] || "Vendas",
    contractEnd: "",
    startDate: "",
    paymentDay: "1",
    monthlyValue: "0,00",
    address: "",
    tags: ["Ativo"],
  });

  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanColor, setNewPlanColor] = useState("bg-purple-600 text-white hover:bg-purple-700");
  const [showAddPlan, setShowAddPlan] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert monthlyValue from Brazilian format to number
    const monthlyValueNumber = parseFloat(formData.monthlyValue.replace(',', '.')) || 0;
    
    const clientData = {
      ...formData,
      monthlyValue: monthlyValueNumber,
      paymentDay: parseInt(formData.paymentDay) || 1,
    };
    
    onSave(clientData);
    setFormData({
      company: "",
      cnpj: "",
      responsible: "",
      phone: "",
      email: "",
      plan: planOptions[0] || "Vendas",
      contractEnd: "",
      startDate: "",
      paymentDay: "1",
      monthlyValue: "0,00",
      address: "",
      tags: ["Ativo"],
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMonthlyValueBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (value === '' || value === '0' || value === '0,') {
      handleChange("monthlyValue", "0,00");
      return;
    }
    
    if (!value.includes(',')) {
      value = value + ',00';
    } else {
      const parts = value.split(',');
      if (!parts[1] || parts[1] === '') {
        value = parts[0] + ',00';
      } else if (parts[1].length === 1) {
        value = parts[0] + ',' + parts[1] + '0';
      }
    }
    
    handleChange("monthlyValue", value);
  };

  const handleMonthlyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    value = value.replace(/[^\d,]/g, '');
    
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }
    
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    handleChange("monthlyValue", value);
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
    
    handleChange("paymentDay", value);
  };

  const handleAddCustomPlan = async () => {
    if (newPlanName.trim() && !planOptions.includes(newPlanName.trim())) {
      try {
        await createPlan({
          name: newPlanName.trim(),
          color: newPlanColor,
        });
        
        setFormData((prev) => ({ ...prev, plan: newPlanName.trim() }));
        
        setNewPlanName("");
        setNewPlanColor("bg-purple-600 text-white hover:bg-purple-700");
        setShowAddPlan(false);
      } catch (error) {
        console.error('Error creating plan:', error);
      }
    }
  };

  const getPlanColor = (planName: string) => {
    const plan = getPlanByName(planName);
    return plan?.color || 'bg-purple-600 text-white hover:bg-purple-700';
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        className="relative bg-goat-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] border border-goat-gray-700 animate-scale-in"
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
              background: #6829c0;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #6B21D3;
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #6829c0 #404040;
            }
            
            /* Estilos customizados para dropdowns */
            .dropdown-trigger {
              background-color: #404040 !important;
              border-color: #525252 !important;
              color: white !important;
            }
            
            .dropdown-trigger:hover {
              background-color: #404040 !important;
              color: white !important;
            }
            
            .dropdown-content {
              background-color: #404040 !important;
              border-color: #525252 !important;
              min-width: var(--radix-dropdown-menu-trigger-width) !important;
              width: var(--radix-dropdown-menu-trigger-width) !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
              position: relative !important;
              left: 0 !important;
              right: auto !important;
              margin: 4px 0 0 0 !important;
              transform: none !important;
            }
            
            /* Força posicionamento absoluto correto */
            [data-radix-dropdown-menu-content] {
              position: absolute !important;
              top: calc(100% + 4px) !important;
              left: 0 !important;
              right: auto !important;
              transform: none !important;
              margin: 0 !important;
            }
            
            /* Seletor mais específico para sobrescrever estilos inline */
            div[data-radix-dropdown-menu-content][data-state="open"] {
              left: 0 !important;
              transform: translateX(0px) translateY(0px) !important;
            }
            
            .dropdown-item {
              color: white !important;
              background-color: transparent !important;
            }
            
            .dropdown-item:hover {
              background-color: #525252 !important;
            }
            
            /* Remove o overlay preto do Radix UI */
            [data-radix-popper-content-wrapper] {
              background: transparent !important;
            }
            
            /* Remove overlay adicional se existir */
            .radix-dropdown-overlay {
              display: none !important;
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
                      className="bg-goat-purple/20 hover:bg-goat-purple/30 text-white border-goat-purple/50 h-6 px-2 text-xs"
                      onClick={() => setShowAddPlan(!showAddPlan)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> <span className="text-white">Novo</span>
                    </Button>
                  </Label>

                  {showAddPlan && (
                    <div className="space-y-4 p-4 rounded-lg border border-[#404040]" style={{ backgroundColor: '#262626' }}>
                      <div className="space-y-2">
                        <Input
                          value={newPlanName}
                          onChange={(e) => setNewPlanName(e.target.value)}
                          placeholder="Nome do novo plano"
                          className="bg-goat-gray-700 border-goat-gray-600 text-white text-sm focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCustomPlan()}
                        />
                      </div>
                      
                      <ColorPicker
                        selectedColor={newPlanColor}
                        onColorChange={setNewPlanColor}
                        label="Cor do Plano"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCustomPlan}
                          className="bg-goat-purple hover:bg-goat-purple/80 text-white flex-1"
                        >
                          Adicionar Plano
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setShowAddPlan(false)}
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="dropdown-trigger w-full justify-between"
                      >
                        {formData.plan}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dropdown-content">
                      {planOptions.map((plan) => (
                        <DropdownMenuItem
                          key={plan}
                          onClick={() => handleChange("plan", plan)}
                          className="dropdown-item cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{plan}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyValue" className="text-white">Valor Mensal (R$)</Label>
                  <Input
                    id="monthlyValue"
                    type="text"
                    value={formData.monthlyValue}
                    onChange={handleMonthlyValueChange}
                    onBlur={handleMonthlyValueBlur}
                    onFocus={(e) => {
                      if (e.target.value === "0,00") {
                        e.target.value = "";
                        setFormData((prev) => ({ ...prev, monthlyValue: "" }));
                      }
                    }}
                    className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDay" className="text-white">Dia de Pagamento</Label>
                  <Input
                    id="paymentDay"
                    type="text"
                    value={formData.paymentDay}
                    onChange={handlePaymentDayChange}
                    onFocus={e => {
                      if (e.target.value) {
                        e.target.value = '';
                        setFormData(prev => ({ ...prev, paymentDay: '' }));
                      }
                    }}
                    className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                    placeholder="1-31"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="dropdown-trigger w-full justify-between"
                      >
                        {formData.tags[0]}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dropdown-content">
                      <DropdownMenuItem
                        onClick={() => handleChange("tags", ["Ativo"])}
                        className="dropdown-item cursor-pointer"
                      >
                        Ativo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChange("tags", ["A vencer"])}
                        className="dropdown-item cursor-pointer"
                      >
                        A vencer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChange("tags", ["Vencido"])}
                        className="dropdown-item cursor-pointer"
                      >
                        Vencido
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
  );
}
