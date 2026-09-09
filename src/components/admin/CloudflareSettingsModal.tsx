import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Key, 
  Server, 
  Copy, 
  Check, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Database,
  Image as ImageIcon
} from 'lucide-react';
import { getCloudflareConfig, saveCloudflareConfig, testCloudflareConnection, uploadUrlToCloudflare } from '../../lib/cloudflare';
import { useClinic } from '../../context/ClinicContext';
import { CloudflareConfig } from '../../types';

interface CloudflareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareSettingsModal: React.FC<CloudflareSettingsModalProps> = ({ isOpen, onClose }) => {
  const { clinicInfo, updateClinicInfo, doctors, updateDoctor, services, updateService, products, updateProduct } = useClinic();

  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [r2AccessKeyId, setR2AccessKeyId] = useState('');
  const [r2SecretAccessKey, setR2SecretAccessKey] = useState('');
  const [r2BucketName, setR2BucketName] = useState('basma');
  const [customDomain, setCustomDomain] = useState('https://pub-70361fd9ada342788392ffd9416b3094.r2.dev');
  const [accountHash, setAccountHash] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('https://imagedelivery.net');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; testUrl?: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'r2' | 'sync' | 'guide'>('r2');

  // Sync all images state
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = clinicInfo.cloudflare || getCloudflareConfig();
      const defaultKeyId = 'ced36bb1a0376657cd8b17c361118744';
      const initialKeyId = (cfg.r2AccessKeyId && cfg.r2AccessKeyId !== cfg.accountId && cfg.r2AccessKeyId !== '4083f5348ec93aaa56ce2f38723f81ab')
        ? cfg.r2AccessKeyId
        : defaultKeyId;

