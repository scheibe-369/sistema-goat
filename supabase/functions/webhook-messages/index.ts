
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

    // Processar mídia se existir - NÃO inicializar com URL do WhatsApp
    let finalMediaUrl = null; // Só será preenchida se descriptografia for bem-sucedida
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
          console.log('✅ Mídia processada com sucesso:', {
            publicUrl: finalMediaUrl,
            filename: finalMediaFilename,
            size: finalMediaSize
          });
        } else {
          console.error('❌ FALHA NA DESCRIPTOGRAFIA - NÃO salvará URL do WhatsApp:', mediaResult.error);
          throw new Error(`Falha na descriptografia da mídia: ${mediaResult.error}`);
        }
      } catch (error) {
        console.error('❌ ERRO CRÍTICO na descriptografia - NÃO salvará URL do WhatsApp:', error);
        throw new Error(`Erro crítico na descriptografia: ${error.message}`);
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
  console.log('=== INICIANDO DESCRIPTOGRAFIA WHATSAPP ===');
  console.log('Tamanho dos dados criptografados:', encryptedData.byteLength);
  console.log('Chave base64 (primeiros 20 chars):', mediaKeyBase64.substring(0, 20) + '...');

  try {
    // Decodificar a chave base64
    const mediaKey = Uint8Array.from(atob(mediaKeyBase64), c => c.charCodeAt(0));
    console.log('Chave decodificada - tamanho:', mediaKey.length, 'bytes');
    
    if (mediaKey.length !== 32) {
      throw new Error(`Chave deve ter 32 bytes, recebido: ${mediaKey.length}`);
    }
    
    const encryptedBytes = new Uint8Array(encryptedData);
    
    if (encryptedBytes.length < 32) {
      throw new Error('Arquivo muito pequeno para ser mídia do WhatsApp');
    }
    
    console.log('Formato do arquivo detectado - tamanho:', encryptedBytes.length);
    
    // WhatsApp Protocol: O arquivo tem estrutura específica
    // Para imagens: HKDF-SHA256 derive keys + AES-CBC ou AES-CTR
    
    // 1. Derivar chaves usando HKDF conforme protocolo WhatsApp
    const derivedKeys = await deriveWhatsAppKeys(mediaKey, 'image');
    
    // 2. Tentar algoritmos de descriptografia do WhatsApp em ordem
    const algorithms = [
      { name: 'AES-CBC', key: derivedKeys.cipherKey },
      { name: 'AES-CTR', key: derivedKeys.cipherKey },
      { name: 'AES-GCM', key: derivedKeys.cipherKey }
    ];
    
    for (const algo of algorithms) {
      try {
        console.log(`🔓 Tentando ${algo.name}...`);
        let decrypted;
        
        switch (algo.name) {
          case 'AES-CBC':
            decrypted = await decryptWithAESCBC(encryptedBytes, algo.key);
            break;
          case 'AES-CTR':
            decrypted = await decryptWithAESCTR(encryptedBytes, algo.key);
            break;
          case 'AES-GCM':
            decrypted = await decryptWithAESGCM(encryptedBytes, algo.key);
            break;
        }
        
        if (decrypted && isValidImageFile(new Uint8Array(decrypted))) {
          console.log(`✅ DESCRIPTOGRAFIA BEM-SUCEDIDA com ${algo.name}!`);
          console.log('Tamanho do arquivo descriptografado:', decrypted.byteLength);
          return decrypted;
        } else {
          console.log(`❌ ${algo.name} falhou - arquivo inválido`);
        }
        
      } catch (error) {
        console.log(`❌ ${algo.name} falhou:`, error.message);
      }
    }
    
    throw new Error('Todas as tentativas de descriptografia falharam');
    
  } catch (error) {
    console.error('❌ ERRO na descriptografia:', error);
    throw error;
  }
}

// Função para derivar chaves conforme protocolo WhatsApp
async function deriveWhatsAppKeys(mediaKey: Uint8Array, mediaType: string): Promise<{cipherKey: Uint8Array, macKey: Uint8Array}> {
  // Implementar HKDF conforme especificação WhatsApp
  const info = mediaType === 'image' ? 'WhatsApp Image Keys' : 'WhatsApp Media Keys';
  
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    mediaKey,
    'HKDF',
    false,
    ['deriveKey']
  );
  
  // Derivar 64 bytes total (32 para cipher + 32 para MAC)
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32), // 32 bytes de zeros como salt
      info: new TextEncoder().encode(info)
    },
    hkdfKey,
    { name: 'AES-CBC', length: 512 }, // 64 bytes = 512 bits
    true,
    ['encrypt', 'decrypt']
  );
  
  const derivedBytes = new Uint8Array(await crypto.subtle.exportKey('raw', derivedKey));
  
  return {
    cipherKey: derivedBytes.slice(0, 32), // Primeiros 32 bytes para cipher
    macKey: derivedBytes.slice(32, 64)    // Próximos 32 bytes para MAC
  };
}

