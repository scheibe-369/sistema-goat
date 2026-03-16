
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
  sdr_status: string | null;
  sdr_started_at: string | null;
  sdr_last_contact_at: string | null;
  sdr_followup_count: number | null;
  meeting_date: string | null;
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
  meeting_date?: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar leads do banco
  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For local development with mock user, return mock data
      if (!user || user?.id === 'mock-user-id') {
        console.log('DEBUG - Using mock leads data');
        const mockLeads: Lead[] = [
          {
            id: 'lead-1',
            name: 'Carlos Oliveira',
            company: 'Oliveira Tech',
            phone: '(11) 91234-5678',
            email: 'carlos@oliveira.tech',
            stage: 'stage-1', // Novo Contato
            tags: ['Quente'],
            value: 5000,
            notes: 'Interessado no plano Premium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: '2025-03-20'
          },
          {
            id: 'lead-2',
            name: 'Ana Souza',
            company: 'Souza Design',
            phone: '(21) 92345-6789',
            email: 'ana@souzadesign.com',
            stage: 'stage-2', // Em Negociação
            tags: ['Frio'],
            value: 2000,
            notes: 'Precisa de um orçamento detalhado',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: null
          },
          {
            id: 'lead-3',
            name: 'Marcos Silva',
            company: 'MS Consultoria',
            phone: '(31) 99888-7777',
            email: 'marcos@msconsultoria.com.br',
            stage: 'stage-1', // Novo Contato
            tags: ['Quente'],
            value: 12000,
            notes: 'Quer projeto de reestruturação de RH',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: null
          },
          {
            id: 'lead-4',
            name: 'Juliana Costa',
            company: 'JC Eventos',
            phone: '(41) 98888-6666',
            email: 'contato@jceventos.com',
            stage: 'stage-3', // Fechado
            tags: ['Ativo'],
            value: 8500,
            notes: 'Contrato anual assinado',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: null
          },
          {
            id: 'lead-5',
            name: 'Roberto Almeida',
            company: 'Almeida Imports',
            phone: '(51) 97777-5555',
            email: 'roberto@almeidaimports.com',
            stage: 'stage-2', // Em Negociação
            tags: ['A vencer'],
            value: 3000,
            notes: 'Aguardando aprovação da diretoria',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: '2026-03-15'
          },
          {
            id: 'lead-6',
            name: 'Felipe Santos',
            company: 'Santos Logística',
            phone: '(61) 96666-4444',
            email: 'felipe@santoslog.com',
            stage: 'stage-4', // Sem Atendimento
            tags: ['Novo'],
            value: 4500,
            notes: 'Veio da campanha de Facebook Ads',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: null
          },
          {
            id: 'lead-7',
            name: 'Patrícia Lima',
            company: 'Lima Odontologia',
            phone: '(71) 95555-3333',
            email: 'patricia@limaodonto.com.br',
            stage: 'stage-5', // Em Atendimento
            tags: ['Quente'],
            value: 1500,
            notes: 'Dúvidas sobre o funcionamento do CRM',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: null
          },
          {
            id: 'lead-8',
            name: 'Eduardo Gomes',
            company: 'EG Start',
            phone: '(81) 94444-2222',
            email: 'eduardo@egstart.tech',
            stage: 'stage-6', // Reunião Agendada
            tags: ['Quente'],
            value: 6000,
            notes: 'Apresentação agendada para sexta',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString()
          },
          {
            id: 'lead-9',
            name: 'Renata Castro',
            company: 'RC Estética',
            phone: '(91) 93333-1111',
            email: 'renata@rcestetica.com',
            stage: 'stage-7', // Proposta Enviada
            tags: ['Fio'],
            value: 2500,
            notes: 'Aguardando avaliação da proposta',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 0,
            meeting_date: null
          },
          {
            id: 'lead-10',
            name: 'Marcelo Pires',
            company: 'Pires Transportes',
            phone: '(51) 92222-0000',
            email: 'marcelo@pirestransportes.com',
            stage: 'stage-8', // Follow-up
            tags: ['Frio'],
            value: 8000,
            notes: 'Ligar semana que vem',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sdr_status: null,
            sdr_started_at: null,
            sdr_last_contact_at: null,
            sdr_followup_count: 1,
            meeting_date: null
          }
        ];
        setLeads(mockLeads);
        setIsLoading(false);
        return;
      }

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data as unknown as Lead[]) || []);
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
          meeting_date: leadData.meeting_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => [data as unknown as Lead, ...prev]);
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

      setLeads(prev => prev.map(lead => lead.id === id ? (data as unknown as Lead) : lead));
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

  // Atualizar etapa do lead (para drag and drop)
  const updateLeadStage = async (id: string, newStage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Se for usuário mockado localmente, atualizamos o state no mock e encerramos para evitar erro de banco
      if (!user || user.id === 'mock-user-id') {
        setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, stage: newStage } : lead));
        return { id, stage: newStage };
      }

      const { data, error } = await supabase
        .from('leads')
        .update({ stage: newStage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => prev.map(lead => lead.id === id ? (data as unknown as Lead) : lead));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar etapa do lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a etapa do lead',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Configurar real-time subscriptions
  useEffect(() => {
    fetchLeads();

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const channel = supabase
          .channel('leads-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leads',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Lead change detected:', payload);
              fetchLeads(); // Recarregar leads quando houver mudanças
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    const subscription = setupSubscription();

    return () => {
      subscription.then(cleanup => cleanup && cleanup());
    };
  }, []);

  return {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStage,
    refetch: fetchLeads,
  };
}
