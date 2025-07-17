
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: webhookData } = await req.json()
    
    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2))

    // Validar se os dados necessários estão presentes
    if (!webhookData.numero || !webhookData.mensagem || !webhookData.user_id) {
      console.error('Dados obrigatórios ausentes:', { 
        numero: !!webhookData.numero, 
        mensagem: !!webhookData.mensagem, 
        user_id: !!webhookData.user_id 
      })
      throw new Error('Dados obrigatórios ausentes: numero, mensagem, user_id')
    }

    // Processar a mensagem usando a função do banco de dados com parâmetros essenciais
    console.log('Chamando process_webhook_message com parâmetros essenciais:', {
      p_user_id: webhookData.user_id,
      p_numero: webhookData.numero,
      p_mensagem: webhookData.mensagem,
      p_direcao: webhookData.direcao || false,
      p_data_hora: webhookData.data_hora || new Date().toISOString(),
      p_nome_contato: webhookData.nome_contato || null
    })

    const { data, error } = await supabaseClient
      .rpc('process_webhook_message', {
        p_user_id: webhookData.user_id,
        p_numero: webhookData.numero,
        p_mensagem: webhookData.mensagem,
        p_direcao: webhookData.direcao || false,
        p_data_hora: webhookData.data_hora || new Date().toISOString(),
        p_nome_contato: webhookData.nome_contato || null
      })

    if (error) {
      console.error('Erro ao processar mensagem:', error)
      throw error
    }

    console.log('Mensagem processada com sucesso:', data)

    // Verificar se a conversa foi criada/atualizada
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('*')
      .eq('user_id', webhookData.user_id)
      .or(`phone.eq.${webhookData.numero.replace(/[^0-9+]/g, '')},remote_jid.eq.${webhookData.numero},numero.eq.${webhookData.numero}`)
      .single()

    if (convError) {
      console.error('Erro ao verificar conversa:', convError)
    } else {
      console.log('Conversa encontrada/criada:', conversation)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: data,
        conversation_verified: !convError,
        processed_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro no webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
