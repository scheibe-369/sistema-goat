
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

        const downloadResult = await downloadAndDecryptMedia(
          webhookData.p_media_url,
          webhookData.p_media_key,
          finalMediaType,
          finalMediaFilename
        );

        if (downloadResult.success) {
          finalMediaUrl = downloadResult.publicUrl;
          finalMediaFilename = downloadResult.filename;
          finalMediaSize = downloadResult.size;
          console.log('✅ Mídia processada com sucesso:', {
            publicUrl: finalMediaUrl,
            filename: finalMediaFilename,
            size: finalMediaSize
          });
        } else {
          console.error('❌ FALHA NA DESCRIPTOGRAFIA - NÃO salvará URL do WhatsApp:', downloadResult.error);
          throw new Error(`Falha na descriptografia da mídia: ${downloadResult.error}`);
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
async function downloadAndDecryptMedia(
  mediaUrl: string,
  mediaKey: string,
  mediaType: string,
  filename: string
) {
  try {
    console.log('Iniciando download da mídia:', mediaUrl);
    
    // Download do arquivo criptografado
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Falha no download: ${response.status} ${response.statusText}`);
    }

    const encryptedData = await response.arrayBuffer();
    console.log('Arquivo baixado, tamanho:', encryptedData.byteLength);

    // Descriptografar usando a chave do WhatsApp
    console.log('Tamanho dos dados criptografados:', encryptedData.byteLength);
    console.log('Primeiros 16 bytes do arquivo criptografado:', Array.from(new Uint8Array(encryptedData).slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    const decryptedData = await decryptWhatsAppMedia(encryptedData, mediaKey, mediaType);
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

    // Criar cliente Supabase para upload
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
async function decryptWhatsAppMedia(encryptedData: ArrayBuffer, mediaKeyBase64: string, mediaType?: string): Promise<ArrayBuffer> {
  console.log('=== INICIANDO DESCRIPTOGRAFIA WHATSAPP ===');
  console.log('Tamanho dos dados criptografados:', encryptedData.byteLength);
  console.log('Tipo de mídia:', mediaType);
  console.log('Chave base64 (primeiros 20 chars):', mediaKeyBase64.substring(0, 20) + '...');

  try {
    // Decodificar a chave base64
    const mediaKey = Uint8Array.from(atob(mediaKeyBase64), c => c.charCodeAt(0));
    console.log('Chave decodificada - tamanho:', mediaKey.length, 'bytes');
    
    if (mediaKey.length !== 32) {
      throw new Error(`Chave deve ter 32 bytes, recebido: ${mediaKey.length}`);
    }
    
    const encryptedBytes = new Uint8Array(encryptedData);
    console.log('Arquivo criptografado - tamanho:', encryptedBytes.length, 'bytes');
    
    // Debug: mostrar primeiros bytes do arquivo criptografado
    const firstBytes = Array.from(encryptedBytes.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log('Primeiros 16 bytes do arquivo criptografado:', firstBytes);
    
    // WhatsApp usa HKDF-SHA256 para derivar chaves específicas por tipo de mídia
    const result = await tryWhatsAppDecryption(encryptedBytes, mediaKey, mediaType);
    
    if (result) {
      console.log('✅ DESCRIPTOGRAFIA BEM-SUCEDIDA!');
      return result;
    }
    
    throw new Error('Todas as tentativas de descriptografia falharam - formato não reconhecido');
    
  } catch (error) {
    console.error('❌ ERRO na descriptografia:', error);
    throw error;
  }
}

// Implementação correta do protocolo WhatsApp para descriptografia
async function tryWhatsAppDecryption(encryptedData: Uint8Array, mediaKey: Uint8Array, mediaType?: string): Promise<ArrayBuffer | null> {
  try {
    // WhatsApp usa HKDF com diferentes infos baseado no tipo de mídia
    const getHKDFInfo = (type?: string): string => {
      if (type?.includes('image')) return 'WhatsApp Image Keys';
      if (type?.includes('video')) return 'WhatsApp Video Keys';  
      if (type?.includes('audio')) return 'WhatsApp Audio Keys';
      if (type?.includes('document')) return 'WhatsApp Document Keys';
      return 'WhatsApp Media Keys';
    };
    
    const info = getHKDFInfo(mediaType);
    console.log('🔑 Usando HKDF info:', info);
    
    // Derivar chaves usando HKDF-SHA256
    const hkdfKey = await crypto.subtle.importKey('raw', mediaKey, 'HKDF', false, ['deriveKey']);
    
    // Derivar 80 bytes: 32 para cipher, 32 para MAC, 16 para IV
    const derivedKeyMaterial = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32), // Salt vazio de 32 bytes
        info: new TextEncoder().encode(info)
      },
      hkdfKey,
      { name: 'AES-CBC', length: 640 }, // 640 bits = 80 bytes
      true,
      ['encrypt', 'decrypt']
    );
    
    const derivedBytes = new Uint8Array(await crypto.subtle.exportKey('raw', derivedKeyMaterial));
    const cipherKey = derivedBytes.slice(0, 32);
    const macKey = derivedBytes.slice(32, 64);
    const iv = derivedBytes.slice(64, 80);
    
    console.log('🔑 Chaves derivadas:', {
      cipher: cipherKey.length,
      mac: macKey.length, 
      iv: iv.length
    });
    
    // Estrutura do arquivo WhatsApp: [dados_criptografados][MAC_10_bytes]
    if (encryptedData.length < 10) {
      throw new Error('Arquivo muito pequeno para formato WhatsApp');
    }
    
    const ciphertext = encryptedData.slice(0, -10);
    const fileMac = encryptedData.slice(-10);
    
    console.log('📦 Estrutura do arquivo:', {
      ciphertext: ciphertext.length,
      mac: fileMac.length
    });
    
    // Verificar MAC usando HMAC-SHA256 (primeiros 10 bytes)
    const macKeyForHmac = await crypto.subtle.importKey('raw', macKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const computedMac = new Uint8Array(await crypto.subtle.sign('HMAC', macKeyForHmac, ciphertext));
    const expectedMac = computedMac.slice(0, 10);
    
    console.log('🔐 Verificação MAC:', {
      arquivo: Array.from(fileMac).map(b => b.toString(16).padStart(2, '0')).join(''),
      calculado: Array.from(expectedMac).map(b => b.toString(16).padStart(2, '0')).join('')
    });
    
    // Verificar se MAC confere
    const macValid = fileMac.every((byte, i) => byte === expectedMac[i]);
    if (!macValid) {
      console.warn('⚠️ MAC não confere, mas continuando...');
    }
    
    // Descriptografar usando AES-CBC
    const key = await crypto.subtle.importKey('raw', cipherKey, { name: 'AES-CBC' }, false, ['decrypt']);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      ciphertext
    );
    
    const result = new Uint8Array(decrypted);
    console.log('📤 Resultado descriptografia:', {
      tamanho: result.length,
      primeiros4bytes: Array.from(result.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    });
    
    // Validar o resultado baseado no tipo de mídia
    if (isValidMediaFile(result, mediaType)) {
      return decrypted;
    }
    
    return null;
    
  } catch (error) {
    console.log('❌ WhatsApp decryption falhou:', error.message);
    return null;
  }
}

// Implementação HKDF + AES para WhatsApp
async function tryHKDFDecryption(encryptedData: Uint8Array, mediaKey: Uint8Array, mediaType: string): Promise<ArrayBuffer | null> {
  try {
    // Derivar chaves usando HKDF conforme protocolo WhatsApp
    const info = mediaType === 'image' ? 'WhatsApp Image Keys' : 'WhatsApp Media Keys';
    
    const hkdfKey = await crypto.subtle.importKey('raw', mediaKey, 'HKDF', false, ['deriveKey']);
    
    // Derivar 64 bytes: 32 para cipher + 32 para MAC
    const derivedKeyMaterial = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32), // 32 bytes zero como salt
        info: new TextEncoder().encode(info)
      },
      hkdfKey,
      { name: 'AES-CBC', length: 512 }, // 512 bits = 64 bytes
      true,
      ['encrypt', 'decrypt']
    );
    
    const derivedBytes = new Uint8Array(await crypto.subtle.exportKey('raw', derivedKeyMaterial));
    const cipherKey = derivedBytes.slice(0, 32);
    
    // Tentar descriptografia com chave derivada
    return await tryDirectAESCBC(encryptedData, cipherKey);
  } catch (error) {
    console.log('HKDF erro:', error.message);
    return null;
  }
}

// AES-CBC direto (formato simplificado)
async function tryDirectAESCBC(encryptedData: Uint8Array, cipherKey: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    console.log(`  AES-CBC: arquivo=${encryptedData.length}B, chave=${cipherKey.length}B`);
    
    if (encryptedData.length < 32) {
      throw new Error('Arquivo muito pequeno para AES-CBC');
    }
    
    const key = await crypto.subtle.importKey('raw', cipherKey, { name: 'AES-CBC' }, false, ['decrypt']);
    
    // Tentar diferentes estruturas de arquivo
    const attempts = [
      // Formato 1: IV (16) + dados + MAC (32) no final
      { iv: encryptedData.slice(0, 16), data: encryptedData.slice(16, -32) },
      // Formato 2: IV (16) + dados (sem MAC)
      { iv: encryptedData.slice(0, 16), data: encryptedData.slice(16) },
      // Formato 3: Dados + IV no final
      { iv: encryptedData.slice(-16), data: encryptedData.slice(0, -16) }
    ];
    
    for (const [index, attempt] of attempts.entries()) {
      try {
        console.log(`    Tentativa ${index + 1}: IV=${attempt.iv.length}B, dados=${attempt.data.length}B`);
        
        if (attempt.data.length === 0) continue;
        
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-CBC', iv: attempt.iv },
          key,
          attempt.data
        );
        
        const result = new Uint8Array(decrypted);
        console.log(`    Resultado: ${result.length} bytes, primeiro byte: 0x${result[0]?.toString(16) || '00'}`);
        
        if (result.length > 0) {
          return decrypted;
        }
      } catch (err) {
        console.log(`    Tentativa ${index + 1} falhou:`, err.message);
      }
    }
    
    return null;
  } catch (error) {
    console.log('AES-CBC direto erro:', error.message);
    return null;
  }
}

// AES-GCM para WhatsApp
async function tryAESGCMDecryption(encryptedData: Uint8Array, cipherKey: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    console.log(`  AES-GCM: arquivo=${encryptedData.length}B`);
    
    const key = await crypto.subtle.importKey('raw', cipherKey, { name: 'AES-GCM' }, false, ['decrypt']);
    
    // Tentar diferentes tamanhos de IV
    const ivSizes = [12, 16];
    
    for (const ivSize of ivSizes) {
      if (encryptedData.length < ivSize + 16) continue; // IV + mínimo de dados
      
      try {
        const iv = encryptedData.slice(0, ivSize);
        const ciphertext = encryptedData.slice(ivSize);
        
        console.log(`    GCM IV=${ivSize}: dados=${ciphertext.length}B`);
        
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          ciphertext
        );
        
        const result = new Uint8Array(decrypted);
        if (result.length > 0) {
          console.log(`    GCM sucesso: ${result.length} bytes`);
          return decrypted;
        }
      } catch (err) {
        console.log(`    GCM IV=${ivSize} falhou:`, err.message);
      }
    }
    
    return null;
  } catch (error) {
    console.log('AES-GCM erro:', error.message);
    return null;
  }
}

// AES-CTR para WhatsApp
async function tryAESCTRDecryption(encryptedData: Uint8Array, cipherKey: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    console.log(`  AES-CTR: arquivo=${encryptedData.length}B`);
    
    if (encryptedData.length < 32) {
      throw new Error('Arquivo muito pequeno para AES-CTR');
    }
    
    const key = await crypto.subtle.importKey('raw', cipherKey, { name: 'AES-CTR' }, false, ['decrypt']);
    
    // Tentar diferentes posições do IV
    const attempts = [
      // IV no início
      { iv: encryptedData.slice(0, 16), data: encryptedData.slice(16) },
      // IV no final  
      { iv: encryptedData.slice(-16), data: encryptedData.slice(0, -16) }
    ];
    
    for (const [index, attempt] of attempts.entries()) {
      try {
        console.log(`    CTR tentativa ${index + 1}: IV=${attempt.iv.length}B, dados=${attempt.data.length}B`);
        
        const decrypted = await crypto.subtle.decrypt(
          { 
            name: 'AES-CTR', 
            counter: attempt.iv,
            length: 128
          },
          key,
          attempt.data
        );
        
        const result = new Uint8Array(decrypted);
        if (result.length > 0) {
          console.log(`    CTR sucesso: ${result.length} bytes`);
          return decrypted;
        }
      } catch (err) {
        console.log(`    CTR tentativa ${index + 1} falhou:`, err.message);
      }
    }
    
    return null;
  } catch (error) {
    console.log('AES-CTR erro:', error.message);
    return null;
  }
}

// Função para validar arquivos de mídia (imagem, áudio, vídeo)
function isValidMediaFile(data: Uint8Array, mediaType?: string): boolean {
  if (data.length < 4) return false;
  
  // Assinaturas de diferentes tipos de arquivo
  const signatures = [
    // Imagens
    { bytes: [0xFF, 0xD8, 0xFF], type: 'image', name: 'JPEG' },
    { bytes: [0x89, 0x50, 0x4E, 0x47], type: 'image', name: 'PNG' },
    { bytes: [0x47, 0x49, 0x46], type: 'image', name: 'GIF' },
    { bytes: [0x52, 0x49, 0x46, 0x46], type: 'image', name: 'WEBP' },
    
    // Áudio
    { bytes: [0xFF, 0xFB], type: 'audio', name: 'MP3' },
    { bytes: [0xFF, 0xF3], type: 'audio', name: 'MP3' },
    { bytes: [0xFF, 0xF2], type: 'audio', name: 'MP3' },
    { bytes: [0x49, 0x44, 0x33], type: 'audio', name: 'MP3 (ID3)' },
    { bytes: [0x4F, 0x67, 0x67, 0x53], type: 'audio', name: 'OGG' },
    { bytes: [0x66, 0x74, 0x79, 0x70], type: 'audio', name: 'M4A/AAC', offset: 4 },
    
    // Vídeo  
    { bytes: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], type: 'video', name: 'MP4' },
    { bytes: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], type: 'video', name: 'MP4' },
    { bytes: [0x1A, 0x45, 0xDF, 0xA3], type: 'video', name: 'WEBM/MKV' },
    
    // Documentos
    { bytes: [0x25, 0x50, 0x44, 0x46], type: 'document', name: 'PDF' }
  ];
  
  for (const sig of signatures) {
    const offset = sig.offset || 0;
    if (data.length >= offset + sig.bytes.length) {
      const matches = sig.bytes.every((byte, i) => data[offset + i] === byte);
      if (matches) {
        console.log(`✅ Arquivo válido detectado: ${sig.name} (${sig.type})`);
        return true;
      }
    }
  }
  
  console.log('❌ Assinatura de arquivo não reconhecida:', 
    Array.from(data.slice(0, 12)).map(b => b.toString(16).padStart(2, '0')).join(' '));
  console.log('Tipo esperado:', mediaType);
  return false;
}

// Função legada para compatibilidade
function isValidImageFile(data: Uint8Array): boolean {
  return isValidMediaFile(data, 'image');
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
    'audio/mp4': '.m4a',
    'audio/ogg': '.ogg',
    'audio/wav': '.wav',
    'audio/aac': '.aac',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  };
  
  return extensions[mimeType] || '';
}
