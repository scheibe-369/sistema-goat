
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
    if (!webhookData.p_numero || !webhookData.p_user_id) {
      console.error('Dados obrigatórios ausentes:', { 
        numero: !!webhookData.p_numero, 
        user_id: !!webhookData.p_user_id 
      })
      throw new Error('Dados obrigatórios ausentes: numero, user_id')
    }

    // Processar a data/hora corretamente e converter para horário de Brasília
    let processedDateTime = webhookData.p_data_hora;
    
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
    let finalMediaUrl = webhookData.p_media_url;
    let finalMediaFilename = webhookData.p_media_filename;
    let finalMediaSize = webhookData.p_media_size;
    let finalMediaType = webhookData.p_media_type;

    // Converter tipos de mídia do WhatsApp para MIME types
    if (finalMediaType) {
      const mimeTypeMap: { [key: string]: string } = {
        'imageMessage': 'image/jpeg',
        'videoMessage': 'video/mp4',
        'audioMessage': 'audio/mpeg',
        'documentMessage': 'application/octet-stream'
      };
      
      if (mimeTypeMap[finalMediaType]) {
        finalMediaType = mimeTypeMap[finalMediaType];
      }
    }

    if (webhookData.p_media_url && webhookData.p_media_type) {
      if (!webhookData.p_media_key) {
        console.warn('Mídia detectada mas sem chave de descriptografia. URL será mantida como está.');
        console.log('Dados da mídia:', {
          media_url: webhookData.p_media_url,
          media_type: webhookData.p_media_type,
          media_filename: webhookData.p_media_filename,
          has_media_key: !!webhookData.p_media_key
        });
      } else {
      try {
        console.log('Processando mídia:', {
          media_url: webhookData.p_media_url,
          media_type: webhookData.p_media_type,
          media_type_converted: finalMediaType,
          media_key: webhookData.p_media_key ? 'presente' : 'ausente',
          media_key_length: webhookData.p_media_key ? webhookData.p_media_key.length : 0,
          filename: webhookData.p_media_filename
        });

        // Download e descriptografia da mídia
        const mediaResult = await downloadAndDecryptMedia({
          mediaUrl: webhookData.p_media_url,
          mediaKey: webhookData.p_media_key,
          mediaType: finalMediaType,
          filename: webhookData.p_media_filename || `media_${Date.now()}`,
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
    }

    // Preparar parâmetros da função incluindo campos de mídia com prefixo p_
    const functionParams = {
      p_user_id: webhookData.p_user_id,
      p_numero: webhookData.p_numero,
      p_mensagem: webhookData.p_mensagem || null,
      p_direcao: webhookData.p_direcao || false,
      p_data_hora: processedDateTime,
      p_nome_contato: webhookData.p_nome_contato || null,
      p_media_type: finalMediaType || null,
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
      .eq('user_id', webhookData.p_user_id)
      .or(`phone.eq.${webhookData.p_numero.replace(/[^0-9+]/g, '')},remote_jid.eq.${webhookData.p_numero},numero.eq.${webhookData.p_numero}`)
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
        media_processed: finalMediaUrl !== webhookData.p_media_url
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
  try {
    console.log('Iniciando descriptografia - dados recebidos:', {
      dataSize: encryptedData.byteLength,
      keyLength: mediaKeyBase64.length
    });

    // Decodificar a chave base64
    const mediaKey = Uint8Array.from(atob(mediaKeyBase64), c => c.charCodeAt(0));
    console.log('Chave decodificada, tamanho:', mediaKey.length);
    
    // Importar a chave para HKDF
    const hkdfKey = await crypto.subtle.importKey(
      'raw',
      mediaKey,
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    // Derivar chave AES de 32 bytes para AES-256
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

    const data = new Uint8Array(encryptedData);
    console.log('Tentando descriptografar com AES-GCM...');
    
    // Primeira tentativa: IV nos primeiros 12 bytes (padrão GCM)
    try {
      const iv = data.slice(0, 12);
      const ciphertext = data.slice(12, -16); // Remove IV e tag
      const tag = data.slice(-16); // Últimos 16 bytes são a tag
      
      // Combinar ciphertext e tag para GCM
      const combined = new Uint8Array(ciphertext.length + tag.length);
      combined.set(ciphertext);
      combined.set(tag, ciphertext.length);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        combined
      );
      
      console.log('Descriptografia AES-GCM bem-sucedida (IV 12 bytes)');
      return decrypted;
    } catch (error) {
      console.log('Falha com IV 12 bytes:', error.message);
    }

    // Segunda tentativa: IV nos primeiros 16 bytes
    try {
      const iv = data.slice(0, 16);
      const ciphertext = data.slice(16);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        ciphertext
      );
      
      console.log('Descriptografia AES-GCM bem-sucedida (IV 16 bytes)');
      return decrypted;
    } catch (error) {
      console.log('Falha com IV 16 bytes:', error.message);
    }

    // Terceira tentativa: Sem IV separado
    try {
      const iv = new Uint8Array(12); // IV zeros
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encryptedData
      );
      
      console.log('Descriptografia AES-GCM bem-sucedida (IV zeros)');
      return decrypted;
    } catch (error) {
      console.log('Falha com IV zeros:', error.message);
    }

    // Fallback: Tentar AES-CBC
    console.log('Tentando AES-CBC como fallback...');
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
    
    console.log('Descriptografia AES-CBC bem-sucedida');
    return decrypted;

  } catch (error) {
    console.error('Erro completo na descriptografia:', error);
    throw new Error(`Falha na descriptografia: ${error.message}`);
  }
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
