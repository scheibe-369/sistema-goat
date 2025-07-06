
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useClientFinancialEntries = (clientId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-financial-entries', clientId, user?.id],
    queryFn: async () => {
      if (!user?.id || !clientId) return [];
      
      const { data, error } = await supabase
        .from('financial_entries')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar lançamentos do cliente:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!clientId,
  });
};
