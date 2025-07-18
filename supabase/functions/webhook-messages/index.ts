
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // ========== LOG OBRIGATÓRIO DE ENTRADA ==========
  console.log('🚀 EDGE FUNCTION INICIADA - webhook-messages', new Date().toISOString());
  console.log('🔍 Método:', req.method);
  console.log('🔍 URL:', req.url);
  console.log('🔍 Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS OPTIONS - retornando ok');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const webhookData = await req.json()
    
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
    
    // Validar se o arquivo descriptografado é válido
    const decryptedArray = new Uint8Array(decryptedData);
    const first16Bytes = Array.from(decryptedArray.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log('Primeiros 16 bytes (hex):', first16Bytes);
    
    // Verificar se é uma imagem JPEG válida (deve começar com FF D8)
    if (mediaType === 'image/jpeg') {
      const isValidJpeg = decryptedArray[0] === 0xFF && decryptedArray[1] === 0xD8;
      console.log('É JPEG válido?', isValidJpeg);
      if (!isValidJpeg) {
        console.error('❌ ARQUIVO DESCRIPTOGRAFADO NÃO É UM JPEG VÁLIDO!');
      }
    }
    
    // Converter para base64 os primeiros 32 bytes para debug
    const first32Base64 = btoa(String.fromCharCode(...decryptedArray.slice(0, 32)));
    console.log('Primeiros 32 bytes em base64:', first32Base64);

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
    
    // Verificar se o arquivo foi salvo corretamente fazendo um download de teste
    console.log('Testando URL pública:', urlData.publicUrl);
    try {
      const testResponse = await fetch(urlData.publicUrl);
      console.log('Status do arquivo salvo:', testResponse.status);
      console.log('Content-Type retornado:', testResponse.headers.get('content-type'));
      console.log('Content-Length:', testResponse.headers.get('content-length'));
      
      if (testResponse.ok) {
        const testData = await testResponse.arrayBuffer();
        console.log('Tamanho do arquivo no storage:', testData.byteLength);
        
        // Verificar se ainda é um JPEG válido
        if (mediaType === 'image/jpeg') {
          const testArray = new Uint8Array(testData);
          const isStillValidJpeg = testArray[0] === 0xFF && testArray[1] === 0xD8;
          console.log('Arquivo no storage é JPEG válido?', isStillValidJpeg);
          
          if (!isStillValidJpeg) {
            console.error('❌ ARQUIVO NO STORAGE NÃO É UM JPEG VÁLIDO!');
            const storageFirst16 = Array.from(testArray.slice(0, 16))
              .map(b => b.toString(16).padStart(2, '0')).join(' ');
            console.log('Primeiros 16 bytes do arquivo no storage:', storageFirst16);
          }
        }
      } else {
        console.error('❌ ERRO ao acessar arquivo no storage:', testResponse.status, testResponse.statusText);
      }
    } catch (testError) {
      console.error('❌ ERRO no teste do arquivo salvo:', testError);
    }

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
  console.log('=== INICIANDO DESCRIPTOGRAFIA ===');
  console.log('Tamanho dos dados criptografados:', encryptedData.byteLength);
  console.log('Chave base64 (primeiros 20 chars):', mediaKeyBase64.substring(0, 20) + '...');

  try {
    // Decodificar a chave base64
    const mediaKey = Uint8Array.from(atob(mediaKeyBase64), c => c.charCodeAt(0));
    console.log('Chave decodificada - tamanho:', mediaKey.length, 'bytes');
    
    if (mediaKey.length !== 32) {
      throw new Error(`Chave deve ter 32 bytes, recebido: ${mediaKey.length}`);
    }
    
    const data = new Uint8Array(encryptedData);
    
    if (data.length < 32) {
      throw new Error('Arquivo muito pequeno para ser mídia do WhatsApp');
    }
    
    // Implementar HKDF para derivar chaves específicas do WhatsApp
    // O WhatsApp usa: HKDF-SHA256 com salt específico para derivar chaves
    console.log('Derivando chaves usando HKDF...');
    
    // Labels específicos do WhatsApp
    const mediaKeyInfos = [
      'WhatsApp Image Keys',
      'WhatsApp Media Keys', 
      'WhatsApp Video Keys'
    ];
    
    for (const info of mediaKeyInfos) {
      try {
        console.log(`Tentando HKDF com info: "${info}"`);
        
        // Derivar chave usando HKDF
        const derivedKey = await deriveHKDFKey(mediaKey, info);
        
        // Tentar descriptografia com AES-CBC (modo mais comum do WhatsApp)
        const decrypted = await tryDecryptAESCBC(data, derivedKey);
        if (decrypted) {
          console.log(`✅ DESCRIPTOGRAFIA BEM-SUCEDIDA com HKDF + AES-CBC usando "${info}"`);
          return decrypted;
        }
        
        // Tentar descriptografia com AES-GCM
        const decryptedGCM = await tryDecryptAESGCM(data, derivedKey);
        if (decryptedGCM) {
          console.log(`✅ DESCRIPTOGRAFIA BEM-SUCEDIDA com HKDF + AES-GCM usando "${info}"`);
          return decryptedGCM;
        }
        
      } catch (error) {
        console.log(`Falha com HKDF "${info}":`, error.message);
      }
    }
    
    // Fallback: tentar descriptografia direta sem HKDF
    console.log('Tentando descriptografia direta sem HKDF...');
    
    // Tentar AES-CBC direto
    const directCBC = await tryDecryptAESCBC(data, mediaKey);
    if (directCBC) {
      console.log('✅ DESCRIPTOGRAFIA BEM-SUCEDIDA com AES-CBC direto');
      return directCBC;
    }
    
    // Tentar AES-GCM direto
    const directGCM = await tryDecryptAESGCM(data, mediaKey);
    if (directGCM) {
      console.log('✅ DESCRIPTOGRAFIA BEM-SUCEDIDA com AES-GCM direto');
      return directGCM;
    }
    
    throw new Error('Todas as tentativas de descriptografia falharam');
    
  } catch (error) {
    console.error('❌ ERRO COMPLETO na descriptografia:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Função para derivar chave usando HKDF-SHA256
async function deriveHKDFKey(inputKey: Uint8Array, info: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    inputKey,
    'HKDF',
    false,
    ['deriveKey']
  );
  
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(), // Salt vazio como usado pelo WhatsApp
      info: new TextEncoder().encode(info)
    },
    key,
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  return new Uint8Array(exported);
}

// Função para tentar descriptografia AES-CBC
async function tryDecryptAESCBC(data: Uint8Array, keyBytes: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
    
    // O IV são os primeiros 16 bytes
    const iv = data.slice(0, 16);
    const ciphertext = data.slice(16);
    
    console.log(`Tentando AES-CBC: IV=${iv.length} bytes, ciphertext=${ciphertext.length} bytes`);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      ciphertext
    );
    
    // Verificar se o resultado parece válido
    const result = new Uint8Array(decrypted);
    if (result.length > 0 && (result[0] === 0xFF || result[0] === 0x89)) { // JPEG ou PNG
      return decrypted;
    }
    
    return null;
  } catch (error) {
    console.log('AES-CBC falhou:', error.message);
    return null;
  }
}

// Função para tentar descriptografia AES-GCM
async function tryDecryptAESGCM(data: Uint8Array, keyBytes: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Tentar diferentes tamanhos de IV/tag
    const possibleIVSizes = [12, 16];
    
    for (const ivSize of possibleIVSizes) {
      if (data.length < ivSize + 16) continue; // Precisa de espaço para IV + tag
      
      const iv = data.slice(0, ivSize);
      const ciphertext = data.slice(ivSize);
      
      console.log(`Tentando AES-GCM: IV=${ivSize} bytes, ciphertext=${ciphertext.length} bytes`);
      
      try {
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          ciphertext
        );
        
        // Verificar se o resultado parece válido
        const result = new Uint8Array(decrypted);
        if (result.length > 0 && (result[0] === 0xFF || result[0] === 0x89)) { // JPEG ou PNG
          return decrypted;
        }
      } catch (gcmError) {
        console.log(`AES-GCM com IV ${ivSize} falhou:`, gcmError.message);
      }
    }
    
    return null;
  } catch (error) {
    console.log('AES-GCM falhou:', error.message);
    return null;
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
