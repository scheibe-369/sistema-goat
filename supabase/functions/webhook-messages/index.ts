
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Função para descriptografar mídia do WhatsApp
async function decryptWhatsAppMedia(encryptedData: ArrayBuffer, mediaKeyBase64: string, mediaType: string): Promise<Uint8Array> {
  const mediaKey = Uint8Array.from(atob(mediaKeyBase64), (c) => c.charCodeAt(0));
  
  // Determinar a chave de info correta baseada no tipo de mídia
  let infoString: string;
  let macBytes: number;
  
  if (mediaType.startsWith('image/')) {
    infoString = 'WhatsApp Image Keys';
    macBytes = 10; // Imagens usam 10 bytes MAC
  } else if (mediaType.startsWith('video/')) {
    infoString = 'WhatsApp Video Keys';
    macBytes = 10; // Vídeos usam 10 bytes MAC
  } else if (mediaType.startsWith('audio/')) {
    infoString = 'WhatsApp Audio Keys';
    macBytes = 10; // Áudios usam 10 bytes MAC
  } else if (mediaType.startsWith('application/') || mediaType.includes('document')) {
    infoString = 'WhatsApp Document Keys';
    macBytes = 10; // Documentos usam 10 bytes MAC
  } else {
    infoString = 'WhatsApp Document Keys'; // Fallback para documento
    macBytes = 10;
  }
  
  console.log('===> Usando chaves para:', infoString, 'MAC bytes:', macBytes);
  
  const info = new TextEncoder().encode(infoString);
  const salt = new Uint8Array(32);
  
  const hkdfKey = await crypto.subtle.importKey('raw', mediaKey, 'HKDF', false, ['deriveBits']);
  const expandedKey = await crypto.subtle.deriveBits({
    name: 'HKDF',
    hash: 'SHA-256',
    salt,
    info
  }, hkdfKey, 112 * 8);
  
  const expandedKeyBytes = new Uint8Array(expandedKey);
  const iv = expandedKeyBytes.slice(0, 16);
  const cipherKey = expandedKeyBytes.slice(16, 48);
  
  const cryptoKey = await crypto.subtle.importKey('raw', cipherKey, {
    name: 'AES-CBC'
  }, false, ['decrypt']);
  
  // Cortar os bytes MAC baseado no tipo de mídia
  const encryptedArray = new Uint8Array(encryptedData);
  const ciphertext = encryptedArray.slice(0, encryptedArray.length - macBytes);
  
  console.log('===> Dados para descriptografia - Total:', encryptedArray.length, 'Ciphertext:', ciphertext.length, 'MAC removido:', macBytes);
  
  // Descriptografar o payload
  const decryptedData = await crypto.subtle.decrypt({
    name: 'AES-CBC',
    iv
  }, cryptoKey, ciphertext.buffer);
  
  return new Uint8Array(decryptedData);
}

// Função para baixar e descriptografar mídia
async function downloadAndDecryptMedia(params: {
  mediaUrl: string;
  mediaKey: string;
  mediaType: string;
  filename: string;
  supabaseClient: any;
}) {
  const { mediaUrl, mediaKey, mediaType, filename, supabaseClient } = params;
  
  console.log('===> Tentando baixar mídia:', mediaUrl);

  try {
    const response = await fetch(mediaUrl, {
      headers: {
        'Origin': 'https://web.whatsapp.com',
        'Referer': 'https://web.whatsapp.com/',
        'User-Agent': 'WhatsApp/2.2332.15'
      }
    });

    console.log('===> Status HTTP:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const encryptedData = await response.arrayBuffer();
    const dataArr = new Uint8Array(encryptedData);

    console.log('===> Tamanho arquivo criptografado:', dataArr.length, 'bytes');
    console.log('===> Primeiros 16 bytes do arquivo:', Array.from(dataArr.slice(0, 16)));
    console.log('===> mediaKey base64:', mediaKey);
    
    const keyBytes = Uint8Array.from(atob(mediaKey), c => c.charCodeAt(0));
    console.log('===> Tamanho da mediaKey em bytes:', keyBytes.length);

    const decryptedData = await decryptWhatsAppMedia(encryptedData, mediaKey, mediaType);
    const decryptedArr = new Uint8Array(decryptedData);

    console.log('===> Tamanho arquivo descriptografado:', decryptedArr.length, 'bytes');
    console.log('===> Primeiros 16 bytes descriptografados:', Array.from(decryptedArr.slice(0, 16)));

    // Upload para o Supabase Storage
    const uniqueFilename = `${Date.now()}_${filename}${getFileExtension(mediaType)}`;
    const filePath = `media/${uniqueFilename}`;
    
    const { error: uploadError } = await supabaseClient.storage
      .from('whatsapp-media')
      .upload(filePath, decryptedArr, { contentType: mediaType });
      
    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabaseClient.storage.from('whatsapp-media').getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      filename: uniqueFilename,
      size: decryptedArr.length
    };
    
  } catch (error) {
    console.error('===> ERRO DE DESCRIPTOGRAFIA:', error.message);
    return { success: false, error: 'Falha na descriptografia AES-CBC: ' + error.message };
  }
}

