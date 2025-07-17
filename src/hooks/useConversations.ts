import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toZonedTime, fromZonedTime, format } from "date-fns-tz";
import { parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

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
}

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
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

// Função para normalizar timestamps para UTC
const normalizeTimestampToUTC = (timestamp: string | undefined): Date => {
  if (!timestamp) return new Date();
  
  try {
    // Se já é ISO string com timezone, usar diretamente
    if (timestamp.includes('T') && (timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-'))) {
      return new Date(timestamp);
    }
    
    // Se é formato de data simples, assumir como UTC
    const parsed = parseISO(timestamp);
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Fallback para data atual
    return new Date();
  } catch (error) {
    console.warn('Error parsing timestamp:', timestamp, error);
    return new Date();
  }
};

// Função para converter timestamp para horário de Brasília e formatar
export const formatToBrasiliaTime = (timestamp: string | undefined): string => {
  if (!timestamp) return '';
  
  try {
    const date = normalizeTimestampToUTC(timestamp);
    // Converter para horário de Brasília (UTC-3)
    const brasiliaTime = toZonedTime(date, 'America/Sao_Paulo');
    return format(brasiliaTime, 'HH:mm', { timeZone: 'America/Sao_Paulo' });
  } catch (error) {
    console.warn('Error formatting timestamp to Brasilia time:', timestamp, error);
    return '';
  }
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId);

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      // Ordenar manualmente no cliente usando timestamps normalizados para UTC
      const sortedData = (data as Message[]).sort((a, b) => {
        const timestampA = normalizeTimestampToUTC(a.data_hora || a.created_at);
        const timestampB = normalizeTimestampToUTC(b.data_hora || b.created_at);
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
          data_hora: new Date().toISOString(),
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
