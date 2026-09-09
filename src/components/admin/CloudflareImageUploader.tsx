import React, { useState, useRef } from 'react';
import { 
   UploadCloud, 
   Image as ImageIcon, 
   CheckCircle2, 
   RefreshCw, 
   Link as LinkIcon, 
   ExternalLink,
   AlertTriangle,
   Trash2,
   Cloud
 } from 'lucide-react';
import { uploadImageToCloudflare, getCloudflareConfig } from '../../lib/cloudflare';
import { CloudflareConfig } from '../../types';

interface CloudflareImageUploaderProps {
  currentUrl?: string;
  onImageUploaded: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: 'square' | 'wide' | 'avatar';
  onOpenCloudflareSettings?: () => void;
  cloudflareConfig?: CloudflareConfig;
}

export const CloudflareImageUploader: React.FC<CloudflareImageUploaderProps> = ({
  currentUrl,
  onImageUploaded,
  label = 'Image / Photo',
  description = 'Téléversez directement vers votre CDN Cloudflare ou collez une URL.',
  aspectRatio = 'square',
  onOpenCloudflareSettings,
  cloudflareConfig,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState(currentUrl || '');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConfig = cloudflareConfig || getCloudflareConfig();
  const isCloudflareActive = !!(activeConfig.accountId && activeConfig.apiToken);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await uploadImageToCloudflare(file, activeConfig);
      if (res.success && res.url) {
        onImageUploaded(res.url);
        setManualUrl(res.url);
        if (res.error) {
          setSuccessMsg('Image chargée localement. (Astuce : configurez vos clés Cloudflare pour héberger sur votre CDN).');
        } else {
          setSuccessMsg('✅ Image envoyée sur Cloudflare avec succès !');
        }
      } else {
        setErrorMsg(res.error || 'Échec de l’envoi');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de l’envoi de l’image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualApply = () => {
    if (manualUrl.trim()) {
      onImageUploaded(manualUrl.trim());
      setSuccessMsg('URL appliquée avec succès !');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const isCloudflareUrl = currentUrl && (
    currentUrl.includes('imagedelivery.net') || 
    currentUrl.includes('cloudflare') || 
    currentUrl.includes('r2.dev') ||
    (activeConfig.customDomain && currentUrl.includes(activeConfig.customDomain))
  );

  return (
    <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/80">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-orange-400" />
            <span>{label}</span>
          </span>
          {description && <p className="text-[11px] text-slate-400">{description}</p>}
        </div>

        {/* Cloudflare indicator */}
        <div className="flex items-center gap-2">
          {isCloudflareUrl ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
              <Cloud className="w-3 h-3" />
              <span>Cloudflare CDN</span>
            </span>
          ) : isCloudflareActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3" />
              <span>Cloudflare Prêt</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenCloudflareSettings}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            >
              <span>⚙️ Configurer Cloudflare</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Uploader Box */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        {/* Preview Thumbnail */}
        <div className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center ${
          aspectRatio === 'wide' ? 'w-32 h-20' : aspectRatio === 'avatar' ? 'w-16 h-16 rounded-full' : 'w-20 h-20'
        }`}>
          {currentUrl ? (
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-600" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 w-full space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-orange-600/20 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>Envoyer sur Cloudflare</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManualOpen(!isManualOpen)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{isManualOpen ? 'Masquer URL' : 'Coller URL'}</span>
            </button>

            {currentUrl && (
              <button
                type="button"
                onClick={() => {
                  onImageUploaded('');
                  setManualUrl('');
                }}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer"
                title="Supprimer l’image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Manual URL Input */}
          {isManualOpen && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://imagedelivery.net/... ou https://pub-...r2.dev/..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
              />
              <button
                type="button"
                onClick={handleManualApply}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="text-[11px] text-emerald-300 flex items-center gap-1 pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="text-[11px] text-rose-300 flex items-center gap-1 pt-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
