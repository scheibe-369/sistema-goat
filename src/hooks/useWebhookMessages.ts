
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WebhookMessage {
  numero: string;
  mensagem: string;
  direcao: boolean;
  data_hora: string;
  nome_contato?: string;
  user_id: string;
  media_type?: string;
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  mediaKey?: string; // Chave para descriptografia
}

export const useProcessWebhookMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (webhookData: WebhookMessage) => {
      console.log('Processando mensagem webhook no frontend:', webhookData);

      // @ts-ignore - types will be updated after migration
      const { data, error } = await supabase.rpc('process_webhook_message', {
        p_user_id: webhookData.user_id,
        p_numero: webhookData.numero,
        p_mensagem: webhookData.mensagem,
        p_direcao: webhookData.direcao,
        p_data_hora: webhookData.data_hora,
        p_nome_contato: webhookData.nome_contato,
        p_media_type: webhookData.media_type,
        p_media_url: webhookData.media_url,
        p_media_filename: webhookData.media_filename,
        p_media_size: webhookData.media_size
      });

      if (error) {
        console.error('Erro ao processar mensagem webhook:', error);
        throw error;
      }

      console.log('Mensagem webhook processada com sucesso:', data);
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

      // Gerar um número único para o teste
      const testNumber = "5511" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      
      const testMessage: WebhookMessage = {
        numero: testNumber,
        mensagem: `Mensagem de teste recebida via webhook - ${new Date().toLocaleTimeString()}`,
        direcao: false, // mensagem recebida
        data_hora: new Date().toISOString(),
        nome_contato: "Contato Teste " + Math.floor(Math.random() * 1000),
        user_id: userData.user.id
      };

      console.log('Testando webhook com dados:', testMessage);
      return processWebhook.mutateAsync(testMessage);
    },
  });
};

// Hook para testar o webhook via edge function
export const useTestWebhookEdgeFunction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customData?: Partial<WebhookMessage>) => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const testNumber = customData?.numero || "5511" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      
      const testData = {
        numero: testNumber,
        mensagem: customData?.mensagem || `Teste via Edge Function - ${new Date().toLocaleTimeString()}`,
        direcao: customData?.direcao ?? false,
        data_hora: customData?.data_hora || new Date().toISOString(),
        nome_contato: customData?.nome_contato || "Teste Edge Function",
        user_id: customData?.user_id || userData.user.id,
        media_type: customData?.media_type,
        media_url: customData?.media_url,
        media_filename: customData?.media_filename,
        media_size: customData?.media_size,
        mediaKey: customData?.mediaKey // Incluir chave de descriptografia se disponível
      };

      console.log('Testando webhook via Edge Function:', testData);

      const { data, error } = await supabase.functions.invoke('webhook-messages', {
        body: { data: testData }
      });

      if (error) {
        console.error('Erro ao chamar Edge Function:', error);
        throw error;
      }

      console.log('Resposta da Edge Function:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Edge Function executada com sucesso:', data);
      
      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      
      toast({
        title: "Teste realizado",
        description: "Edge Function executada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Erro ao testar Edge Function:", error);
      toast({
        title: "Erro no teste",
        description: `Erro: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook para testar upload de imagem
export const useTestImageUpload = () => {
  const testWebhook = useTestWebhookEdgeFunction();

  return useMutation({
    mutationFn: async () => {
      // Simular dados de uma imagem recebida do WhatsApp
      const testImageData: Partial<WebhookMessage> = {
        mensagem: "", // Mensagem vazia para mídia
        media_type: "image/jpeg",
        media_url: "https://example.com/encrypted-image.jpg", // URL de exemplo
        media_filename: "imagem_teste.jpg",
        media_size: 1024000, // 1MB
        mediaKey: "dGVzdGVfa2V5X3BhcmFfZGVzY3JpcHRvZ3JhZmlh", // Chave base64 de exemplo
        nome_contato: "Teste de Imagem"
      };

      return testWebhook.mutateAsync(testImageData);
    },
  });
};
