
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export const useFinancialEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ contractId, amount, description }: { contractId: string; amount: number; description: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create a financial entry for the payment
      const { data, error } = await supabase
        .from('finances')
        .insert({
          description: description,
          amount: amount,
          category: 'Receita',
          date: new Date().toISOString().split('T')[0],
          status: 'paid',
          type: 'income',
          user_id: user.id,
          client_id: contractId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating financial entry:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
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

  return {
    markAsPaid: markAsPaidMutation.mutate,
    isMarkingAsPaid: markAsPaidMutation.isPending,
  };
};
