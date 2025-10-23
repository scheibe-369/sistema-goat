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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data as Client[];
    },
    // Previne execução da query sem autenticação
    enabled: true,
    retry: false,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Omit<ClientInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('DEBUG - Criando cliente com dados:', client);
      console.log('DEBUG - Tipos dos dados:', {
        contract_end: typeof client.contract_end,
        start_date: typeof client.start_date,
        monthly_value: typeof client.monthly_value,
        payment_day: typeof client.payment_day
      });

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
      console.log('DEBUG - Dados salvos no banco:', {
        contract_end: data.contract_end,
        start_date: data.start_date,
        monthly_value: data.monthly_value,
        payment_day: data.payment_day
      });

      // Gerar lançamentos financeiros automaticamente se cliente tem dados de contrato
      if (client.monthly_value && client.contract_end && client.payment_day) {
        console.log('DEBUG - Gerando lançamentos financeiros para cliente criado');
        try {
          await generateFinancialEntriesForClient(data.id, user.id);
        } catch (finError) {
          console.error('Erro ao gerar lançamentos financeiros:', finError);
          // Não falhar a criação do cliente por causa dos lançamentos
        }
      }

      // Enviar webhook com dados do novo cliente
      try {
        console.log('DEBUG - Enviando webhook para cliente criado:', data);
        await supabase.functions.invoke('send-client-webhook', {
          body: data
        });
      } catch (webhookError) {
        console.error('Erro ao enviar webhook do cliente:', webhookError);
        // Não falhar a criação do cliente por causa do webhook
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
      console.log('DEBUG - Tipos dos dados de atualização:', {
        contract_end: typeof updates.contract_end,
        start_date: typeof updates.start_date,
        monthly_value: typeof updates.monthly_value,
        payment_day: typeof updates.payment_day
      });

      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      console.log('DEBUG - Cliente atualizado:', data);
      console.log('DEBUG - Dados atualizados no banco:', {
        contract_end: data.contract_end,
        start_date: data.start_date,
        monthly_value: data.monthly_value,
        payment_day: data.payment_day
      });

      // Atualizar lançamentos financeiros se dados do contrato foram alterados
      if (updates.monthly_value !== undefined || updates.contract_end !== undefined || updates.payment_day !== undefined) {
        console.log('DEBUG - Atualizando lançamentos financeiros para cliente editado');
        try {
          await updateFinancialEntriesForClient(id, user.id);
        } catch (finError) {
          console.error('Erro ao atualizar lançamentos financeiros:', finError);
          // Não falhar a atualização do cliente por causa dos lançamentos
        }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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
