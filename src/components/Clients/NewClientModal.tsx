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
    onClose();
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
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-4xl max-h-[90vh] animate-scale-in duration-300 shadow-2xl z-50 overflow-hidden rounded-xl">
          <DialogHeader className="border-b border-goat-gray-700 pb-4">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Plus className="w-5 h-5 text-goat-purple" />
              Novo Cliente
            </DialogTitle>
            <p className="text-goat-gray-400">Preencha os dados para adicionar um novo cliente</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2 space-y-6 custom-scrollbar">
            {/* Dados principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white">Nome da Empresa *</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  required
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple"
                />
              </div>
              <div>
                <Label className="text-white">CNPJ *</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  required
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple"
                />
              </div>

              <div>
                <Label className="text-white">Responsável *</Label>
                <Input
                  value={formData.responsible}
                  onChange={(e) => handleChange("responsible", e.target.value)}
                  required
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple"
                />
              </div>
              <div>
                <Label className="text-white">Telefone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple"
                />
              </div>
            </div>

            {/* Plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white flex items-center justify-between">
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
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      placeholder="Novo plano"
                      className="bg-goat-gray-700 border-goat-gray-600 text-white text-sm"
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
                  <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                    <SelectValue placeholder="Selecione o plano" />
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

              <div>
                <Label className="text-white">Valor Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthlyValue}
                  onChange={(e) => handleChange("monthlyValue", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white"
                />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white">Data de Início</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Fim do Contrato</Label>
                <Input
                  type="date"
                  value={formData.contractEnd}
                  onChange={(e) => handleChange("contractEnd", e.target.value)}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Dia de Pagamento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDay}
                  onChange={(e) => handleChange("paymentDay", parseInt(e.target.value))}
                  className="bg-goat-gray-700 border-goat-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Status</Label>
                <Select value={formData.tags[0]} onValueChange={(value) => handleChange("tags", [value, formData.plan])}>
                  <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-goat-gray-800 border-goat-gray-600">
                    <SelectItem value="Ativo" className="text-white">Ativo</SelectItem>
                    <SelectItem value="A vencer" className="text-white">A vencer</SelectItem>
                    <SelectItem value="Vencido" className="text-white">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <Label className="text-white">Endereço</Label>
              <Textarea
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-goat-gray-700 border-goat-gray-600 text-white resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t border-goat-gray-700">
              <Button type="submit" className="btn-primary flex-1 h-12 text-lg">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
