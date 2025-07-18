
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
    if (!webhookData.numero || !webhookData.user_id) {
      console.error('Dados obrigatórios ausentes:', { 
        numero: !!webhookData.numero, 
        user_id: !!webhookData.user_id 
      })
      throw new Error('Dados obrigatórios ausentes: numero, user_id')
    }

    // Processar a data/hora corretamente e converter para horário de Brasília
    let processedDateTime = webhookData.data_hora;
    
    if (!processedDateTime) {
      // Se não há data_hora no webhook, usar horário atual do Brasil
      const now = new Date();
      const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
      processedDateTime = brasiliaTime.toISOString();
    } else {
      // Garantir que a data está sendo tratada como horário de Brasília
      try {
        const date = new Date(processedDateTime);
        if (isNaN(date.getTime())) {
          throw new Error('Data inválida');
        }
        
        // Se a data não tem informação de timezone, assumir que é horário de Brasília
        // e converter para UTC para armazenamento
        if (!processedDateTime.includes('T') || (!processedDateTime.includes('Z') && !processedDateTime.includes('+') && !processedDateTime.includes('-'))) {
          // Data sem timezone - assumir como horário de Brasília e converter para UTC
          const brasiliaDate = new Date(processedDateTime + ' GMT-0300');
          processedDateTime = brasiliaDate.toISOString();
        } else {
          // Data já tem timezone - usar como está
          processedDateTime = date.toISOString();
        }
      } catch (error) {
        console.warn('Erro ao processar data_hora, usando horário atual do Brasil:', processedDateTime, error);
        const now = new Date();
        const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
        processedDateTime = brasiliaTime.toISOString();
      }
    }

    // Processar mídia se existir
    let finalMediaUrl = webhookData.media_url;
    let finalMediaFilename = webhookData.media_filename;
    let finalMediaSize = webhookData.media_size;

    if (webhookData.media_url && webhookData.media_type && webhookData.mediaKey) {
      try {
        console.log('Processando mídia:', {
          media_url: webhookData.media_url,
          media_type: webhookData.media_type,
          mediaKey: webhookData.mediaKey ? 'presente' : 'ausente'
        });

        // Download e descriptografia da mídia
        const mediaResult = await downloadAndDecryptMedia({
          mediaUrl: webhookData.media_url,
          mediaKey: webhookData.mediaKey,
          mediaType: webhookData.media_type,
          filename: webhookData.media_filename || `media_${Date.now()}`,
          supabaseClient
        });

        if (mediaResult.success) {
          finalMediaUrl = mediaResult.publicUrl;
          finalMediaFilename = mediaResult.filename;
          finalMediaSize = mediaResult.size;
          console.log('Mídia processada com sucesso:', {
            publicUrl: finalMediaUrl,
            filename: finalMediaFilename,
            size: finalMediaSize
          });
        } else {
          console.warn('Falha ao processar mídia:', mediaResult.error);
          // Manter URL original se a descriptografia falhar
        }
      } catch (error) {
        console.error('Erro ao processar mídia:', error);
        // Continuar com URL original se houver erro
      }
    }

    // Preparar parâmetros da função incluindo campos de mídia com prefixo p_
    const functionParams = {
      p_user_id: webhookData.user_id,
      p_numero: webhookData.numero,
      p_mensagem: webhookData.mensagem || null,
      p_direcao: webhookData.direcao || false,
      p_data_hora: processedDateTime,
      p_nome_contato: webhookData.nome_contato || null,
      p_media_type: webhookData.media_type || null,
      p_media_url: finalMediaUrl || null,
      p_media_filename: finalMediaFilename || null,
      p_media_size: finalMediaSize || null
    }

    console.log('Chamando process_webhook_message com parâmetros:', functionParams)

    const { data, error } = await supabaseClient
      .rpc('process_webhook_message', functionParams)

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
        processed_at: new Date().toISOString(),
        media_processed: finalMediaUrl !== webhookData.media_url
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

// Função para download e descriptografia de mídia
async function downloadAndDecryptMedia({
  mediaUrl,
  mediaKey,
  mediaType,
  filename,
  supabaseClient
}: {
  mediaUrl: string;
  mediaKey: string;
  mediaType: string;
  filename: string;
  supabaseClient: any;
}) {
  try {
    console.log('Iniciando download da mídia:', mediaUrl);
    
    // Download do arquivo criptografado
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Falha no download: ${response.status} ${response.statusText}`);
    }

    const encryptedData = await response.arrayBuffer();
    console.log('Arquivo baixado, tamanho:', encryptedData.byteLength);

    // Descriptografar usando AES-GCM
    const decryptedData = await decryptWhatsAppMedia(encryptedData, mediaKey);
    console.log('Arquivo descriptografado, tamanho:', decryptedData.byteLength);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = getFileExtension(mediaType);
    const uniqueFilename = `${timestamp}_${filename}${extension}`;
    const filePath = `media/${uniqueFilename}`;

    // Upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('whatsapp-media')
      .upload(filePath, decryptedData, {
        contentType: mediaType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw uploadError;
    }

    console.log('Upload realizado com sucesso:', uploadData);

    // Obter URL pública
    const { data: urlData } = supabaseClient.storage
      .from('whatsapp-media')
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      filename: uniqueFilename,
      size: decryptedData.byteLength,
      path: filePath
    };

  } catch (error) {
    console.error('Erro ao processar mídia:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para descriptografar mídia do WhatsApp
async function decryptWhatsAppMedia(encryptedData: ArrayBuffer, mediaKeyBase64: string): Promise<ArrayBuffer> {
  // Decodificar a chave base64
  const mediaKey = Uint8Array.from(atob(mediaKeyBase64), c => c.charCodeAt(0));
  
  // WhatsApp usa HKDF para derivar chaves
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    mediaKey,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  // Derivar chave AES (32 bytes) e IV (16 bytes)
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32), // Salt vazio
      info: new TextEncoder().encode('WhatsApp Media Keys')
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Para WhatsApp, o IV geralmente são os primeiros 16 bytes ou um valor fixo
  // Vamos tentar diferentes abordagens
  const data = new Uint8Array(encryptedData);
  
  // Primeira tentativa: IV nos primeiros 16 bytes
  try {
    const iv = data.slice(0, 16);
    const ciphertext = data.slice(16);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ciphertext
    );
    
    return decrypted;
  } catch (error) {
    console.log('Primeira tentativa de descriptografia falhou, tentando abordagem alternativa');
  }

  // Segunda tentativa: sem IV separado (WhatsApp às vezes usa abordagem diferente)
  try {
    const iv = new Uint8Array(16); // IV zeros
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encryptedData
    );
    
    return decrypted;
  } catch (error) {
    console.log('Segunda tentativa falhou, tentando AES-CBC');
  }

  // Terceira tentativa: AES-CBC (fallback)
  const cbcKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32),
      info: new TextEncoder().encode('WhatsApp Media Keys')
    },
    hkdfKey,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );

  const iv = data.slice(0, 16);
  const ciphertext = data.slice(16);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cbcKey,
    ciphertext
  );
  
  return decrypted;
}

// Função para obter extensão do arquivo baseada no tipo MIME
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'audio/mpeg': '.mp3',
    'audio/ogg': '.ogg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'application/pdf': '.pdf',
    'text/plain': '.txt'
  };
  
  return extensions[mimeType] || '';
}
