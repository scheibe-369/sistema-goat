
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

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

      // Create or update contract if client has contract data
      if (data && client.contract_end && client.monthly_value && client.monthly_value > 0) {
        const contractStatus = 
          new Date(client.contract_end) < new Date() ? 'inactive' :
          new Date(client.contract_end) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring' :
          'active';

        await supabase
          .from('contracts')
          .insert({
            user_id: user.id,
            client_id: data.id,
            type: client.plan || 'Serviço Geral',
            monthly_value: client.monthly_value,
            start_date: client.start_date || new Date().toISOString().split('T')[0],
            end_date: client.contract_end,
            status: contractStatus
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
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

      // Update associated contracts with new client data
      if (data) {
        const contractUpdates: any = {};

        // Update contract type if plan changed
        if (updates.plan) {
          contractUpdates.type = updates.plan;
        }

        // Update monthly value if changed
        if (updates.monthly_value !== undefined) {
          contractUpdates.monthly_value = updates.monthly_value;
        }

        // Update contract dates if changed
        if (updates.start_date) {
          contractUpdates.start_date = updates.start_date;
        }

        if (updates.contract_end) {
          contractUpdates.end_date = updates.contract_end;
          
          // Update contract status based on new end date
          const newEndDate = new Date(updates.contract_end);
          const now = new Date();
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          if (newEndDate < now) {
            contractUpdates.status = 'inactive';
          } else if (newEndDate <= thirtyDaysFromNow) {
            contractUpdates.status = 'expiring';
          } else {
            contractUpdates.status = 'active';
          }
        }

        // Update client status based on tags
        if (updates.tags) {
          if (updates.tags.includes('Vencido')) {
            contractUpdates.status = 'inactive';
          } else if (updates.tags.includes('A vencer')) {
            contractUpdates.status = 'expiring';
          } else if (updates.tags.includes('Ativo')) {
            contractUpdates.status = 'active';
          }
        }

        // Apply contract updates if there are any
        if (Object.keys(contractUpdates).length > 0) {
          await supabase
            .from('contracts')
            .update(contractUpdates)
            .eq('client_id', id);
        }

        // Create new contract if client didn't have one but now has contract data
        if ((!contractUpdates.monthly_value || contractUpdates.monthly_value > 0) && 
            updates.contract_end && updates.monthly_value && updates.monthly_value > 0) {
          
          // Check if contract exists
          const { data: existingContract } = await supabase
            .from('contracts')
            .select('id')
            .eq('client_id', id)
            .single();

          if (!existingContract) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const contractStatus = 
                new Date(updates.contract_end) < new Date() ? 'inactive' :
                new Date(updates.contract_end) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring' :
                'active';

              await supabase
                .from('contracts')
                .insert({
                  user_id: user.id,
                  client_id: id,
                  type: updates.plan || 'Serviço Geral',
                  monthly_value: updates.monthly_value,
                  start_date: updates.start_date || new Date().toISOString().split('T')[0],
                  end_date: updates.contract_end,
                  status: contractStatus
                });
            }
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
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
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Delete client error:', error);
      toast.error('Erro ao excluir cliente');
    },
  });
};
