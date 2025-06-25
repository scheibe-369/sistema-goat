
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface ExpenseModalProps {
  onAddExpense: (expense: any) => void;
}

export function ExpenseModal({ onAddExpense }: ExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense = {
      id: Date.now(),
      description: formData.description,
      value: parseFloat(formData.value),
      category: formData.category,
      date: formData.date,
      status: 'Pendente',
      isRecurring: false
    };

    onAddExpense(expense);
    setOpen(false);
    setFormData({
      description: '',
      value: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Despesa</DialogTitle>
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
            <Label htmlFor="date" className="text-white">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="bg-goat-gray-900 border-goat-gray-600 text-white"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Adicionar Despesa
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