// Função para descriptografia AES-CBC (formato WhatsApp)
async function decryptWithAESCBC(encryptedData: Uint8Array, cipherKey: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    // WhatsApp format: IV (16 bytes) + encrypted data + MAC (32 bytes no final)
    if (encryptedData.length < 48) { // Mínimo: 16 (IV) + algum dado + 32 (MAC)
      throw new Error('Dados muito pequenos para formato WhatsApp');
    }
    
    const iv = encryptedData.slice(0, 16);
    const ciphertext = encryptedData.slice(16, -32); // Remove IV no início e MAC no final
    const mac = encryptedData.slice(-32);
    
    console.log(`AES-CBC: IV=${iv.length}B, data=${ciphertext.length}B, MAC=${mac.length}B`);
    
    const key = await crypto.subtle.importKey(
      'raw',
      cipherKey,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      ciphertext
    );
    
    return decrypted;
  } catch (error) {
    console.log('AES-CBC erro:', error.message);
    return null;
  }
}

// Função para descriptografia AES-CTR (alternativa WhatsApp)
async function decryptWithAESCTR(encryptedData: Uint8Array, cipherKey: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    // Formato CTR: IV (16 bytes) + dados criptografados
    if (encryptedData.length < 32) {
      throw new Error('Dados muito pequenos para AES-CTR');
    }
    
    const iv = encryptedData.slice(0, 16);
    const ciphertext = encryptedData.slice(16);
    
    console.log(`AES-CTR: IV=${iv.length}B, data=${ciphertext.length}B`);
    
    const key = await crypto.subtle.importKey(
      'raw',
      cipherKey,
      { name: 'AES-CTR' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { 
        name: 'AES-CTR', 
        counter: iv,
        length: 128
      },
      key,
      ciphertext
    );
    
    return decrypted;
  } catch (error) {
    console.log('AES-CTR erro:', error.message);
    return null;
  }
}

// Função para descriptografia AES-GCM (alternativa WhatsApp)
async function decryptWithAESGCM(encryptedData: Uint8Array, cipherKey: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    // Formato GCM: IV (12 bytes) + dados + tag (16 bytes)
    if (encryptedData.length < 28) { // 12 + mínimo + 16
      throw new Error('Dados muito pequenos para AES-GCM');
    }
    
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);
    
    console.log(`AES-GCM: IV=${iv.length}B, data=${ciphertext.length}B`);
    
    const key = await crypto.subtle.importKey(
      'raw',
      cipherKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    return decrypted;
  } catch (error) {
    console.log('AES-GCM erro:', error.message);
    return null;
  }
}

// Função para validar se é um arquivo de imagem válido
function isValidImageFile(data: Uint8Array): boolean {
  if (data.length < 4) return false;
  
  // Verificar assinaturas de arquivos de imagem
  const signatures = [
    [0xFF, 0xD8, 0xFF], // JPEG
    [0x89, 0x50, 0x4E, 0x47], // PNG
    [0x47, 0x49, 0x46], // GIF
    [0x52, 0x49, 0x46, 0x46] // WEBP (RIFF)
  ];
  
  for (const sig of signatures) {
    if (data.slice(0, sig.length).every((byte, i) => byte === sig[i])) {
      console.log(`✅ Arquivo válido detectado: ${getImageType(sig)}`);
      return true;
    }
  }
  
  console.log('❌ Assinatura de arquivo não reconhecida:', 
    Array.from(data.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));
  return false;
}

// Função auxiliar para identificar tipo de imagem
function getImageType(signature: number[]): string {
  const types: { [key: string]: string } = {
    'FF,D8,FF': 'JPEG',
    '89,50,4E,47': 'PNG', 
    '47,49,46': 'GIF',
    '52,49,46,46': 'WEBP'
  };
  
  const key = signature.map(b => b.toString(16).toUpperCase()).join(',');
  return types[key] || 'Desconhecido';
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
