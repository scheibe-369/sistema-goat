
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Repeat } from "lucide-react";

interface RecurringExpenseModalProps {
  onAddExpense: (expense: any) => void;
}

export function RecurringExpenseModal({ onAddExpense }: RecurringExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    category: '',
    recurrence: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense = {
      id: Date.now(),
      description: formData.description,
      value: parseFloat(formData.value),
      category: formData.category,
      date: formData.startDate,
      status: 'Pendente',
      isRecurring: true,
      recurrence: formData.recurrence
    };

    onAddExpense(expense);
    setOpen(false);
    setFormData({
      description: '',
      value: '',
      category: '',
      recurrence: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
          <Repeat className="w-4 h-4 mr-2" />
          Despesa Recorrente
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Despesa Recorrente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-white">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-goat-gray-900 border-goat-gray-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="value" className="text-white">Valor</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              className="bg-goat-gray-900 border-goat-gray-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-white">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-goat-gray-900 border-goat-gray-600 text-white">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-800 border-goat-gray-600">
                <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="recurrence" className="text-white">Recorrência</Label>
            <Select value={formData.recurrence} onValueChange={(value) => setFormData({...formData, recurrence: value})}>
              <SelectTrigger className="bg-goat-gray-900 border-goat-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-goat-gray-800 border-goat-gray-600">
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="startDate" className="text-white">Data de Início</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="bg-goat-gray-900 border-goat-gray-600 text-white"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
              Criar Despesa Recorrente
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-white border-goat-gray-600">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
