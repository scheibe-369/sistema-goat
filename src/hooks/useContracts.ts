
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
      // Verificar autenticação antes de fazer query
      const { data: { user } } = await supabase.auth.getUser();
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