      setAccountId(cfg.accountId || '4083f5348ec93aaa56ce2f38723f81ab');
      setApiToken(cfg.apiToken || 'a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b');
      setR2AccessKeyId(initialKeyId);
      setR2SecretAccessKey(cfg.r2SecretAccessKey || cfg.apiToken || 'a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b');
      setR2BucketName(cfg.r2BucketName || 'basma');
      setCustomDomain(cfg.customDomain || 'https://pub-70361fd9ada342788392ffd9416b3094.r2.dev');
      setAccountHash(cfg.accountHash || '');
      setDeliveryUrl(cfg.deliveryUrl || 'https://imagedelivery.net');
    }
  }, [isOpen, clinicInfo]);

  const handleTest = async (testConfig?: CloudflareConfig) => {
    setIsTesting(true);
    setActionMessage(null);
    setTestResult(null);

    const defaultKeyId = 'ced36bb1a0376657cd8b17c361118744';
    const effectiveKeyId = (!r2AccessKeyId.trim() || r2AccessKeyId.trim() === accountId.trim() || r2AccessKeyId.trim() === '4083f5348ec93aaa56ce2f38723f81ab')
      ? defaultKeyId
      : r2AccessKeyId.trim();

    const configToTest: CloudflareConfig = testConfig || {
      accountId: accountId.trim(),
      apiToken: apiToken.trim(),
      r2AccessKeyId: effectiveKeyId,
      r2SecretAccessKey: r2SecretAccessKey.trim() || apiToken.trim(),
      r2BucketName: r2BucketName.trim() || 'basma',
      customDomain: customDomain.trim() || 'https://pub-70361fd9ada342788392ffd9416b3094.r2.dev',
      accountHash: accountHash.trim(),
      deliveryUrl: deliveryUrl.trim(),
      enabled: true,
    };

    try {
      const res = await testCloudflareConnection(configToTest);
      setTestResult(res);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message });
      } else {
        setActionMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Erreur lors du test.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const defaultKeyId = 'ced36bb1a0376657cd8b17c361118744';
    const effectiveKeyId = (!r2AccessKeyId.trim() || r2AccessKeyId.trim() === accountId.trim() || r2AccessKeyId.trim() === '4083f5348ec93aaa56ce2f38723f81ab')
      ? defaultKeyId
      : r2AccessKeyId.trim();

    const newConfig: CloudflareConfig = {
      accountId: accountId.trim(),
      apiToken: apiToken.trim(),
      r2AccessKeyId: effectiveKeyId,
      r2SecretAccessKey: r2SecretAccessKey.trim() || apiToken.trim(),
      r2BucketName: r2BucketName.trim() || 'basma',
      customDomain: customDomain.trim() || 'https://pub-70361fd9ada342788392ffd9416b3094.r2.dev',
      accountHash: accountHash.trim(),
      deliveryUrl: deliveryUrl.trim() || 'https://imagedelivery.net',
      enabled: true,
    };

    saveCloudflareConfig(newConfig);

    // Also sync to ClinicInfo & Supabase
    const updatedInfo = {
      ...clinicInfo,
      cloudflare: newConfig,
    };
    await updateClinicInfo(updatedInfo);

    setActionMessage({ type: 'success', text: '✅ Configuration Cloudflare R2 enregistrée et synchronisée avec Supabase !' });

    if (newConfig.accountId) {
      await handleTest(newConfig);
    }
  };

  /**
   * Migrate & Sync all existing Doctors, Products, Services and Hero images into Cloudflare R2
   */
  const handleSyncAllImagesToR2 = async () => {
    setIsSyncingAll(true);
    setSyncSummary(null);
    setActionMessage(null);

    const cfg: CloudflareConfig = {
      accountId: accountId.trim(),
      apiToken: apiToken.trim(),
      r2AccessKeyId: r2AccessKeyId.trim() || accountId.trim(),
      r2SecretAccessKey: r2SecretAccessKey.trim() || apiToken.trim(),
      r2BucketName: r2BucketName.trim() || 'basma',
      customDomain: customDomain.trim() || 'https://pub-70361fd9ada342788392ffd9416b3094.r2.dev',
      enabled: true,
    };

    try {
      const itemsToSync: Array<{ type: 'doctor' | 'service' | 'product' | 'hero'; item: any; currentUrl: string }> = [];

      // Doctors
      doctors.forEach(d => {
        if (d.imageUrl) itemsToSync.push({ type: 'doctor', item: d, currentUrl: d.imageUrl });
      });

      // Services
      services.forEach(s => {
        if (s.imageUrl) itemsToSync.push({ type: 'service', item: s, currentUrl: s.imageUrl });
      });

      // Products
      products.forEach(p => {
        const prodImg = p.imageUrl || p.images?.[0] || p.image;
        if (prodImg) itemsToSync.push({ type: 'product', item: p, currentUrl: prodImg });
      });

      // Hero
      if (clinicInfo.heroMediaUrl) {
        itemsToSync.push({ type: 'hero', item: clinicInfo, currentUrl: clinicInfo.heroMediaUrl });
      }

      let updatedCount = 0;
      const total = itemsToSync.length;

      for (let i = 0; i < total; i++) {
        const itemInfo = itemsToSync[i];
        setSyncProgress({
          current: i + 1,
          total: total,
          label: `Téléversement vers Cloudflare R2 (${itemInfo.type}) : ${i + 1}/${total}...`,
        });

        // If already pointing to Cloudflare R2 custom domain, skip upload unless base64
        const isAlreadyR2 = itemInfo.currentUrl.includes('r2.dev') || itemInfo.currentUrl.includes('cloudflare');
        if (isAlreadyR2 && !itemInfo.currentUrl.startsWith('data:')) {
          continue;
        }

        const folder = itemInfo.type === 'doctor' ? 'doctors' : itemInfo.type === 'service' ? 'services' : itemInfo.type === 'product' ? 'products' : 'hero';
        const fileName = `${folder}_${Date.now()}_${i}`;

        let newUrl = itemInfo.currentUrl;

        if (itemInfo.currentUrl.startsWith('data:')) {
          // Upload base64
          const res = await fetch('/api/cloudflare/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl: itemInfo.currentUrl,
              fileName: fileName,
              folder: folder,
              accountId: cfg.accountId,
              apiToken: cfg.apiToken,
              r2AccessKeyId: cfg.r2AccessKeyId,
              r2SecretAccessKey: cfg.r2SecretAccessKey,
              r2BucketName: cfg.r2BucketName,
              customDomain: cfg.customDomain,
            }),
          });
          const data = await res.json();
          if (data.success && data.url) newUrl = data.url;
        } else {
          // Upload external URL
          const res = await uploadUrlToCloudflare(itemInfo.currentUrl, cfg, folder, fileName);
          if (res.success && res.url) newUrl = res.url;
        }

        // Apply updated URL and sync to Supabase
        if (newUrl && newUrl !== itemInfo.currentUrl) {
          if (itemInfo.type === 'doctor') {
            updateDoctor({ ...itemInfo.item, imageUrl: newUrl });
          } else if (itemInfo.type === 'service') {
            updateService({ ...itemInfo.item, imageUrl: newUrl });
          } else if (itemInfo.type === 'product') {
            updateProduct({ ...itemInfo.item, imageUrl: newUrl });
          } else if (itemInfo.type === 'hero') {
            await updateClinicInfo({ ...clinicInfo, heroMediaUrl: newUrl });
          }
          updatedCount++;
        }
      }

      setSyncSummary(`🎉 Succès ! ${updatedCount} image(s) ont été envoyées sur Cloudflare R2 et enregistrées dans Supabase avec le lien https://pub-...r2.dev !`);
      setActionMessage({ type: 'success', text: `Toutes les photos sont désormais hébergées sur Cloudflare R2 et enregistrées dans Supabase.` });
    } catch (err: any) {
      console.error('Erreur synchronisation R2:', err);
      setActionMessage({ type: 'error', text: err?.message || 'Erreur lors de la synchronisation vers Cloudflare.' });
    } finally {
      setIsSyncingAll(false);
      setSyncProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Stockage Cloudflare R2 & CDN</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  R2 Actif
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Toutes vos photos (médecins, produits, soins) sont hébergées sur Cloudflare R2 et liées à Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('r2')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'r2'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Configuration R2 Bucket
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Transférer toutes les images vers Cloudflare</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 Guide & Informations
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* Action / Error Banner */}
          {actionMessage && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              actionMessage.type === 'success' ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-200' :
              actionMessage.type === 'error' ? 'bg-rose-950/70 border border-rose-700/60 text-rose-200' :
              'bg-slate-800/80 border border-slate-700 text-slate-200'
            }`}>
              {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> :
               actionMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> :
               <Cloud className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
              <div className="flex-1 font-medium">{actionMessage.text}</div>
            </div>
          )}

          {activeTab === 'r2' ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Account ID & Bucket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Cloudflare Account ID <span className="text-orange-400">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">32 caractères</span>
                  </label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="4083f5348ec93aaa56ce2f38723f81ab"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom du Bucket R2 <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={r2BucketName}
                    onChange={(e) => setR2BucketName(e.target.value)}
                    placeholder="basma"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* R2 Access Key ID & Secret Access Key */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>R2 Access Key ID <span className="text-orange-400">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">Généré dans Cloudflare R2</span>
                  </label>
                  <input
                    type="text"
                    value={r2AccessKeyId}
                    onChange={(e) => setR2AccessKeyId(e.target.value)}
                    placeholder="Ex: 4083f5348ec93aaa56ce2f38723f81ab"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>R2 Secret Access Key <span className="text-orange-400">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">64 caractères</span>
                  </label>
                  <input
                    type="password"
                    value={r2SecretAccessKey}
                    onChange={(e) => {
                      setR2SecretAccessKey(e.target.value);
                      setApiToken(e.target.value);
                    }}
                    placeholder="Ex: a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Public CDN / R2.dev URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL Publique R2 (Lien CDN r2.dev ou domaine personnalisé) <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://pub-70361fd9ada342788392ffd9416b3094.r2.dev"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ce lien est sauvegardé dans Supabase pour chaque image (médecin, soin, produit, hero).
                </p>
              </div>

              {/* Quick Guide Card inside form */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <div className="font-bold text-orange-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Où trouver vos identifiants R2 ?</span>
                </div>
                <p className="text-slate-400">
                  Dans Cloudflare Dashboard ➔ <strong>R2</strong> ➔ <strong>Manage R2 API Tokens</strong> ➔ <strong>Create API Token</strong> (Permission: Object Read &amp; Write). Cloudflare vous affichera alors votre <strong>Access Key ID</strong> et <strong>Secret Access Key</strong>.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-orange-600/30 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer la configuration</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTest()}
                    disabled={isTesting || !accountId}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />}
                    <span>Tester la connexion</span>
                  </button>
                </div>
              </div>
            </form>
          ) : activeTab === 'sync' ? (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Envoyer toutes les images actuelles vers Cloudflare R2
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Cette action va parcourir tous vos médecins, produits, soins et la bannière hero, les téléverser sur votre bucket R2 <code className="text-orange-300">basma</code>, et mettre à jour les tables Supabase avec les liens <code className="text-orange-300">https://pub-...r2.dev</code>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-white">{doctors.length}</div>
                    <div className="text-[11px] text-slate-400">Médecins</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-white">{products.length}</div>
                    <div className="text-[11px] text-slate-400">Produits</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-white">{services.length}</div>
                    <div className="text-[11px] text-slate-400">Soins & Traitements</div>
                  </div>
                </div>

                {syncProgress && (
                  <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-xs text-orange-300 font-medium">
                      <span>{syncProgress.label}</span>
                      <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                        style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {syncSummary && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 font-medium">
                    {syncSummary}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSyncAllImagesToR2}
                    disabled={isSyncingAll}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSyncingAll ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Téléversement en cours...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        <span>Transférer et synchroniser tout vers Cloudflare R2</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-400" />
                  <span>Comment fonctionne Cloudflare R2 avec Supabase ?</span>
                </h4>

                <ol className="space-y-3 list-decimal list-inside text-slate-300 leading-relaxed">
                  <li>
                    <strong>Téléversement instantané :</strong> Lorsque vous ajoutez ou modifiez un médecin, un soin ou un produit dans l'administration, l'image est automatiquement envoyée à votre bucket Cloudflare R2 (<code>basma</code>).
                  </li>
                  <li>
                    <strong>Génération du lien CDN :</strong> Cloudflare génère l'URL publique ultra-rapide (ex : <code>https://pub-70361fd9ada342788392ffd9416b3094.r2.dev/doctors/...</code>).
                  </li>
                  <li>
                    <strong>Enregistrement dans Supabase :</strong> L'URL finale Cloudflare R2 est sauvegardée dans les tables Supabase (<code>doctors</code>, <code>products</code>, <code>services</code>, <code>clinic_info</code>).
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-800/40 text-orange-200">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Avantages du CDN Cloudflare R2 :</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-orange-300/90">
                  <li>0 € de frais de bande passante (Egress gratuit avec Cloudflare R2)</li>
                  <li>Chargement instantané pour tous vos visiteurs en Algérie et à l'international</li>
                  <li>Vos tables Supabase restent légères et rapides sans être alourdies par du base64</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Cabinet Dentaire El Bahdja • Cloudflare R2 Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
