
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { generateFinancialEntriesForClient, updateFinancialEntriesForClient } from './useGenerateFinancialEntries';

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

      console.log('DEBUG - Criando cliente com dados:', client);

      const { data, error } = await supabase
        .from('clients')
        .insert({ ...client, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      console.log('DEBUG - Cliente criado:', data);

      // Gerar lançamentos financeiros automaticamente se cliente tem dados de contrato
      try {
        if (client.monthly_value && client.contract_end && client.payment_day) {
          console.log('DEBUG - Gerando lançamentos financeiros para cliente criado');
          await generateFinancialEntriesForClient(data.id, user.id);
          console.log('DEBUG - Lançamentos financeiros gerados com sucesso');
        } else {
          console.log('DEBUG - Cliente não tem dados completos para gerar lançamentos:', {
            monthly_value: client.monthly_value,
            contract_end: client.contract_end,
            payment_day: client.payment_day
          });
        }
      } catch (financialError) {
        console.error('Erro ao gerar lançamentos financeiros:', financialError);
        // Não falhar a criação do cliente se houver erro nos lançamentos
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('DEBUG - Atualizando cliente:', id, updates);

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

      console.log('DEBUG - Cliente atualizado:', data);

      // Atualizar lançamentos financeiros se dados do contrato foram alterados
      try {
        if (updates.monthly_value !== undefined || updates.contract_end !== undefined || updates.payment_day !== undefined) {
          console.log('DEBUG - Atualizando lançamentos financeiros para cliente editado');
          await updateFinancialEntriesForClient(id, user.id);
        }
      } catch (financialError) {
        console.error('Erro ao atualizar lançamentos financeiros:', financialError);
        // Não falhar a atualização do cliente se houver erro nos lançamentos
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
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
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Delete client error:', error);
      toast.error('Erro ao excluir cliente');
    },
  });
};
