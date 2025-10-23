
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

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
