
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  stage: string | null;
  tags: string[] | null;
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInput {
  name: string;
  company: string;
  phone: string;
  email?: string;
  stage: string;
  tags?: string[];
  value?: number;
  notes?: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar leads do banco
  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os leads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Criar novo lead
  const createLead = async (leadData: LeadInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name: leadData.name,
          company: leadData.company,
          phone: leadData.phone,
          email: leadData.email || null,
          stage: leadData.stage,
          tags: leadData.tags || [],
          value: leadData.value || null,
          notes: leadData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => [data, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Lead criado com sucesso',
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Atualizar lead
  const updateLead = async (id: string, updates: Partial<LeadInput>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast({
        title: 'Sucesso',
        description: 'Lead atualizado com sucesso',
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Deletar lead
  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Lead removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads,
  };
}
