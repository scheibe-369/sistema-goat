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
      // For local development with mock user, return mock data
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user from supabase or explicit mock ID, use mock data
      if (!user || user.id === 'mock-user-id') {
        console.log('DEBUG - Using mock clients data');
        return [
          {
            id: '1',
            company: 'Empresa Alpha',
            cnpj: '12.345.678/0001-90',
            responsible: 'Henrique Silva',
            phone: '(11) 98888-7777',
            email: 'contato@alpha.com',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: 'Av. Paulista, 1000',
            plan: 'Premium',
            contract_end: '2025-12-31',
            start_date: '2024-01-01',
            monthly_value: 1500.00,
            payment_day: 10,
            tags: ['Ativo']
          },
          {
            id: '2',
            company: 'Consultoria Beta',
            cnpj: '98.765.432/0001-21',
            responsible: 'Mariana Costa',
            phone: '(21) 97777-6666',
            email: 'mariana@beta.com',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: 'Rua Augusta, 500',
            plan: 'Gold',
            contract_end: '2025-06-30',
            start_date: '2024-06-01',
            monthly_value: 850.00,
            payment_day: 5,
            tags: ['A vencer']
          },
          {
            id: '3',
            company: 'Marketing Express',
            cnpj: '45.123.890/0001-55',
            responsible: 'Roberto Almeida',
            phone: '(31) 96666-5555',
            email: 'roberto@marketingexpress.com',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: 'Rua das Flores, 120',
            plan: 'Basic',
            contract_end: '2023-12-31',
            start_date: '2023-10-01',
            monthly_value: 800.00,
            payment_day: 15,
            tags: ['Inativo']
          },
          {
            id: '4',
            company: 'Global Importadora',
            cnpj: '76.543.210/0001-33',
            responsible: 'Amanda Santos',
            phone: '(41) 95555-4444',
            email: 'amanda@globalimport.com',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: 'Setor Comercial Sul, Q1',
            plan: 'Enterprise',
            contract_end: '2026-02-15',
            start_date: '2024-02-15',
            monthly_value: 3500.00,
            payment_day: 20,
            tags: ['Ativo']
          },
          {
            id: '5',
            company: 'Tech Solutions',
            cnpj: '98.765.432/0001-10',
            responsible: 'José Carlos',
            phone: '(21) 97777-6666',
            email: 'jose@techsolutions.com',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: 'Av. Copacabana, 500',
            plan: 'Enterprise',
            contract_end: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
            start_date: '2023-05-01',
            monthly_value: 2000.00,
            payment_day: 5,
            tags: ['A Vencer']
          }
        ] as Client[];
      }

      if (!user) throw new Error('User not authenticated');

      // Atualizar tags de clientes baseado no vencimento dos contratos
      // Isso garante que as tags estejam sempre atualizadas
      try {
        await supabase.rpc('update_client_tags_from_contracts');
      } catch (rpcError) {
        // Não falhar a query se a atualização de tags falhar
        console.warn('Erro ao atualizar tags de clientes:', rpcError);
      }

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

      // Enviar webhook para o cliente criado
      try {
        console.log('DEBUG - Enviando webhook para cliente criado');
        const { data: webhookResult, error: webhookError } = await supabase.functions.invoke('send-client-webhook', {
          body: {
            id: data.id,
            company: data.company,
            cnpj: data.cnpj,
            responsible: data.responsible,
            phone: data.phone,
            email: data.email,
            grupo_id: data.grupo_id,
            plan: data.plan,
            contract_end: data.contract_end,
            start_date: data.start_date,
            payment_day: data.payment_day,
            monthly_value: data.monthly_value,
            address: data.address,
            tags: data.tags,
            user_id: data.user_id,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        });

        if (webhookError) {
          console.error('Erro ao enviar webhook:', webhookError);
          // Não falhar a criação do cliente por causa do webhook
        } else {
          console.log('Webhook enviado com sucesso:', webhookResult);
        }
      } catch (webhookErr) {
        console.error('Erro ao chamar edge function do webhook:', webhookErr);
        // Não falhar a criação do cliente por causa do webhook
      }

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
