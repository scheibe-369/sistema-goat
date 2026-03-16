import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Conversation {
  id: string;
  user_id: string;
  phone: string;
  remote_jid?: string;
  contact_name?: string;
  last_message?: string;
  stage?: string;
  tag?: string;
  direction?: string;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  text: string;
  numero?: string;
  mensagem?: string;
  direcao?: boolean;
  data_hora?: string;
  nome_contato?: string;
  created_at?: string;
  updated_at?: string;
  media_type?: string;
  media_url?: string;
  media_filename?: string;
  media_size?: number;
}

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      // For local development, return mock data if supabase call might fail or for mock experience
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id === 'mock-user-id') {
        console.log('DEBUG - Using mock conversations data');
        return [
          {
            id: 'conv-1',
            user_id: 'mock-user-id',
            phone: '(11) 98888-7777',
            contact_name: 'Henrique Silva',
            last_message: 'Perfeito, aguardo o contrato para assinatura.',
            unread_count: 0,
            stage: 'stage-2',
            tag: 'Quente',
            direction: 'inbound',
            updated_at: new Date().toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'conv-2',
            user_id: 'mock-user-id',
            phone: '(21) 97777-6666',
            contact_name: 'Mariana Costa',
            last_message: 'Vocês conseguem fazer um desconto no plano anual?',
            unread_count: 2,
            stage: 'stage-1',
            tag: 'Frio',
            direction: 'outbound',
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'conv-3',
            user_id: 'mock-user-id',
            phone: '(31) 96666-5555',
            contact_name: 'Roberto Almeida',
            last_message: 'Bom dia! Gostaria de agendar uma demonstração.',
            unread_count: 1,
            stage: 'stage-1',
            tag: 'Quente',
            direction: 'inbound',
            updated_at: new Date(Date.now() - 7200000).toISOString(),
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'conv-4',
            user_id: 'mock-user-id',
            phone: '(41) 95555-4444',
            contact_name: 'Amanda Santos',
            last_message: 'Obrigada pelo retorno. Vou avaliar com a equipe.',
            unread_count: 0,
            stage: 'stage-3',
            tag: 'Ativo',
            direction: 'outbound',
            updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          }
        ] as Conversation[];
      }

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      return data as Conversation[];
    },
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      // For local development, return mock data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'mock-user-id') {
        if (conversationId === 'conv-1') {
          return [
            {
              id: 'msg-1-1',
              conversation_id: 'conv-1',
              text: 'Olá, gostaria de saber sobre o plano Premium',
              direcao: true, // true = received (customer)
              data_hora: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'msg-1-2',
              conversation_id: 'conv-1',
              text: 'Olá Henrique! Tudo bem? Claro, o plano Premium é o nosso pacote mais completo.',
              direcao: false, // false = sent (us)
              data_hora: new Date(Date.now() - 86000000).toISOString(),
            },
            {
              id: 'msg-1-3',
              conversation_id: 'conv-1',
              text: 'Ele inclui suporte 24h, integrações ilimitadas e até 50 usuários.',
              direcao: false,
              data_hora: new Date(Date.now() - 85900000).toISOString(),
            },
            {
              id: 'msg-1-4',
              conversation_id: 'conv-1',
              text: 'Isso parece ótimo! E qual seria o valor mensal?',
              direcao: true,
              data_hora: new Date(Date.now() - 85000000).toISOString(),
            },
            {
              id: 'msg-1-5',
              conversation_id: 'conv-1',
              text: 'O valor padrão é R$ 1.500/mês, mas se fecharmos o contrato anual, dou 10% de desconto.',
              direcao: false,
              data_hora: new Date(Date.now() - 10000000).toISOString(),
            },
            {
              id: 'msg-1-6',
              conversation_id: 'conv-1',
              text: 'Perfeito, aguardo o contrato para assinatura.',
              direcao: true,
              data_hora: new Date().toISOString(),
            }
          ] as Message[];
        }
        if (conversationId === 'conv-2') {
          return [
            {
              id: 'msg-2-1',
              conversation_id: 'conv-2',
              text: 'Boa tarde, o sistema de vocês faz emissão de notas fiscais?',
              direcao: true,
              data_hora: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            },
            {
              id: 'msg-2-2',
              conversation_id: 'conv-2',
              text: 'Boa tarde Mariana! Sim, temos integração direta com as prefeituras para emissão de NFS-e.',
              direcao: false,
              data_hora: new Date(Date.now() - 170000000).toISOString(),
            },
            {
              id: 'msg-2-3',
              conversation_id: 'conv-2',
              text: 'Excelente. Poderia me mandar uma proposta?',
              direcao: true,
              data_hora: new Date(Date.now() - 160000000).toISOString(),
            },
            {
              id: 'msg-2-4',
              conversation_id: 'conv-2',
              text: 'Acabei de enviar a proposta por e-mail. Dá uma olhadinha lá!',
              direcao: false,
              data_hora: new Date(Date.now() - 4000000).toISOString(),
            },
            {
              id: 'msg-2-5',
              conversation_id: 'conv-2',
              text: 'Recebi aqui. Achei incrível a plataforma.',
              direcao: true,
              data_hora: new Date(Date.now() - 3700000).toISOString(),
            },
            {
              id: 'msg-2-6',
              conversation_id: 'conv-2',
              text: 'Vocês conseguem fazer um desconto no plano anual?',
              direcao: true,
              data_hora: new Date(Date.now() - 3600000).toISOString(),
            }
          ] as Message[];
        }
        if (conversationId === 'conv-3') {
          return [
            {
              id: 'msg-3-1',
              conversation_id: 'conv-3',
              text: 'Bom dia! Gostaria de agendar uma demonstração.',
              direcao: true,
              data_hora: new Date(Date.now() - 7200000).toISOString(),
            }
          ] as Message[];
        }
        if (conversationId === 'conv-4') {
          return [
            {
              id: 'msg-4-1',
              conversation_id: 'conv-4',
              text: 'Olá, vimos a apresentação do software GoAT CRM. Gostamos muito!',
              direcao: true,
              data_hora: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
            },
            {
              id: 'msg-4-2',
              conversation_id: 'conv-4',
              text: 'Ficamos muito felizes em saber, Amanda! Vocês pretendem migrar a base atual de vocês para a nova plataforma neste mês ainda?',
              direcao: false,
              data_hora: new Date(Date.now() - 86400000 * 2.5).toISOString(),
            },
            {
              id: 'msg-4-3',
              conversation_id: 'conv-4',
              text: 'Obrigada pelo retorno. Vou avaliar com a equipe.',
              direcao: true,
              data_hora: new Date(Date.now() - 86400000 * 2).toISOString(),
            }
          ] as Message[];
        }
        return [];
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId);

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      // Ordenar mensagens usando prioritariamente data_hora (do banco) e depois created_at
      const sortedData = (data as Message[]).sort((a, b) => {
        // Usar data_hora preferencialmente (campo do banco com timestamp correto em UTC)
        const timestampA = new Date(a.data_hora || a.created_at || '1970-01-01T00:00:00Z');
        const timestampB = new Date(b.data_hora || b.created_at || '1970-01-01T00:00:00Z');
        
        // Ordenar do mais antigo para o mais recente (cronológica)
        return timestampA.getTime() - timestampB.getTime();
      });

      return sortedData;
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          text,
          numero: "user", // Usar "user" para indicar que é mensagem do usuário
          mensagem: text,
          direcao: true,
          data_hora: new Date().toISOString(), // Salvar em UTC automaticamente
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar a última mensagem da conversa
      await supabase
        .from("conversations")
        .update({
          last_message: text,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar a mensagem",
        variant: "destructive",
      });
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ phone, contactName }: { phone: string; contactName: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userData.user.id,
          phone,
          contact_name: contactName,
          last_message: "Conversa iniciada",
          stage: "Sem atendimento",
          tag: "Lead",
          direction: "outbound",
          unread_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Conversa criada",
        description: "Nova conversa criada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erro ao criar conversa",
        description: "Ocorreu um erro ao criar a conversa",
        variant: "destructive",
      });
    },
  });
};
