import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
        
        // For existing entries, check if we need to create next month's entry
        if (data.type === 'income') {
          const nextMonthDate = calculateNextMonthDate(data.date);
          
          // Check if there's a related contract and if we should create next payment
          const { data: contracts } = await supabase
            .from('contracts')
            .select('*, client:clients(*)')
            .eq('client_id', data.client_id)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
          
          if (contracts && contracts.end_date) {
            const contractEndDate = new Date(contracts.end_date);
            const nextMonthDateObj = new Date(nextMonthDate);
            
            if (nextMonthDateObj <= contractEndDate) {
              console.log('DEBUG - Criando próxima mensalidade automática');
              const { error: nextError } = await supabase
                .from('finances')
                .insert({
                  description: `Pagamento mensal - ${contracts.client?.company || 'Cliente'}`,
                  amount: data.amount,
                  category: 'Receita',
                  date: nextMonthDate,
                  status: 'pending',
                  type: 'income',
                  user_id: user.id,
                  client_id: data.client_id,
                });

              if (nextError) {
                console.error('Error creating next payment:', nextError);
              }
            }
          }
        }
      } else {
        // Create new entry for predicted payment
        const { data: newEntry, error } = await supabase
          .from('finances')
          .insert({
            description: data.description,
            amount: data.amount,
            category: 'Receita',
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

        // Create next month's entry if this is from a contract
        if (data.contract && data.contract.client) {
          const contract = data.contract;
          const paymentDate = new Date(contract.date);
          const nextPaymentDate = new Date(paymentDate);
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          
          // Check if next payment is still within contract period
          const contractEndDate = new Date(contract.client.contract_end || contract.client.contractEnd);
          
          if (nextPaymentDate <= contractEndDate) {
            console.log('DEBUG - Criando próxima mensalidade prevista');
            const { error: nextError } = await supabase
              .from('finances')
              .insert({
                description: `Pagamento mensal - ${contract.client.company || 'Cliente'}`,
                amount: contract.amount,
                category: 'Receita',
                date: nextPaymentDate.toISOString().split('T')[0],
                status: 'pending',
                type: 'income',
                user_id: user.id,
                client_id: data.contractId,
              });

            if (nextError) {
              console.error('Error creating next payment:', nextError);
            }
          }
        }
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-incomes'] });
      
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso! Próxima mensalidade criada automaticamente.",
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
