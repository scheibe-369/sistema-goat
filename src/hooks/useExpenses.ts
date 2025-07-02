
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

      return data.map(expense => ({
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
        updated_at: expense.updated_at
      })) as Expense[];
    },
    enabled: !!user?.id,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finances')
        .insert({
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          status: expenseData.status,
          type: 'expense',
          user_id: user.id,
          client_id: expenseData.client_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw error;
      }

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

  const payExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('finances')
        .update({ status: 'paid' })
        .eq('id', expenseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error paying expense:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa marcada como paga!",
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
