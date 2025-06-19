
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

interface FilterState {
  status: string[];
  plan: string[];
  contractPeriod: { start: string; end: string };
  location: string;
}

interface ClientFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function ClientFilters({ isOpen, onClose, filters, onFiltersChange }: ClientFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const statusOptions = ["Ativo", "A vencer", "Vencido"];
  const planOptions = ["Premium", "Gold", "Standard"];

  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handlePlanChange = (plan: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      plan: checked 
        ? [...prev.plan, plan]
        : prev.plan.filter(p => p !== plan)
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      status: [],
      plan: [],
      contractPeriod: { start: "", end: "" },
      location: ""
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-goat-gray-800 border-goat-gray-700 text-white w-96 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-white">Filtros</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label className="text-white font-medium">Nome da Empresa</Label>
            <Input
              placeholder="Buscar por nome..."
              value={localFilters.location}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
              className="bg-goat-gray-900 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
            />
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Status</Label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={localFilters.status.includes(status)}
                    onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                    className="border-goat-gray-600"
                  />
                  <Label 
                    htmlFor={`status-${status}`} 
                    className="text-white text-sm cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tipo de Plano */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Tipo de Plano</Label>
            <div className="space-y-2">
              {planOptions.map((plan) => (
                <div key={plan} className="flex items-center space-x-2">
                  <Checkbox
                    id={`plan-${plan}`}
                    checked={localFilters.plan.includes(plan)}
                    onCheckedChange={(checked) => handlePlanChange(plan, checked as boolean)}
                    className="border-goat-gray-600"
                  />
                  <Label 
                    htmlFor={`plan-${plan}`} 
                    className="text-white text-sm cursor-pointer"
                  >
                    {plan}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Período do Fim de Contrato */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Período do Fim de Contrato</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-goat-gray-400 text-xs">De</Label>
                <Input
                  type="date"
                  value={localFilters.contractPeriod.start}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    contractPeriod: { ...prev.contractPeriod, start: e.target.value }
                  }))}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-goat-gray-400 text-xs">Até</Label>
                <Input
                  type="date"
                  value={localFilters.contractPeriod.end}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    contractPeriod: { ...prev.contractPeriod, end: e.target.value }
                  }))}
                  className="bg-goat-gray-900 border-goat-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label className="text-white font-medium">Cidade/Localização</Label>
            <Input
              placeholder="Ex: São Paulo, SP"
              value={localFilters.location}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
              className="bg-goat-gray-900 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-goat-gray-700">
          <Button onClick={handleApplyFilters} className="btn-primary flex-1">
            Aplicar Filtros
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="flex-1 border-goat-gray-600 text-white hover:bg-goat-gray-700"
          >
            Limpar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
