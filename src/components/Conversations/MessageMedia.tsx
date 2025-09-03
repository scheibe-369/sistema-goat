import React from "react";
import { 
  Download, 
  Image as ImageIcon, 
  FileAudio, 
  FileVideo, 
  File,
  FileText,
  FileSpreadsheet,
  Presentation,
  Archive,
  Code,
  FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import WaveSurfer from 'wavesurfer.js';

interface MessageMediaProps {
  mediaType: string;
  mediaUrl?: string | null;
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
    if (!mediaUrl) return;
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = mediaFilename || 'media';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    if (!mediaUrl) return;
    window.open(mediaUrl, '_blank');
  };

  // Renderizar imagens com preview inline
  if (mediaType?.startsWith('image/') || mediaType === 'imageMessage') {
    // Se não há mediaUrl mas há mediaType, mostrar fallback imediatamente
    if (!mediaUrl) {
      return (
        <div className="mt-2">
          <div 
            className={`flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed ${
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
                Imagem WhatsApp
              </p>
              <p className={`text-xs mt-1 ${
                isUserMessage ? 'text-purple-200/80' : 'text-gray-400'
              }`}>
                {mediaFilename || 'Falha na descriptografia'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-2">
        <div className="relative group">
          <img 
            src={mediaUrl} 
            alt="Imagem compartilhada"
            className="max-w-[280px] rounded-xl cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={openInNewTab}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', mediaUrl);
              console.error('Media type:', mediaType);
              console.error('Filename:', mediaFilename);
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
            className={`hidden items-center justify-center w-full h-32 rounded-xl border-2 border-dashed ${
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
                Erro ao carregar imagem
              </p>
              <p className={`text-xs mt-1 ${
                isUserMessage ? 'text-purple-200/80' : 'text-gray-400'
              }`}>
                {mediaFilename || 'Imagem não disponível'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar áudios
  if (mediaType?.startsWith('audio/') || mediaType === 'audioMessage') {
    // Se não há mediaUrl mas há mediaType, mostrar fallback
    if (!mediaUrl) {
      return (
        <div className="mt-2">
          <div 
            className={`flex items-center justify-center p-4 rounded-xl border-2 border-dashed ${
              isUserMessage ? 'border-purple-400 bg-purple-600/20' : 'border-gray-400 bg-gray-600'
            }`}
          >
            <div className="text-center">
              <FileAudio className={`w-8 h-8 mx-auto mb-2 ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`} />
              <p className={`text-sm ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`}>
                Áudio WhatsApp
              </p>
              <p className={`text-xs mt-1 ${
                isUserMessage ? 'text-purple-200/80' : 'text-gray-400'
              }`}>
                {mediaFilename || 'Falha na descriptografia'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Player customizado estilo WhatsApp com onda sonora animada
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveRef = useRef<HTMLDivElement>(null);
    const waveSurferRef = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [waveWidth, setWaveWidth] = useState(0);

    useEffect(() => {
      let resizeObserver: ResizeObserver | null = null;
      let lastCanvas: HTMLCanvasElement | null = null;
      if (waveRef.current && !waveSurferRef.current) {
        waveSurferRef.current = WaveSurfer.create({
          container: waveRef.current,
          waveColor: isUserMessage ? 'rgba(168, 85, 247, 0.6)' : 'rgba(156, 163, 175, 0.8)',
          progressColor: isUserMessage ? 'rgba(168, 85, 247, 1)' : 'rgba(255, 255, 255, 0.9)',
          barWidth: 2,
          barRadius: 2,
          height: 32,
          cursorWidth: 0,
          interact: true,
          hideScrollbar: true,
          normalize: true,
        });
        waveSurferRef.current.load(mediaUrl);
        const observeCanvas = () => {
          const canvas = waveRef.current?.querySelector('canvas');
          if (canvas && canvas !== lastCanvas) {
            setWaveWidth(canvas.offsetWidth);
            if (resizeObserver) resizeObserver.disconnect();
            if ('ResizeObserver' in window) {
              resizeObserver = new ResizeObserver(() => {
                setWaveWidth(canvas.offsetWidth);
              });
              resizeObserver.observe(canvas);
              lastCanvas = canvas;
            }
          }
        };
        waveSurferRef.current.on('ready', () => {
          setDuration(waveSurferRef.current?.getDuration() || 0);
          observeCanvas();
        });
        waveSurferRef.current.on('audioprocess', () => {
          setCurrentTime(waveSurferRef.current?.getCurrentTime() || 0);
          observeCanvas();
        });
        waveSurferRef.current.on('interaction', () => {
          setCurrentTime(waveSurferRef.current?.getCurrentTime() || 0);
          observeCanvas();
        });
        waveSurferRef.current.on('finish', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (waveSurferRef.current) {
            waveSurferRef.current.seekTo(0);
            waveSurferRef.current.pause();
          }
        });
      }
      // Atualiza largura da onda ao redimensionar janela
      const handleResize = () => {
        const canvas = waveRef.current?.querySelector('canvas');
        if (canvas) setWaveWidth(canvas.offsetWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        waveSurferRef.current?.destroy();
        waveSurferRef.current = null;
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) resizeObserver.disconnect();
      };
    }, [mediaUrl]);

    const togglePlay = () => {
      if (!waveSurferRef.current) return;
      if (isPlaying) {
        waveSurferRef.current.pause();
      } else {
        waveSurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    const formatTime = (sec: number) => {
      if (isNaN(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    // LOG para depuração
    console.log('AUDIO DEBUG:', { duration, waveWidth, currentTime });

    return (
      <div className="mt-2">
        <div className={`flex items-center gap-1 px-2 py-0 rounded-full min-w-[280px] max-w-[320px] w-full ${
          isUserMessage 
            ? 'bg-goat-purple' 
            : 'bg-goat-gray-700'
        }`} style={{ position: 'relative' }}>
          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-transparent focus:outline-none flex-shrink-0"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? (
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
                <rect x="6" y="4" width="2.5" height="12" rx="1" fill="#6829c0"/>
                <rect x="11.5" y="4" width="2.5" height="12" rx="1" fill="#6829c0"/>
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
                <polygon points="7,5 15,10 7,15" fill="#6829c0"/>
              </svg>
            )}
          </button>
          <div ref={waveRef} className="flex-1 min-w-0" style={{ width: '100%', position: 'relative', height: 32 }}>
            {/* Bolinha roxa sempre visível, usando largura do container como fallback */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${(currentTime / (duration || 1)) * (waveWidth || waveRef.current?.offsetWidth || 200)}px`,
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                background: '#6829c0',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(104, 41, 192, 0.5)',
                zIndex: 10,
                pointerEvents: 'none',
                transition: isPlaying ? 'none' : 'left 0.1s ease-out',
              }}
            />
          </div>
          <span className="text-xs text-goat-gray-400 w-8 text-right tabular-nums select-none opacity-70">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    );
  }

  // Renderizar vídeos
  if (mediaType?.startsWith('video/') || mediaType === 'videoMessage') {
    // Se não há mediaUrl mas há mediaType, mostrar fallback
    if (!mediaUrl) {
      return (
        <div className="mt-2">
          <div 
            className={`flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed ${
              isUserMessage ? 'border-purple-400 bg-purple-600/20' : 'border-gray-400 bg-gray-600'
            }`}
          >
            <div className="text-center">
              <FileVideo className={`w-8 h-8 mx-auto mb-2 ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`} />
              <p className={`text-sm ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`}>
                Vídeo WhatsApp
              </p>
              <p className={`text-xs mt-1 ${
                isUserMessage ? 'text-purple-200/80' : 'text-gray-400'
              }`}>
                {mediaFilename || 'Falha na descriptografia'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
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

  // Renderizar documentos e outros arquivos
  if (mediaType?.startsWith('application/') || mediaType === 'documentMessage' || mediaType === 'documentWithCaptionMessage' || 
      (!mediaType?.startsWith('image/') && !mediaType?.startsWith('video/') && !mediaType?.startsWith('audio/') && 
       mediaType !== 'imageMessage' && mediaType !== 'videoMessage' && mediaType !== 'audioMessage')) {
    
    const getFileIcon = (mimeType: string) => {
      // Documentos específicos
      if (mimeType.includes('pdf')) return FileText;
      if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) return FileSpreadsheet;
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return Presentation;
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('archive')) return Archive;
      if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('javascript')) return Code;
      if (mimeType.includes('text/')) return FileText;
      
      // Fallback genérico
      return File;
    };

    const FileIcon = getFileIcon(mediaType);
    
    const getDocumentTypeName = (mimeType: string) => {
      if (mimeType.includes('pdf')) return 'PDF';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel';
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PowerPoint';
      if (mimeType.includes('csv')) return 'CSV';
      if (mimeType.includes('zip')) return 'ZIP';
      if (mimeType.includes('rar')) return 'RAR';
      if (mimeType.includes('7z')) return '7Z';
      if (mimeType.includes('json')) return 'JSON';
      if (mimeType.includes('xml')) return 'XML';
      if (mimeType.includes('html')) return 'HTML';
      if (mimeType.includes('css')) return 'CSS';
      if (mimeType.includes('javascript')) return 'JavaScript';
      if (mimeType.includes('text/')) return 'Texto';
      if (mimeType === 'documentMessage') return 'Documento';
      return 'Arquivo';
    };

    const documentTypeName = getDocumentTypeName(mediaType);

    // Se não há mediaUrl mas há mediaType, mostrar fallback melhorado
    if (!mediaUrl) {
      return (
        <div className="mt-2">
          <div 
            className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed ${
              isUserMessage ? 'border-purple-400 bg-purple-600/20' : 'border-gray-400 bg-gray-600'
            }`}
          >
            <FileIcon className={`w-10 h-10 ${
              isUserMessage ? 'text-purple-200' : 'text-gray-300'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isUserMessage ? 'text-purple-200' : 'text-gray-300'
              }`}>
                {documentTypeName} WhatsApp
              </p>
              <p className={`text-xs mt-1 ${
                isUserMessage ? 'text-purple-200/80' : 'text-gray-400'
              }`}>
                {mediaFilename || 'Falha na descriptografia'}
              </p>
              <p className={`text-xs ${
                isUserMessage ? 'text-purple-200/70' : 'text-gray-500'
              }`}>
                Aguarde while processing...
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-[1.02] ${
          isUserMessage 
            ? 'bg-purple-600/20 border-purple-400/30 hover:bg-purple-600/30' 
            : 'bg-goat-gray-600 border-goat-gray-500 hover:bg-goat-gray-500'
        }`}
        onClick={openInNewTab}
        >
          <FileIcon className={`w-8 h-8 ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-300'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isUserMessage ? 'text-white' : 'text-goat-gray-200'}`}>
              {mediaFilename || `${documentTypeName} Document`}
            </p>
            <p className={`text-xs ${isUserMessage ? 'text-purple-200' : 'text-goat-gray-400'}`}>
              {documentTypeName} {mediaSize && `• ${formatFileSize(mediaSize)}`}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className={`${isUserMessage ? 'text-purple-200 hover:text-white hover:bg-purple-500/20' : 'text-goat-gray-300 hover:text-white hover:bg-goat-gray-400'}`}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Fallback genérico para tipos não reconhecidos
  const getFileIcon = (mimeType: string) => {
    // Vídeos  
    if (mimeType.startsWith('video/')) return FileVideo;
    
    // Áudios
    if (mimeType.startsWith('audio/')) return FileAudio;
    
    // Imagens (fallback para formatos não reconhecidos)
    if (mimeType.startsWith('image/')) return FileImage;
    
    // Fallback genérico
    return File;
  };

  const FileIcon = getFileIcon(mediaType);

  // Se não há mediaUrl mas há mediaType, mostrar fallback
  if (!mediaUrl) {
    return (
      <div className="mt-2">
        <div 
          className={`flex items-center justify-center p-4 rounded-xl border-2 border-dashed ${
            isUserMessage ? 'border-purple-400 bg-purple-600/20' : 'border-gray-400 bg-gray-600'
          }`}
        >
          <div className="text-center">
            <FileIcon className={`w-8 h-8 mx-auto mb-2 ${
              isUserMessage ? 'text-purple-200' : 'text-gray-300'
            }`} />
            <p className={`text-sm ${
              isUserMessage ? 'text-purple-200' : 'text-gray-300'
            }`}>
              Arquivo WhatsApp
            </p>
            <p className={`text-xs mt-1 ${
              isUserMessage ? 'text-purple-200/80' : 'text-gray-400'
            }`}>
              {mediaFilename || 'Falha na descriptografia'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
