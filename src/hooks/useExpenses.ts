import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  type: string;
  user_id: string;
  client_id?: string;
  created_at?: string;
  updated_at?: string;
  is_recurring?: boolean;
  recurrence_type?: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      return (data || []).map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        status: expense.status || 'pending',
        type: expense.type,
        user_id: expense.user_id,
        client_id: expense.client_id,
        created_at: expense.created_at,
        updated_at: expense.updated_at,
        is_recurring: expense.is_recurring || false,
        recurrence_type: expense.recurrence_type
      })) as Expense[];
    },
    enabled: !!user?.id,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('DEBUG useExpenses - Dados recebidos:', expenseData);
      console.log('DEBUG useExpenses - Data recebida:', expenseData.date);

      // Validação extra dos campos obrigatórios
      if (!expenseData.description || typeof expenseData.description !== 'string') {
        throw new Error('Descrição obrigatória.');
      }
      if (typeof expenseData.amount !== 'number' || isNaN(expenseData.amount) || expenseData.amount <= 0) {
        throw new Error('Valor da despesa deve ser um número maior que zero.');
      }
      if (!expenseData.category || typeof expenseData.category !== 'string') {
        throw new Error('Categoria obrigatória.');
      }
      
      // A data deve estar no formato YYYY-MM-DD exatamente como vem do input
      let dateToSave = expenseData.date;
      if (typeof dateToSave === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateToSave)) {
        console.log('DEBUG useExpenses - Data válida no formato correto:', dateToSave);
      } else {
        throw new Error('Data deve estar no formato YYYY-MM-DD. Valor recebido: ' + expenseData.date);
      }
      
      if (!expenseData.status) {
        throw new Error('Status obrigatório.');
      }

      console.log('DEBUG useExpenses - Data que será salva no banco:', dateToSave);
      console.log('DEBUG useExpenses - Enviando para Supabase:', {
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        date: dateToSave,
        status: expenseData.status,
        type: 'expense',
        user_id: user.id,
        client_id: expenseData.client_id || null,
        is_recurring: expenseData.is_recurring || false,
        recurrence_type: expenseData.recurrence_type || null
      });

      const { data, error } = await supabase
        .from('finances')
        .insert({
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: dateToSave, // Usa a data exatamente como recebida
          status: expenseData.status,
          type: 'expense',
          user_id: user.id,
          client_id: expenseData.client_id || null,
          is_recurring: expenseData.is_recurring || false,
          recurrence_type: expenseData.recurrence_type || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw error;
      }

      console.log('DEBUG useExpenses - Despesa criada no banco:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error creating expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const calculateNextDate = (currentDate: string, recurrenceType: string) => {
    // Usar a data exatamente como está no formato YYYY-MM-DD
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 porque Date usa meses de 0-11
    
    console.log('DEBUG calculateNextDate - Data atual:', currentDate);
    console.log('DEBUG calculateNextDate - Date object criado:', date);
    
    switch (recurrenceType) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    const nextDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    console.log('DEBUG calculateNextDate - Próxima data calculada:', nextDate);
    return nextDate;
  };

  const payExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, get the expense details
      const { data: expense, error: fetchError } = await supabase
        .from('finances')
        .select('*')
        .eq('id', expenseId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching expense:', fetchError);
        throw fetchError;
      }

      // Mark current expense as paid
      const { data: updatedExpense, error: updateError } = await supabase
        .from('finances')
        .update({ status: 'paid' })
        .eq('id', expenseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error paying expense:', updateError);
        throw updateError;
      }

      // If it's a recurring expense, create the next one
      if (expense.is_recurring && expense.recurrence_type) {
        const nextDate = calculateNextDate(expense.date, expense.recurrence_type);
        
        const { error: createError } = await supabase
          .from('finances')
          .insert({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: nextDate,
            status: 'pending',
            type: 'expense',
            user_id: user.id,
            client_id: expense.client_id,
            is_recurring: true,
            recurrence_type: expense.recurrence_type
          });

        if (createError) {
          console.error('Error creating next recurring expense:', createError);
          // Don't throw here, as the payment was successful
        }
      }

      return updatedExpense;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: data.is_recurring ? "Despesa paga e próxima criada automaticamente!" : "Despesa marcada como paga!",
      });
    },
    onError: (error) => {
      console.error('Error paying expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao pagar despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('finances')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    expenses,
    isLoading,
    createExpense: createExpenseMutation.mutate,
    isCreating: createExpenseMutation.isPending,
    payExpense: payExpenseMutation.mutate,
    isPaying: payExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutate,
    isDeleting: deleteExpenseMutation.isPending,
  };
};
