import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles, 
  Loader2, 
  Cloud, 
  Link as LinkIcon, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { optimizeImageFile, getDataUrlSizeBytes } from '../../utils/imageOptimizer';
import { uploadImageToCloudflare, getCloudflareConfig } from '../../lib/cloudflare';

interface ImageUploadPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  required?: boolean;
  accept?: string;
  folder?: string;
  onOpenCloudflareSettings?: () => void;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  required = false,
  accept = 'image/*',
  folder = 'media',
  onOpenCloudflareSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const isVideo = value && (value.startsWith('data:video/') || value.includes('.mp4') || value.includes('.webm') || value.includes('video'));

  const cloudflareConfig = getCloudflareConfig();
  const isCloudflareConfigured = !!(cloudflareConfig.accountId && (cloudflareConfig.r2SecretAccessKey || cloudflareConfig.apiToken));
  const isCloudflareUrl = value && (
    value.includes('imagedelivery.net') || 
    value.includes('cloudflare') || 
    value.includes('r2.dev') ||
    (cloudflareConfig.customDomain && value.includes(cloudflareConfig.customDomain))
  );

  const [optimizedInfo, setOptimizedInfo] = useState<{ sizeKb: number; savedKb?: number } | null>(() => {
    if (value && value.startsWith('data:')) {
      const bytes = getDataUrlSizeBytes(value);
      return { sizeKb: Math.round(bytes / 1024) };
    }
    return null;
  });

  const handleFileChange = async (file: File) => {
    const isVideoFile = file.type.startsWith('video/');
    const isImageFile = file.type.startsWith('image/');

    if (!file || (!isImageFile && !isVideoFile)) {
      alert('Veuillez sélectionner un fichier valide (Image ou Vidéo MP4/WebM)');
      return;
    }

    if (isVideoFile) {
      try {
        setIsProcessing(true);
        setStatusNote(null);
        
        // Upload video to Cloudflare R2 if configured
        const cfResult = await uploadImageToCloudflare(file, cloudflareConfig, folder || 'videos');
        if (cfResult.success && cfResult.url) {
          onChange(cfResult.url);
          setManualUrl(cfResult.url);
          setStatusNote('🎬 Vidéo hébergée avec succès sur votre Cloudflare R2 !');
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const res = e.target?.result as string;
          if (res) {
            onChange(res);
            setManualUrl(res);
            setStatusNote('🎬 Vidéo chargée depuis l’appareil !');
          }
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.onerror = () => {
          setIsProcessing(false);
          alert('Erreur lors de la lecture de la vidéo.');
        };
        reader.readAsDataURL(file);
        return;
      } catch (err) {
        setIsProcessing(false);
        console.error('Erreur vidéo:', err);
      }
    }

    try {
      setIsProcessing(true);
      setStatusNote(null);

      // Upload directly to Cloudflare R2 / Images using latest active config
      const activeCfConfig = getCloudflareConfig();
      const cfResult = await uploadImageToCloudflare(file, activeCfConfig, folder);
      if (cfResult.success && cfResult.url) {
        onChange(cfResult.url);
        setManualUrl(cfResult.url);
        if (cfResult.storage === 'cloudflare-r2') {
          setStatusNote('☁️ Téléversé avec succès sur votre CDN Cloudflare R2 !');
        } else {
          setStatusNote('✅ Image chargée et optimisée avec succès.');
        }
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // If Cloudflare was intended but failed, show note
      if (cfResult.error) {
        console.warn('Cloudflare upload note:', cfResult.error);
      }

      // Auto optimize & compress to max 100KB for lightweight fast storage
      const result = await optimizeImageFile(file, 100 * 1024);
      const originalKb = Math.round(result.originalSizeBytes / 1024);
      const compressedKb = Math.round(result.compressedSizeBytes / 1024);

      setOptimizedInfo({
        sizeKb: compressedKb,
        savedKb: Math.max(0, originalKb - compressedKb),
      });

      onChange(result.dataUrl);
      setManualUrl(result.dataUrl);
      setStatusNote(cfResult.error ? `⚠️ Cloudflare : ${cfResult.error} — Image compressée en secours local.` : 'Image optimisée.');
    } catch (err) {
      console.error('Erreur lors du traitement de l’image:', err);
      alert("Erreur lors du traitement de l'image. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setManualUrl('');
    setOptimizedInfo(null);
    setStatusNote(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setStatusNote('URL d’image appliquée avec succès.');
    }
  };

  return (
    <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/80">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
          <span>{label} {required && <span className="text-rose-400">*</span>}</span>
        </label>
        
        <div className="flex items-center gap-2">
          {isCloudflareUrl ? (
            <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded-full border border-orange-500/40 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-orange-400" />
              <span>Hébergé Cloudflare CDN</span>
            </span>
          ) : isCloudflareConfigured ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>Prêt pour Cloudflare</span>
            </span>
          ) : (
            <span className="text-[11px] text-teal-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Optimisation auto</span>
            </span>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-orange-400 bg-orange-950/40'
            : isCloudflareConfigured
            ? 'border-orange-500/40 hover:border-orange-400 bg-slate-800/60 hover:bg-slate-800'
            : 'border-slate-700 hover:border-teal-500/60 bg-slate-800/60 hover:bg-slate-800'
        }`}
      >
        {isProcessing ? (
          <div className="py-4 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            <span className="text-xs font-bold text-orange-300">
              {isVideo ? 'Chargement de la vidéo...' : (isCloudflareConfigured ? 'Téléversement vers Cloudflare CDN...' : 'Optimisation & compression de l’image...')}
            </span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
              {isVideo ? (
                <video
                  src={value}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={value}
                  alt="Aperçu sélectionné"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{isCloudflareUrl ? 'Image Cloudflare CDN' : 'Image prête'}</span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5 truncate">
                {isCloudflareUrl ? (
                  <span className="text-orange-400 font-mono text-[10px] truncate">{value}</span>
                ) : (
                  <span className="font-semibold text-emerald-400">
                    {optimizedInfo ? `${optimizedInfo.sizeKb} Ko` : 'Optimisée'} (≤ 100 Ko)
                  </span>
                )}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>{isCloudflareConfigured ? 'Remplacer sur Cloudflare' : 'Changer la photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Coller URL
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center justify-center space-y-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCloudflareConfigured ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
            }`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold hover:underline ${isCloudflareConfigured ? 'text-orange-400' : 'text-teal-400'}`}>
                {isCloudflareConfigured ? 'Cliquez pour envoyer directement sur Cloudflare' : 'Cliquez pour choisir une photo depuis votre appareil'}
              </span>
              <span className="text-xs text-slate-400 block sm:inline"> ou glissez-déposez ici</span>
            </div>
            <span className="text-[10px] text-slate-400">
              JPG, PNG, WebP — compression automatique et distribution CDN
            </span>
          </div>
        )}
      </div>

      {/* Manual URL Bar */}
      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://imagedelivery.net/... ou https://..."
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}

      {statusNote && (
        <p className="text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>{statusNote}</span>
        </p>
      )}

      {helperText && !statusNote && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
