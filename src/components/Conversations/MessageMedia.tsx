
import React from "react";
import { Play, Download, Image as ImageIcon, FileAudio } from "lucide-react";
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (mediaType?.startsWith('image/')) {
    return (
      <div className="mt-2">
        <div className="relative group">
          <img 
            src={mediaUrl} 
            alt={mediaFilename || "Imagem"}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(mediaUrl, '_blank')}
          />
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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

  if (mediaType?.startsWith('video/')) {
    return (
      <div className="mt-2">
        <div className="relative group">
          <video 
            controls 
            className="max-w-xs rounded-lg"
            preload="metadata"
          >
            <source src={mediaUrl} type={mediaType} />
            Seu navegador não suporta o elemento de vídeo.
          </video>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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

  // Outros tipos de arquivo (documentos, etc.)
  return (
    <div className="mt-2">
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        isUserMessage 
          ? 'bg-purple-600/20 border-purple-400/30' 
          : 'bg-goat-gray-600 border-goat-gray-500'
      }`}>
        <ImageIcon className={`w-6 h-6 ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isUserMessage ? 'text-white' : 'text-goat-gray-200'}`}>
            {mediaFilename || 'Arquivo'}
          </p>
          {mediaSize && (
            <p className={`text-xs ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-400'}`}>
              {formatFileSize(mediaSize)}
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
};
