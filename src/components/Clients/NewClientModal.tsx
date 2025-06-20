import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      {/* ✅ BACKDROP COM BLUR TRANSPARENTE */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
      )}

      <DialogContent className="bg-goat-gray-900 border border-goat-gray-700 text-white max-w-4xl max-h-[90vh] animate-scale-in duration-300 shadow-2xl z-50 custom-scrollbar rounded-xl relative">
        <DialogHeader className="relative border-b border-goat-gray-700 pb-4">
          <DialogTitle className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Novo Cliente
          </DialogTitle>
          <p className="text-goat-gray-400">Preencha os dados do novo cliente</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seções de formulário */}
            {/* Informações Básicas */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: "company", label: "Nome da Empresa *", placeholder: "Ex: Tech Solutions LTDA" },
                  { id: "cnpj", label: "CNPJ *", placeholder: "00.000.000/0000-00" },
                  { id: "responsible", label: "Responsável *", placeholder: "Nome do responsável" },
                  { id: "phone", label: "Telefone *", placeholder: "+55 11 99999-9999" },
                  { id: "email", label: "E-mail *", placeholder: "contato@empresa.com", colSpan: 2 }
                ].map((field, idx) => (
                  <div key={idx} className={`space-y-2 ${field.colSpan === 2 ? "md:col-span-2" : ""}`}>
                    <Label htmlFor={field.id} className="text-white font-medium">{field.label}</Label>
                    <Input
                      id={field.id}
                      type={field.id === "email" ? "email" : "text"}
                      value={(formData as any)[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required
                      className="bg-goat-gray-800 border-goat-gray-600 text-white focus:border-goat-purple transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Plano e Valores */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                Plano e Valores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center justify-between">
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
                        className="bg-goat-gray-800 border-goat-gray-600 text-white text-sm"
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

                  <Select value={formData.plan} onValueChange={(value) => handleChange("plan", value)}>
                    <SelectTrigger className="bg-goat-gray-800 border-goat-gray-600 text-white">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent className="bg-goat-gray-800 border-goat-gray-600">
                      {allPlans.map(plan => (
                        <SelectItem key={plan} value={plan} className="text-white hover:bg-goat-gray-700">
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyValue" className="text-white font-medium">Valor Mensal (R$)</Label>
                  <Input
                    id="monthlyValue"
                    type="number"
                    step="0.01"
                    value={formData.monthlyValue}
                    onChange={(e) => handleChange("monthlyValue", e.target.value)}
                    placeholder="0,00"
                    className="bg-goat-gray-800 border-goat-gray-600 text-white"
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
                    className="bg-goat-gray-800 border-goat-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Status</Label>
                  <Select value={formData.tags[0]} onValueChange={(value) => handleChange("tags", [value])}>
                    <SelectTrigger className="bg-goat-gray-800 border-goat-gray-600 text-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-goat-gray-800 border-goat-gray-600">
                      {["Ativo", "A vencer", "Vencido"].map(status => (
                        <SelectItem key={status} value={status} className="text-white hover:bg-goat-gray-700">
                          {status}
                        </SelectItem>
                      ))}
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
                {[
                  { id: "startDate", label: "Data de Início", type: "date" },
                  { id: "contractEnd", label: "Fim do Contrato", type: "date" }
                ].map((field, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label htmlFor={field.id} className="text-white font-medium">{field.label}</Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      value={(formData as any)[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="bg-goat-gray-800 border-goat-gray-600 text-white"
                    />
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-white font-medium">Endereço</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="bg-goat-gray-800 border-goat-gray-600 text-white resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t border-goat-gray-700 sticky bottom-0 bg-goat-gray-900 pb-2">
              <Button type="submit" className="btn-primary flex-1 h-12 text-lg font-semibold">
                Salvar Cliente
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 text-lg border-goat-gray-600 text-white hover:bg-goat-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
