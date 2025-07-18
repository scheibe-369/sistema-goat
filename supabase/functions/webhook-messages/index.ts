

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  console.log('🚀 EDGE FUNCTION INICIADA - webhook-messages', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS OPTIONS - retornando ok');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const webhookData = await req.json();

    if (!webhookData.p_numero || !webhookData.p_user_id) {
      throw new Error('Dados obrigatórios ausentes: numero, user_id');
    }

    let processedDateTime = webhookData.p_data_hora;
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

    let finalMediaUrl = null;
    let finalMediaFilename = webhookData.p_media_filename;
    let finalMediaSize = webhookData.p_media_size;
    let finalMediaType = webhookData.p_media_type;

    const mimeTypeMap = {
      'imageMessage': 'image/jpeg',
      'videoMessage': 'video/mp4',
      'audioMessage': 'audio/mpeg',
      'documentMessage': 'application/octet-stream'
    };

    if (finalMediaType && mimeTypeMap[finalMediaType]) {
      finalMediaType = mimeTypeMap[finalMediaType];
    }

    if (webhookData.p_media_url && webhookData.p_media_key) {
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
      } else {
        throw new Error(`Falha na mídia: ${mediaResult.error}`);
      }
    }

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
    };

    const { data, error } = await supabaseClient.rpc('process_webhook_message', functionParams);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, message_id: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});

async function downloadAndDecryptMedia({ mediaUrl, mediaKey, mediaType, filename, supabaseClient }) {
  const response = await fetch(mediaUrl);
  if (!response.ok) return { success: false, error: 'Download failed' };

  const encryptedData = await response.arrayBuffer();
  const decryptedData = await decryptWhatsAppMedia(encryptedData, mediaKey);

  const uniqueFilename = `${Date.now()}_${filename}${getFileExtension(mediaType)}`;
  const filePath = `media/${uniqueFilename}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('whatsapp-media')
    .upload(filePath, decryptedData, { contentType: mediaType });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: urlData } = supabaseClient.storage.from('whatsapp-media').getPublicUrl(filePath);

  return {
    success: true,
    publicUrl: urlData.publicUrl,
    filename: uniqueFilename,
    size: decryptedData.byteLength
  };
}

async function decryptWhatsAppMedia(encryptedData, mediaKeyBase64) {
  try {
    console.log('🔑 MediaKey recebida:', mediaKeyBase64);
    const mediaKey = Uint8Array.from(atob(mediaKeyBase64), c => c.charCodeAt(0));
    console.log('🔑 MediaKey length:', mediaKey.length);

    const salt = new Uint8Array(32);
    const info = new TextEncoder().encode('WhatsApp Image Keys');

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

    console.log('🔐 Derived IV:', iv);
    console.log('🔐 Derived CipherKey:', cipherKey);

    const ciphertext = new Uint8Array(encryptedData);
    console.log('📦 Encrypted data size:', ciphertext.length, 'bytes');

    const cryptoKey = await crypto.subtle.importKey('raw', cipherKey, { name: 'AES-CBC' }, false, ['decrypt']);

    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, ciphertext);
    console.log('✅ Decrypted data size:', decryptedData.byteLength);

    return new Uint8Array(decryptedData);
  } catch (error) {
    console.error('❌ Detalhes do erro de descriptografia:', {
      message: error.message,
      stack: error.stack
    });
    throw new Error('Falha na descriptografia AES-CBC: ' + error.message);
  }
}

function getFileExtension(mimeType) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'audio/mpeg': '.mp3',
    'video/mp4': '.mp4',
    'application/pdf': '.pdf',
  };
  return extensions[mimeType] || '';
}

