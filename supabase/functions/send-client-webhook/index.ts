import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientData = await req.json();
    console.log('Enviando dados do novo cliente para webhook:', clientData);

    // Webhook URL
    const webhookUrl = 'https://webhook.gabrielporceli.com.br/webhook/recebedadosclientenovo';

    // Preparar payload com dados do cliente
    const payload = {
      ...clientData,
      timestamp: new Date().toISOString(),
      event: 'client_created'
    };

    // Enviar para o webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Erro ao enviar webhook:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Resposta do webhook:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Webhook failed: ${response.status} ${response.statusText}`,
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const responseData = await response.text();
    console.log('Webhook enviado com sucesso:', responseData);

    return new Response(
      JSON.stringify({ success: true, response: responseData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no send-client-webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});