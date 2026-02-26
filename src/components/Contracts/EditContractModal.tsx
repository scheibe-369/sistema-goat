
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateClient } from '@/hooks/useClients';
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

interface Contract {
  id: string;
  client: string;
  client_id: string;
  type: string;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expiring';
}

interface EditContractModalProps {
  isOpen: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSave: (contractData: Omit<Contract, 'id'>) => void;
}

export function EditContractModal({ isOpen, contract, onClose, onSave }: EditContractModalProps) {
  const [formData, setFormData] = useState({
    client: '',
    client_id: '',
    type: '',
    monthlyValue: 0,
    startDate: '',
    endDate: '',
    status: 'active' as Contract['status']
  });
  const updateClient = useUpdateClient();

  useEffect(() => {
    if (contract) {
      setFormData({
        client: contract.client,
        client_id: contract.client_id,
        type: contract.type,
        monthlyValue: contract.monthlyValue,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === 'inactive' && formData.client_id) {
      // Update client tags to reflect inactive status
      await updateClient.mutateAsync({
        id: formData.client_id,
        tags: ['Inativo']
      });
    }
    onSave(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Contrato</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-white">Cliente</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">Tipo de Serviço</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyValue" className="text-white">Valor Mensal (R$)</Label>
            <Input
              id="monthlyValue"
              type="number"
              value={formData.monthlyValue}
              onChange={(e) => handleInputChange('monthlyValue', parseFloat(e.target.value))}
              className="bg-goat-gray-700 border-goat-gray-600 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Data de Início</Label>
              <DatePicker
                date={formData.startDate ? parseISO(formData.startDate) : undefined}
                setDate={(newDate) => {
                  if (newDate) {
                    handleInputChange('startDate', format(newDate, "yyyy-MM-dd"));
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Data de Término</Label>
              <DatePicker
                date={formData.endDate ? parseISO(formData.endDate) : undefined}
                setDate={(newDate) => {
                  if (newDate) {
                    handleInputChange('endDate', format(newDate, "yyyy-MM-dd"));
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-white">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="bg-goat-gray-700 border-goat-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-700 border-goat-gray-600">
                <SelectItem value="active" className="text-white">Ativo</SelectItem>
                <SelectItem value="expiring" className="text-white">A vencer</SelectItem>
                <SelectItem value="inactive" className="text-white">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-goat-purple hover:bg-goat-purple/90 text-white"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
