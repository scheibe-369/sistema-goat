
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, Zap, CheckCircle } from "lucide-react";
import { useTestWebhook } from "@/hooks/useWebhookMessages";

export function WebhookTester() {
  const testWebhook = useTestWebhook();

  const handleTest = () => {
    testWebhook.mutate();
  };

  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-goat-purple rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Webhook Tester</h3>
          <p className="text-goat-gray-400 text-sm">Teste o processamento automático de mensagens</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Funções SQL Criadas
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Edge Function Pronta
          </Badge>
        </div>

        <p className="text-goat-gray-300 text-sm">
          O sistema agora pode receber mensagens automaticamente e criar conversas quando necessário.
        </p>

        <Button 
          onClick={handleTest}
          disabled={testWebhook.isPending}
          className="btn-primary w-full"
        >
          <TestTube className="w-4 h-4 mr-2" />
          {testWebhook.isPending ? "Testando..." : "Testar Webhook"}
        </Button>

        {testWebhook.isSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">✅ Teste realizado com sucesso! Verifique a lista de conversas.</p>
          </div>
        )}

        {testWebhook.isError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">❌ Erro no teste: {testWebhook.error?.message}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
