
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";
import { usePlansContext } from "@/contexts/PlansContext";
import ReactDOM from "react-dom";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

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
  const { getPlanNames, isLoading: plansLoading } = usePlansContext();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const statusOptions = ["Ativo", "A vencer", "Vencido"];
  const planOptions = getPlanNames();

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

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Custom Overlay with blur */}
      <div
        style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed', zIndex: 999999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Filters Panel - Slide from right */}
      <div className="fixed inset-y-0 right-0 z-[1000000] w-full max-w-md animate-slide-in-right">
        <div
          className="h-full bg-goat-gray-800 shadow-2xl border-l border-goat-gray-700 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-goat-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Filtros</h2>
                <p className="text-goat-gray-400 text-sm">Filtre os clientes conforme necessário</p>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar">
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

              /* Animações */
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes slide-in-right {
                from { 
                  transform: translateX(100%); 
                  opacity: 0;
                }
                to { 
                  transform: translateX(0); 
                  opacity: 1;
                }
              }

              .animate-fade-in {
                animation: fade-in 0.2s ease-out;
              }

              .animate-slide-in-right {
                animation: slide-in-right 0.3s ease-out;
              }
            `}</style>

            <div className="p-6 space-y-8">
              {/* Nome da Empresa */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Empresa
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    placeholder="Buscar por nome..."
                    value={localFilters.location}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Status
                </h3>

                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-3">
                      <Checkbox
                        id={`status-${status}`}
                        checked={localFilters.status.includes(status)}
                        onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                        className="border-goat-gray-600 data-[state=checked]:bg-goat-purple data-[state=checked]:border-goat-purple"
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="text-white cursor-pointer hover:text-goat-purple transition-colors"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipo de Plano */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Tipo de Plano
                </h3>

                {plansLoading ? (
                  <div className="text-white/70">Carregando planos...</div>
                ) : (
                  <div className="space-y-3">
                    {planOptions.map((plan) => (
                      <div key={plan} className="flex items-center space-x-3">
                        <Checkbox
                          id={`plan-${plan}`}
                          checked={localFilters.plan.includes(plan)}
                          onCheckedChange={(checked) => handlePlanChange(plan, checked as boolean)}
                          className="border-goat-gray-600 data-[state=checked]:bg-goat-purple data-[state=checked]:border-goat-purple"
                        />
                        <Label
                          htmlFor={`plan-${plan}`}
                          className="text-white cursor-pointer hover:text-goat-purple transition-colors"
                        >
                          {plan}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Período do Fim de Contrato */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Período do Fim de Contrato
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">De</Label>
                    <DatePicker
                      date={localFilters.contractPeriod.start ? parseISO(localFilters.contractPeriod.start) : undefined}
                      setDate={(newDate) => {
                        if (newDate) {
                          setLocalFilters(prev => ({
                            ...prev,
                            contractPeriod: { ...prev.contractPeriod, start: format(newDate, "yyyy-MM-dd") }
                          }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Até</Label>
                    <DatePicker
                      date={localFilters.contractPeriod.end ? parseISO(localFilters.contractPeriod.end) : undefined}
                      setDate={(newDate) => {
                        if (newDate) {
                          setLocalFilters(prev => ({
                            ...prev,
                            contractPeriod: { ...prev.contractPeriod, end: format(newDate, "yyyy-MM-dd") }
                          }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Cidade/Localização */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-goat-gray-700 pb-2">
                  Cidade/Localização
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">Cidade/Localização</Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo, SP"
                    value={localFilters.location}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-goat-gray-700 border-goat-gray-600 text-white focus:border-goat-purple focus:ring-goat-purple/20 placeholder:text-white/70"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="p-6 border-t border-goat-gray-700">
            <div className="flex gap-4">
              <Button
                onClick={handleApplyFilters}
                className="btn-primary flex-1 h-12 text-lg font-semibold"
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={handleClearFilters}
                className="flex-1 h-12 text-lg font-semibold bg-goat-gray-600 hover:bg-goat-gray-500 text-white border-0 transition-colors duration-200"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
