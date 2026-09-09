import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Server,
  Code2,
  Cloud,
  FileCode,
  Sparkles
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  isSupabaseConfigured 
} from '../../lib/supabase';
import { 
  testSupabaseConnection, 
  pushAllDataToSupabase, 
  SupabaseTestResult,
  fetchAppointmentsFromSupabase,
  fetchOrdersFromSupabase,
  fetchProductsFromSupabase,
  fetchServicesFromSupabase,
  fetchDoctorsFromSupabase,
  fetchReviewsFromSupabase,
  fetchClinicInfoFromSupabase,
  fetchBeforeAfterCasesFromSupabase
} from '../../lib/supabaseSync';
import { SUPABASE_CLEAN_RECREATE_SQL, SUPABASE_MIGRATION_SQL, SUPABASE_BEFORE_AFTER_SQL, SUPABASE_SQL_SCHEMA } from '../../lib/supabaseSql';
import { useClinic } from '../../context/ClinicContext';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCloudflare?: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose, onOpenCloudflare }) => {
  const { 
    doctors, 
    services, 
    products, 
    appointments, 
    orders, 
    reviews, 
    clinicInfo,
    beforeAfterCases,
    setDoctors,
    setServices,
    setProducts,
    setAppointments,
    setOrders,
    setReviews,
    setClinicInfo,
    setBeforeAfterCases
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'sync' | 'sql'>('sync');
  const [sqlMode, setSqlMode] = useState<'clean' | 'alter' | 'before_after'>('before_after');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      if (creds.url && creds.anonKey) {
        handleTest(creds.url, creds.anonKey);
      }
    }
  }, [isOpen]);

  const handleTest = async (testUrl = url, testKey = anonKey) => {
    setIsTesting(true);
    setActionMessage(null);
    if (testUrl && testKey) {
      saveSupabaseCredentials(testUrl, testKey);
    }
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      if (result.success) {
        setActionMessage({ type: 'success', text: 'Connexion à Supabase validée avec succès !' });
      } else {
        setActionMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Erreur lors du test de connexion.',
        tables: {
          appointments: false,
          product_orders: false,
          products: false,
          services: false,
          doctors: false,
          reviews: false,
          clinic_info: false
        }
      });
      setActionMessage({ type: 'error', text: err?.message || 'Erreur inconnue.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setActionMessage({ type: 'error', text: 'Veuillez saisir votre URL Supabase et votre clé Anon.' });
      return;
    }
    saveSupabaseCredentials(url, anonKey);
    await handleTest(url, anonKey);
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    setActionMessage({ type: 'info', text: 'Supabase déconnecté. Le système fonctionne maintenant sur le stockage local.' });
  };

  const handlePushAllToSupabase = async () => {
    setIsPushing(true);
    setActionMessage(null);
    try {
      const res = await pushAllDataToSupabase({
        doctors,
        services,
        products,
        appointments,
        orders,
        reviews,
        clinicInfo,
        beforeAfterCases,
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: '🚀 Toutes les données (CMS, Hero, Médecins, Soins, Produits, Cas Avant/Après, RDV, Commandes) ont été synchronisées dans vos tables Supabase !' });
        await handleTest();
      } else {
        setActionMessage({ type: 'error', text: `Erreur d’exportation : ${res.message}` });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Erreur lors de la synchronisation.' });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullAllFromSupabase = async () => {
    setIsPulling(true);
    setActionMessage(null);
    try {
      const [remoteDocs, remoteSrvs, remoteProds, remoteApts, remoteOrds, remoteRevs, remoteInfo, remoteCases] = await Promise.all([
        fetchDoctorsFromSupabase(),
        fetchServicesFromSupabase(),
        fetchProductsFromSupabase(),
        fetchAppointmentsFromSupabase(),
        fetchOrdersFromSupabase(),
        fetchReviewsFromSupabase(),
        fetchClinicInfoFromSupabase(),
        fetchBeforeAfterCasesFromSupabase(),
      ]);

      let count = 0;
      if (remoteDocs && remoteDocs.length > 0) { setDoctors(remoteDocs); count++; }
      if (remoteSrvs && remoteSrvs.length > 0) { setServices(remoteSrvs); count++; }
      if (remoteProds && remoteProds.length > 0) { setProducts(remoteProds); count++; }
      if (remoteApts && remoteApts.length > 0) { setAppointments(remoteApts); count++; }
      if (remoteOrds && remoteOrds.length > 0) { setOrders(remoteOrds); count++; }
      if (remoteRevs && remoteRevs.length > 0) { setReviews(remoteRevs); count++; }
      if (remoteInfo) { setClinicInfo(remoteInfo); count++; }
      if (remoteCases && remoteCases.length > 0) { setBeforeAfterCases(remoteCases); count++; }

      if (count > 0) {
        setActionMessage({ type: 'success', text: `📥 Données rechargées avec succès depuis Supabase (${count} modules synchronisés) !` });
      } else {
        setActionMessage({ type: 'info', text: 'Les tables Supabase semblent vides. Utilisez le bouton "Remplir Supabase (Seed)" pour les remplir.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Erreur lors de la récupération.' });
    } finally {
      setIsPulling(false);
    }
  };

  const currentSql = 
    sqlMode === 'before_after'
      ? SUPABASE_BEFORE_AFTER_SQL
      : sqlMode === 'clean'
      ? SUPABASE_CLEAN_RECREATE_SQL
      : SUPABASE_MIGRATION_SQL;

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl text-slate-100 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gestion de la Base de Données Supabase</span>
                {isSupabaseConfigured() && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Connecté
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Stockage centralisé : CMS, Textes d'accueil, Hero, Email, Mot de passe, Photos Cloudflare, RDV et Boutique
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connexion & Synchronisation</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Code SQL Supabase (Éditeur)</span>
          </button>

          {onOpenCloudflare && (
            <button
              onClick={onOpenCloudflare}
              className="pb-2.5 px-4 text-xs font-bold transition-all border-b-2 border-transparent text-orange-400 hover:text-orange-300 ml-auto flex items-center gap-1.5 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Stockage Cloudflare ↗</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Action / Error Banner */}
          {actionMessage && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              actionMessage.type === 'success' ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-200' :
              actionMessage.type === 'error' ? 'bg-rose-950/70 border border-rose-700/60 text-rose-200' :
              'bg-slate-800/80 border border-slate-700 text-slate-200'
            }`}>
              {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> :
               actionMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> :
               <Database className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
              <div className="flex-1 font-medium">{actionMessage.text}</div>
            </div>
          )}

          {activeTab === 'sync' && (
            <>
              {/* Credentials Form */}
              <form onSubmit={handleSaveAndConnect} className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identifiants API Supabase</span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Tableau de bord Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Project URL (ex: <code className="text-emerald-400 text-[11px]">https://your-project.supabase.co</code>)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Trouvez ceci dans <strong>Project Settings → API</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Anon / Public API Key (ex: <code className="text-emerald-400 text-[11px]">eyJhbGciOi...</code>)
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Clé publique anonyme <code>anon / public</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isTesting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>Tester & Enregistrer</span>
                    </button>

                    {url && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all cursor-pointer"
                      >
                        Déconnecter
                      </button>
                    )}
                  </div>

                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Ouvrir Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </form>

              {/* Diagnostics / Table Health Check */}
              {testResult && (
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>État des tables Supabase</span>
                    <span className={`text-[11px] font-bold ${testResult.success ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {testResult.success ? '7/7 Tables Opérationnelles' : 'Attention requise'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(testResult.tables).map(([tableName, status]) => {
                      const isOk = status === true;
                      return (
                        <div
                          key={tableName}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            isOk 
                              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' 
                              : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                          }`}
                        >
                          <span className="font-mono text-[11px] truncate">{tableName}</span>
                          {isOk ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Push / Pull Sync Actions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions de synchronisation globale</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Push Local to Cloud */}
                  <button
                    type="button"
                    onClick={handlePushAllToSupabase}
                    disabled={isPushing || !isSupabaseConfigured()}
                    className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5 text-emerald-400 mb-1.5 font-bold text-xs">
                      {isPushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      <span>Remplir Supabase (Seed / Push)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Envoie tous les paramètres CMS, textes d'accueil, hero, médecins, soins, produits et réservations actuels vers vos tables Supabase.
                    </p>
                  </button>

                  {/* Pull Cloud to Local */}
                  <button
                    type="button"
                    onClick={handlePullAllFromSupabase}
                    disabled={isPulling || !isSupabaseConfigured()}
                    className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 text-left transition-all group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5 text-teal-400 mb-1.5 font-bold text-xs">
                      {isPulling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                      <span>Recharger depuis Supabase (Pull)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Récupère toutes les dernières données enregistrées dans votre base Supabase pour actualiser l'application.
                    </p>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              {/* Script Selection Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSqlMode('before_after')}
                  className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                    sqlMode === 'before_after'
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 shadow-sm'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      Table Avant / Après
                    </span>
                    <span className="text-[10px] bg-cyan-500/30 text-cyan-200 font-bold px-1.5 py-0.5 rounded">
                      Nouveau
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Crée la table `before_after_cases` avec RLS et politiques de lecture.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSqlMode('clean')}
                  className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                    sqlMode === 'clean'
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 shadow-sm'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
                      <Server className="w-3.5 h-3.5" />
                      Toutes les 8 tables (DROP)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Recrée l'intégralité des 8 tables cliniques et colonnes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSqlMode('alter')}
                  className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                    sqlMode === 'alter'
                      ? 'bg-teal-500/20 border border-teal-500/50 text-teal-200 shadow-sm'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-teal-300">
                      <FileCode className="w-3.5 h-3.5" />
                      Mise à niveau (ALTER)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ajoute les colonnes manquantes sans effacer les données.
                  </p>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-200 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      Script SQL Sélectionné ({sqlMode === 'before_after' ? 'Table Avant / Après (before_after_cases)' : sqlMode === 'clean' ? 'Réinitialisation DROP & RECREATE' : 'Mise à niveau ALTER'})
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/90">
                    {sqlMode === 'before_after'
                      ? 'Crée la table `before_after_cases` avec RLS actif et politiques publiques.'
                      : sqlMode === 'clean' 
                      ? 'Ce script remplace les anciennes tables par les 8 tables complètes avec toutes les colonnes requises et RLS.' 
                      : 'Ce script ajoute les colonnes manquantes (whatsapp, hero, etc.) à votre table clinic_info existante.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/30 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'Copié dans le presse-papier !' : 'Copier ce script SQL'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/_/sql"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <span>Ouvrir SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step by Step instructions */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Instructions d’exécution en 3 étapes simples :</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Cliquez sur <strong>« Copier ce script SQL »</strong> ci-dessus.</li>
                  <li>Allez dans votre projet Supabase → cliquez sur <strong>SQL Editor</strong> dans le menu latéral.</li>
                  <li>Créez une <strong>New Query</strong>, collez le script et cliquez sur le bouton vert <strong>RUN</strong>.</li>
                  <li>Revenez dans cet onglet et cliquez sur <strong>« Remplir Supabase (Seed / Push) »</strong> pour insérer toutes les données !</li>
                </ol>
              </div>

              {/* Code viewer container */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 text-slate-300">
                      {sqlMode === 'clean' ? '01_supabase_drop_and_recreate_all.sql' : '02_supabase_alter_missing_columns.sql'}
                    </span>
                  </div>

                  <button
                    onClick={handleCopySql}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed select-all">
                  <code>{currentSql}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Cabinet Dentaire El Bahdja • Supabase Engine</span>
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
