
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export const useFinancialEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar lançamentos financeiros
  const { data: financialEntries = [], isLoading: financialEntriesLoading } = useQuery({
    queryKey: ['financial-entries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('financial_entries')
        .select(`
          *,
          clients (
            company,
            cnpj,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar lançamentos financeiros:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Marcar como pago
  const markAsPaidMutation = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('DEBUG - Marcando lançamento como pago:', entryId);
      
      const { data: updatedEntry, error } = await supabase
        .from('financial_entries')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      return updatedEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
      
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
    financialEntries,
    financialEntriesLoading,
    markAsPaid: markAsPaidMutation.mutate,
    isMarkingAsPaid: markAsPaidMutation.isPending,
  };
};
