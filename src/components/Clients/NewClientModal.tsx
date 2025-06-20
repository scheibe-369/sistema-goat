"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
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
    tags: ["Ativo"],
  });

  const [customPlans, setCustomPlans] = useState<string[]>([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [showAddPlan, setShowAddPlan] = useState(false);

  const defaultPlans = ["Vendas", "Branding", "Automação", "Premium", "Gold", "Standard"];
  const allPlans = [...defaultPlans, ...customPlans];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogContent className="relative bg-goat-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-goat-gray-700">
          <div className="flex justify-between items-center p-4 border-b border-goat-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-goat-purple flex items-center justify-center rounded">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Novo Cliente
            </h2>
            <Button size="icon" variant="ghost" className="text-goat-gray-400 hover:text-white" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-4">
            {/* Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Empresa *</Label>
                <Input placeholder="Ex: Tech Solutions LTDA" value={formData.company} onChange={(e) => handleChange("company", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input placeholder="00.000.000/0000-00" value={formData.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
              <div>
                <Label>Responsável *</Label>
                <Input placeholder="Nome do responsável" value={formData.responsible} onChange={(e) => handleChange("responsible", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input placeholder="(11) 99999-9999" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
              <div className="md:col-span-2">
                <Label>E-mail *</Label>
                <Input placeholder="cliente@empresa.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
            </div>

            {/* Plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex justify-between">
                  Plano
                  <Button size="sm" className="bg-goat-purple text-white hover:bg-purple-700 h-6 px-2 text-xs" onClick={() => setShowAddPlan(!showAddPlan)} type="button">
                    <Plus className="w-3 h-3 mr-1" /> Novo
                  </Button>
                </Label>

                {showAddPlan && (
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Nome do novo plano" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="bg-goat-gray-700 text-white placeholder-white text-sm" />
                    <Button size="sm" onClick={handleAddCustomPlan} className="bg-goat-purple hover:bg-purple-700 px-2">
                      +
                    </Button>
                  </div>
                )}

                <Select value={formData.plan} onValueChange={(value) => handleChange("plan", value)}>
                  <SelectTrigger className="bg-goat-gray-700 text-white hover:bg-goat-gray-600">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                    {allPlans.map((plan) => (
                      <SelectItem key={plan} value={plan} className="text-white hover:bg-goat-gray-600">
                        <div className="flex items-center justify-between w-full">
                          <span>{plan}</span>
                          {customPlans.includes(plan) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveCustomPlan(plan);
                              }}
                              className="bg-red-700 text-red-300 hover:bg-red-800 rounded-full w-5 h-5 flex items-center justify-center ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valor Mensal (R$)</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={formData.monthlyValue} onChange={(e) => handleChange("monthlyValue", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>

              <div>
                <Label>Dia de Pagamento</Label>
                <Input type="number" min="1" max="31" value={formData.paymentDay} onChange={(e) => handleChange("paymentDay", parseInt(e.target.value))} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.tags[0]} onValueChange={(value) => handleChange("tags", [value, formData.plan])}>
                  <SelectTrigger className="bg-goat-gray-700 text-white hover:bg-goat-gray-600">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                    <SelectItem value="Ativo" className="text-white hover:bg-goat-gray-600">Ativo</SelectItem>
                    <SelectItem value="A vencer" className="text-white hover:bg-goat-gray-600">A vencer</SelectItem>
                    <SelectItem value="Vencido" className="text-white hover:bg-goat-gray-600">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Datas e Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
              <div>
                <Label>Fim do Contrato</Label>
                <Input type="date" value={formData.contractEnd} onChange={(e) => handleChange("contractEnd", e.target.value)} className="bg-goat-gray-700 text-white placeholder-white" />
              </div>
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <Textarea value={formData.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Endereço completo do cliente" className="bg-goat-gray-700 text-white placeholder-white resize-none" rows={3} />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t border-goat-gray-700">
              <Button type="submit" className="btn-primary flex-1 h-12 text-lg font-semibold">
                Salvar Cliente
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 text-lg border border-red-800 text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </div>
    </>
  );
}
