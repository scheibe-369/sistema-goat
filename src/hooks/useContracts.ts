
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { generateFinancialEntriesForClient } from './useGenerateFinancialEntries';

type Contract = Tables<'contracts'>;
type ContractInsert = TablesInsert<'contracts'>;
type ContractUpdate = TablesUpdate<'contracts'>;

export const useContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      // For local development with mock user, return mock data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id === 'mock-user-id') {
        console.log('DEBUG - Using mock contracts data');
        return [
          {
            id: 'contract-1',
            client_id: '1',
            type: 'Mensal',
            monthly_value: 1500.00,
            start_date: '2024-01-01',
            end_date: '2025-12-31',
            status: 'active',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            client: {
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
            }
          },
          {
            id: 'contract-2',
            client_id: '2',
            type: 'Anual',
            monthly_value: 2000.00,
            start_date: '2023-05-01',
            end_date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], // Expira em 15 dias (A Vencer)
            status: 'active',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            client: {
              id: '2',
              company: 'Tech Solutions',
              cnpj: '98.765.432/0001-10',
              responsible: 'Mariana Costa',
              phone: '(21) 97777-6666',
              email: 'mariana@techsolutions.com',
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
          },
          {
            id: 'contract-3',
            client_id: '3',
            type: 'Trimestral',
            monthly_value: 800.00,
            start_date: '2023-10-01',
            end_date: '2023-12-31',
            status: 'inactive',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            client: {
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
            }
          },
          {
            id: 'contract-4',
            client_id: '4',
            type: 'Mensal',
            monthly_value: 3500.00,
            start_date: '2024-02-15',
            end_date: '2026-02-15',
            status: 'active',
            user_id: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            client: {
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
            }
          }
        ];
      }

      // Atualizar tags de clientes baseado no vencimento dos contratos
      // Isso garante que as tags estejam sempre atualizadas
      try {
        await supabase.rpc('update_client_tags_from_contracts');
      } catch (rpcError) {
        // Não falhar a query se a atualização de tags falhar
        console.warn('Erro ao atualizar tags de clientes:', rpcError);
      }

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }

      return data;
    },
    // Previne execução sem autenticação
    retry: false,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contract: Omit<ContractInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contracts')
        .insert({ ...contract, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating contract:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error) => {
      console.error('Create contract error:', error);
      toast.error('Erro ao criar contrato');
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ContractUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contract:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Update contract error:', error);
      toast.error('Erro ao atualizar contrato');
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contract:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Delete contract error:', error);
      toast.error('Erro ao excluir contrato');
    },
  });
};

export const useRenewContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Buscar o contrato atual
      const { data: currentContract, error: fetchError } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', contractId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !currentContract) {
        throw new Error('Contrato não encontrado');
      }

      // Calcular duração do contrato em dias
      const startDate = new Date(currentContract.start_date);
      const endDate = new Date(currentContract.end_date);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Calcular nova data de início (dia seguinte ao término do contrato antigo)
      const newStartDate = new Date(endDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      // Calcular nova data de término (mesma duração)
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + diffDays);

      // Criar novo contrato
      const { data: newContract, error: createError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          client_id: currentContract.client_id,
          type: currentContract.type,
          monthly_value: currentContract.monthly_value,
          start_date: newStartDate.toISOString().split('T')[0],
          end_date: newEndDate.toISOString().split('T')[0],
          status: 'active'
        })
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (createError) {
        console.error('Error creating renewed contract:', createError);
        throw createError;
      }

      // Marcar contrato antigo como inactive
      await supabase
        .from('contracts')
        .update({ status: 'inactive' })
        .eq('id', contractId);

      // Atualizar cliente com as novas datas do contrato renovado
      if (newContract.client_id) {
        try {
          await supabase
            .from('clients')
            .update({
              start_date: newStartDate.toISOString().split('T')[0],
              contract_end: newEndDate.toISOString().split('T')[0],
              updated_at: new Date().toISOString()
            })
            .eq('id', newContract.client_id)
            .eq('user_id', user.id);

          // Gerar novas faturas financeiras para o contrato renovado
          try {
            await generateFinancialEntriesForClient(newContract.client_id, user.id);
            console.log('Faturas financeiras geradas para contrato renovado');
          } catch (finError) {
            console.error('Erro ao gerar faturas financeiras:', finError);
            // Não falhar a renovação se a geração de faturas falhar
          }
        } catch (clientUpdateError) {
          console.error('Erro ao atualizar datas do cliente:', clientUpdateError);
          // Não falhar a renovação se a atualização do cliente falhar
        }
      }

      // Enviar webhook com dados do cliente renovado
      if (newContract.client) {
        try {
          const { error: webhookError } = await supabase.functions.invoke('send-client-webhook', {
            body: {
              id: newContract.client.id,
              company: newContract.client.company,
              cnpj: newContract.client.cnpj,
              responsible: newContract.client.responsible,
              phone: newContract.client.phone,
              email: newContract.client.email,
              grupo_id: newContract.client.grupo_id,
              plan: newContract.client.plan,
              contract_end: newContract.end_date,
              start_date: newContract.start_date,
              payment_day: newContract.client.payment_day,
              monthly_value: newContract.monthly_value,
              address: newContract.client.address,
              tags: newContract.client.tags,
              user_id: newContract.client.user_id,
              created_at: newContract.created_at,
              updated_at: newContract.updated_at,
              event: 'contract_renewed',
              previous_contract_end: currentContract.end_date,
              contract_duration_days: diffDays
            }
          });

          if (webhookError) {
            console.error('Erro ao enviar webhook:', webhookError);
            // Não falhar a renovação se o webhook falhar
          } else {
            console.log('Webhook de renovação enviado com sucesso');
          }
        } catch (webhookErr) {
          console.error('Erro ao chamar edge function do webhook:', webhookErr);
        }
      }

      return newContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Contrato renovado com sucesso!');
    },
    onError: (error) => {
      console.error('Renew contract error:', error);
      toast.error('Erro ao renovar contrato');
    },
  });
};
