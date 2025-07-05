
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { generateFinancialEntriesForClient } from './useGenerateFinancialEntries';

type Client = Tables<'clients'>;
type ClientInsert = TablesInsert<'clients'>;
type ClientUpdate = TablesUpdate<'clients'>;

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data as Client[];
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Omit<ClientInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .insert({ ...client, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      // Gerar lançamentos financeiros automaticamente se cliente tem dados de contrato
      if (client.monthly_value && client.contract_end && client.payment_day) {
        await generateFinancialEntriesForClient(data.id, user.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['financial-incomes'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error) => {
      console.error('Create client error:', error);
      toast.error('Erro ao criar cliente');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ClientUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['financial-incomes'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Update client error:', error);
      toast.error('Erro ao atualizar cliente');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['financial-incomes'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Delete client error:', error);
      toast.error('Erro ao excluir cliente');
    },
  });
};
