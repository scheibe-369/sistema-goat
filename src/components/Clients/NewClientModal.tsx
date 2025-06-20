
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, X } from "lucide-react";

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
}

export function NewClientModal({ isOpen, onClose, onSave }: NewClientModalProps) {
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
    monthlyValue: "",
    address: "",
    tags: ["Ativo"]
  });

  const [customPlans, setCustomPlans] = useState<string[]>([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [showAddPlan, setShowAddPlan] = useState(false);

  const defaultPlans = ["Vendas", "Branding", "Automação", "Premium", "Gold", "Standard"];
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
      monthlyValue: "",
      address: "",
      tags: ["Ativo"]
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCustomPlan = () => {
    if (newPlanName.trim() && !allPlans.includes(newPlanName.trim())) {
      setCustomPlans(prev => [...prev, newPlanName.trim()]);
      setFormData(prev => ({ ...prev, plan: newPlanName.trim() }));
      setNewPlanName("");
      setShowAddPlan(false);
    }
  };

  const handleRemoveCustomPlan = (planToRemove: string) => {
    setCustomPlans(prev => prev.filter(plan => plan !== planToRemove));
    if (formData.plan === planToRemove) {
      setFormData(prev => ({ ...prev, plan: "Vendas" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-3xl max-h-[95vh] overflow-y-auto animate-scale-in duration-300 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-goat-purple/5 to-transparent pointer-events-none" />
        
        <DialogHeader className="relative">
          <DialogTitle className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Novo Cliente
          </DialogTitle>
          <p className="text-goat-gray-400">Preencha os dados do novo cliente</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 relative">
          {/* Informações Básicas */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white font-medium">Nome da Empresa *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  placeholder="Ex: Tech Solutions LTDA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-white font-medium">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible" className="text-white font-medium">Responsável *</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleChange("responsible", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-medium">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  placeholder="+55 11 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-white font-medium">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  placeholder="contato@empresa.com"
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
                <Label htmlFor="plan" className="text-white font-medium flex items-center justify-between">
                  Plano
                  <Button
                    type="button"
                    size="sm"
                    className="bg-goat-purple/20 hover:bg-goat-purple/30 text-goat-purple border-goat-purple/50 h-6 px-2 text-xs"
                    onClick={() => setShowAddPlan(!showAddPlan)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Novo
                  </Button>
                </Label>
                
                {showAddPlan && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      placeholder="Nome do novo plano"
                      className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPlan()}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomPlan}
                      className="bg-goat-purple hover:bg-goat-purple/80 px-3"
                    >
                      +
                    </Button>
                  </div>
                )}
                
                <select
                  id="plan"
                  value={formData.plan}
                  onChange={(e) => handleChange("plan", e.target.value)}
                  className="w-full px-3 py-2 bg-goat-gray-900 border border-goat-gray-600 text-white rounded-md focus:border-goat-purple transition-colors"
                >
                  {allPlans.map(plan => (
                    <option key={plan} value={plan}>
                      {plan}
                      {customPlans.includes(plan) && " (Personalizado)"}
                    </option>
                  ))}
                </select>
                
                {customPlans.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customPlans.map(plan => (
                      <span
                        key={plan}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-goat-purple/20 text-goat-purple rounded text-xs"
                      >
                        {plan}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomPlan(plan)}
                          className="hover:bg-goat-purple/30 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyValue" className="text-white font-medium">Valor Mensal (R$)</Label>
                <Input
                  id="monthlyValue"
                  type="number"
                  step="0.01"
                  value={formData.monthlyValue}
                  onChange={(e) => handleChange("monthlyValue", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDay" className="text-white font-medium">Dia de Pagamento</Label>
                <Input
                  id="paymentDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDay}
                  onChange={(e) => handleChange("paymentDay", parseInt(e.target.value))}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white font-medium">Status</Label>
                <select
                  id="status"
                  value={formData.tags[0]}
                  onChange={(e) => handleChange("tags", [e.target.value, formData.plan])}
                  className="w-full px-3 py-2 bg-goat-gray-900 border border-goat-gray-600 text-white rounded-md focus:border-goat-purple transition-colors"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="A vencer">A vencer</option>
                  <option value="Vencido">Vencido</option>
                </select>
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
                <Label htmlFor="startDate" className="text-white font-medium">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractEnd" className="text-white font-medium">Fim do Contrato</Label>
                <Input
                  id="contractEnd"
                  type="date"
                  value={formData.contractEnd}
                  onChange={(e) => handleChange("contractEnd", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-white font-medium">Endereço</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                  rows={3}
                  placeholder="Endereço completo do cliente"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-goat-gray-700">
            <Button type="submit" className="btn-primary flex-1 h-12 text-lg font-semibold">
              Salvar Cliente
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-lg border-goat-gray-600 text-white hover:bg-goat-gray-700 transition-colors"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
