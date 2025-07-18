
import React from "react";
import { Download, Image as ImageIcon, FileAudio, FileVideo, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageMediaProps {
  mediaType: string;
  mediaUrl: string;
  mediaFilename?: string;
  mediaSize?: number;
  isUserMessage: boolean;
}

export const MessageMedia: React.FC<MessageMediaProps> = ({
  mediaType,
  mediaUrl,
  mediaFilename,
  mediaSize,
  isUserMessage
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = mediaFilename || 'media';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(mediaUrl, '_blank');
  };

  // Renderizar imagens com preview inline
  if (mediaType?.startsWith('image/') || mediaType === 'imageMessage') {
    return (
      <div className="mt-2">
        <div className="relative group">
          <img 
            src={mediaUrl} 
            alt={mediaFilename || "Imagem"}
            className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
            onClick={openInNewTab}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', mediaUrl);
              // Fallback para mostrar um ícone se a imagem não carregar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackDiv = target.nextElementSibling as HTMLElement;
              if (fallbackDiv) {
                fallbackDiv.style.display = 'flex';
              }
            }}
          />
          
          {/* Fallback caso a imagem não carregue */}
          <div 
            className={`hidden items-center justify-center w-full h-32 rounded-lg border-2 border-dashed ${
              isUserMessage ? 'border-purple-400 bg-purple-600/20' : 'border-gray-400 bg-gray-600'
            }`}
          >
            <div className="text-center">
              <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`} />
              <p className={`text-sm ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`}>
                Imagem não disponível
              </p>
            </div>
          </div>
        </div>
        {mediaFilename && (
          <p className={`text-xs mt-1 ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-400'}`}>
            {mediaFilename} {mediaSize && `(${formatFileSize(mediaSize)})`}
          </p>
        )}
      </div>
    );
  }

  // Renderizar áudios
  if (mediaType?.startsWith('audio/')) {
    return (
      <div className="mt-2">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isUserMessage ? 'bg-purple-600/20' : 'bg-goat-gray-600'
        }`}>
          <FileAudio className={`w-6 h-6 ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-300'}`} />
          <div className="flex-1 min-w-0">
            <audio 
              controls 
              className="w-full max-w-xs"
              preload="metadata"
            >
              <source src={mediaUrl} type={mediaType} />
              Seu navegador não suporta o elemento de áudio.
            </audio>
            {mediaFilename && (
              <p className={`text-xs mt-1 truncate ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-400'}`}>
                {mediaFilename} {mediaSize && `(${formatFileSize(mediaSize)})`}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className={`${isUserMessage ? 'text-purple-200 hover:text-white' : 'text-goat-gray-300 hover:text-white'}`}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar vídeos
  if (mediaType?.startsWith('video/')) {
    return (
      <div className="mt-2">
        <div className="relative group max-w-xs">
          <video 
            controls 
            className="w-full rounded-lg shadow-md"
            preload="metadata"
          >
            <source src={mediaUrl} type={mediaType} />
            Seu navegador não suporta o elemento de vídeo.
          </video>
          
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-none"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
        {mediaFilename && (
          <p className={`text-xs mt-1 ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-400'}`}>
            {mediaFilename} {mediaSize && `(${formatFileSize(mediaSize)})`}
          </p>
        )}
      </div>
    );
  }

  // Renderizar outros tipos de arquivo (documentos, etc.)
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType.startsWith('audio/')) return FileAudio;
    if (mimeType.includes('pdf')) return File;
    return File;
  };

  const FileIcon = getFileIcon(mediaType);

  return (
    <div className="mt-2">
      <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
        isUserMessage 
          ? 'bg-purple-600/20 border-purple-400/30' 
          : 'bg-goat-gray-600 border-goat-gray-500'
      }`}
      onClick={openInNewTab}
      >
        <FileIcon className={`w-6 h-6 ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isUserMessage ? 'text-white' : 'text-goat-gray-200'}`}>
            {mediaFilename || 'Arquivo'}
          </p>
          <p className={`text-xs ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-400'}`}>
            {mediaType} {mediaSize && `• ${formatFileSize(mediaSize)}`}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className={`${isUserMessage ? 'text-purple-200 hover:text-white' : 'text-goat-gray-300 hover:text-white'}`}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