// Função para obter extensão do arquivo baseada no tipo MIME
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    // Imagens
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    // Áudios
    'audio/mpeg': '.mp3',
    'audio/ogg': '.ogg',
    'audio/wav': '.wav',
    'audio/m4a': '.m4a',
    'audio/aac': '.aac',
    'audio/flac': '.flac',
    // Vídeos
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'video/mov': '.mov',
    'video/wmv': '.wmv',
    'video/webm': '.webm',
    'video/mkv': '.mkv',
    // Documentos
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/rtf': '.rtf',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/html': '.html',
    'text/css': '.css',
    'application/javascript': '.js',
    'application/octet-stream': '.bin',
  };
  return extensions[mimeType] || '';
}

serve(async (req) => {
  console.log('🚀 EDGE FUNCTION INICIADA - webhook-messages', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS OPTIONS - retornando ok');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const requestBody = await req.json();
    console.log('📨 Dados recebidos:', JSON.stringify(requestBody, null, 2));

    // Verificar dados obrigatórios
    if (!requestBody.p_numero || !requestBody.p_user_id) {
      throw new Error('Dados obrigatórios ausentes: p_numero, p_user_id');
    }

    // Processar timestamp
    let processedDateTime = requestBody.p_data_hora;
    if (!processedDateTime) {
      processedDateTime = new Date(Date.now() - 3 * 3600000).toISOString();
    } else {
      try {
        const date = new Date(processedDateTime);
        if (isNaN(date.getTime())) throw new Error('Data inválida');
        if (!processedDateTime.includes('T') || (!processedDateTime.includes('Z') && !/[+-]/.test(processedDateTime))) {
          processedDateTime = new Date(`${processedDateTime} GMT-0300`).toISOString();
        } else {
          processedDateTime = date.toISOString();
        }
      } catch {
        processedDateTime = new Date(Date.now() - 3 * 3600000).toISOString();
      }
    }

    // Processar mídia se necessário
    let finalMediaUrl = null;
    let finalMediaFilename = requestBody.p_media_filename;
    let finalMediaSize = requestBody.p_media_size;
    let finalMediaType = requestBody.p_media_type;

    // Mapear tipos de mídia do WhatsApp para MIME types
    const mimeTypeMap: { [key: string]: string } = {
      'imageMessage': 'image/jpeg',
      'videoMessage': 'video/mp4',
      'audioMessage': 'audio/ogg', // WhatsApp usa OGG para áudio
      'documentMessage': 'application/pdf', // Assumir PDF como padrão para documentos
      'documentWithCaptionMessage': 'application/pdf',
      'stickerMessage': 'image/webp'
    };

    if (finalMediaType && mimeTypeMap[finalMediaType]) {
      finalMediaType = mimeTypeMap[finalMediaType];
    }

    // Baixar e descriptografar mídia se disponível
    if (requestBody.p_media_url && requestBody.p_media_key) {
      console.log('📱 Processando mídia...');
      try {
        const mediaResult = await downloadAndDecryptMedia({
          mediaUrl: requestBody.p_media_url,
          mediaKey: requestBody.p_media_key,
          mediaType: finalMediaType,
          filename: requestBody.p_media_filename || `media_${Date.now()}`,
          supabaseClient
        });

        if (mediaResult.success) {
          finalMediaUrl = mediaResult.publicUrl;
          finalMediaFilename = mediaResult.filename;
          finalMediaSize = mediaResult.size;
          console.log('✅ Mídia processada com sucesso:', finalMediaUrl);
        } else {
          console.error('❌ Falha no processamento de mídia:', mediaResult.error);
          if (mediaResult.error?.includes('mime type') && mediaResult.error?.includes('not supported')) {
            console.error('🚫 Tipo MIME não suportado pelo bucket de storage');
          }
        }
      } catch (mediaError) {
        console.error('❌ Erro crítico no processamento de mídia:', mediaError.message);
        console.error('Stack:', mediaError.stack);
        // Continua sem a mídia, não falha completamente
      }
    }

    // Preparar parâmetros para a função do banco
    const functionParams = {
      p_user_id: requestBody.p_user_id,
      p_numero: requestBody.p_numero,
      p_mensagem: requestBody.p_mensagem || null,
      p_direcao: requestBody.p_direcao || false,
      p_data_hora: processedDateTime,
      p_nome_contato: requestBody.p_nome_contato || null,
      p_media_type: finalMediaType || null,
      p_media_url: finalMediaUrl || null,
      p_media_filename: finalMediaFilename || null,
      p_media_size: finalMediaSize || null,
      p_media_key: requestBody.p_media_key || null // Incluindo o parâmetro que estava faltando
    };

    console.log('🎯 Chamando process_webhook_message com parâmetros:', JSON.stringify(functionParams, null, 2));

    // Chamar a função do banco de dados
    const { data, error } = await supabaseClient.rpc('process_webhook_message', functionParams);
    
    if (error) {
      console.error('❌ Erro na função do banco:', error);
      throw error;
    }

    console.log('✅ Mensagem processada com sucesso. ID:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: data,
      processed_media: !!finalMediaUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('💥 Erro no webhook:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
