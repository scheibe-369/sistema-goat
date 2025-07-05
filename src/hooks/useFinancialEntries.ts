
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateNextFinancialEntry } from "./useGenerateFinancialEntries";

export const useFinancialEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const markAsPaidMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('DEBUG - Marcando como pago:', data);
      
      let result;
      
      if (data.id) {
        // Update existing entry
        const { data: updatedEntry, error } = await supabase
          .from('finances')
          .update({ status: 'paid' })
          .eq('id', data.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = updatedEntry;
        
        // Gerar próximo lançamento se necessário
        await generateNextFinancialEntry(updatedEntry, user.id);
        
      } else {
        // Create new entry for predicted payment
        const { data: newEntry, error } = await supabase
          .from('finances')
          .insert({
            description: data.description,
            amount: data.amount,
            category: data.category || 'Receita',
            date: data.contract?.date || new Date().toISOString().split('T')[0],
            status: 'paid',
            type: 'income',
            user_id: user.id,
            client_id: data.contractId,
          })
          .select()
          .single();

        if (error) throw error;
        result = newEntry;
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-incomes'] });
      
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error marking as paid:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Buscar receitas (lancamentos financeiros)
  const { data: incomes = [], isLoading: incomesLoading } = useQuery({
    queryKey: ['financial-incomes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .order('date', { ascending: false });
      if (error) {
        console.error('Erro ao buscar receitas:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    markAsPaid: markAsPaidMutation.mutate,
    isMarkingAsPaid: markAsPaidMutation.isPending,
    incomes,
    incomesLoading,
  };
};
