
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export const useFinancialEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const calculateNextMonthDate = (currentDate: string) => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ contractId, amount, description, contract }: { 
      contractId: string; 
      amount: number; 
      description: string;
      contract: any;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create a financial entry for the current payment
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

      // If contract is active and hasn't ended, create next month's entry
      if (contract && contract.status === 'active' && contract.end_date) {
        const nextMonthDate = calculateNextMonthDate(new Date().toISOString().split('T')[0]);
        const contractEndDate = new Date(contract.end_date);
        const nextMonthDateObj = new Date(nextMonthDate);

        // Only create if next month is before or on contract end date
        if (nextMonthDateObj <= contractEndDate) {
          const { error: nextError } = await supabase
            .from('finances')
            .insert({
              description: `${description} - Próxima mensalidade`,
              amount: amount,
              category: 'Receita',
              date: nextMonthDate,
              status: 'pending',
              type: 'income',
              user_id: user.id,
              client_id: contractId,
            });

          if (nextError) {
            console.error('Error creating next month entry:', nextError);
            // Don't throw here, as the current payment was successful
          }
        }
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      const isRecurring = variables.contract && variables.contract.status === 'active' && 
                         new Date(calculateNextMonthDate(new Date().toISOString().split('T')[0])) <= new Date(variables.contract.end_date);
      
      toast({
        title: "Sucesso",
        description: isRecurring ? "Pagamento registrado e próxima mensalidade criada!" : "Pagamento registrado com sucesso!",
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
