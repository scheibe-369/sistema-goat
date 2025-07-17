
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WebhookMessage {
  numero: string;
  mensagem: string;
  direcao: boolean;
  data_hora: string;
  conversa_id: string;
  nome_contato?: string;
  user_id: string;
}

export const useProcessWebhookMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (webhookData: WebhookMessage) => {
      console.log('Processando mensagem webhook:', webhookData);

      const { data, error } = await supabase.rpc('process_webhook_message', {
        p_user_id: webhookData.user_id,
        p_numero: webhookData.numero,
        p_mensagem: webhookData.mensagem,
        p_direcao: webhookData.direcao,
        p_data_hora: webhookData.data_hora,
        p_conversa_id: webhookData.conversa_id,
        p_nome_contato: webhookData.nome_contato
      });

      if (error) {
        console.error('Erro ao processar mensagem webhook:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Mensagem webhook processada com sucesso:', data);
      
      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      
      toast({
        title: "Mensagem processada",
        description: "Nova mensagem recebida e processada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Erro ao processar mensagem webhook:", error);
      toast({
        title: "Erro ao processar mensagem",
        description: "Ocorreu um erro ao processar a mensagem recebida",
        variant: "destructive",
      });
    },
  });
};

export const useTestWebhook = () => {
  const processWebhook = useProcessWebhookMessage();

  return useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const testMessage: WebhookMessage = {
        numero: "5511999999999",
        mensagem: "Mensagem de teste recebida via webhook",
        direcao: false, // mensagem recebida
        data_hora: new Date().toISOString(),
        conversa_id: "test_" + Date.now(),
        nome_contato: "Contato Teste",
        user_id: userData.user.id
      };

      return processWebhook.mutateAsync(testMessage);
    },
  });
};
