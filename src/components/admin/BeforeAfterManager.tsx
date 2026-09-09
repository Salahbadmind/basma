import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { BeforeAfterCase } from '../../types';
import { ImageUploadPicker } from './ImageUploadPicker';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SUPABASE_BEFORE_AFTER_SQL } from '../../lib/supabaseSql';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  Copy, 
  Clock, 
  UserCheck, 
  Database, 
  Eye, 
  X, 
  AlertTriangle, 
  Layers,
  ArrowRight,
  Code2
} from 'lucide-react';

interface BeforeAfterManagerProps {
  onOpenSupabaseModal?: () => void;
}

export const BeforeAfterManager: React.FC<BeforeAfterManagerProps> = ({ onOpenSupabaseModal }) => {
  const { 
    beforeAfterCases, 
    addBeforeAfterCase, 
    updateBeforeAfterCase, 
    deleteBeforeAfterCase, 
    doctors, 
    language 
  } = useClinic();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<BeforeAfterCase | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<BeforeAfterCase>({
    id: '',
    category: 'Whitening',
    title: { fr: '', ar: '', en: '' },
    beforeImage: '',
    afterImage: '',
    duration: { fr: '1 séance (45 min)', ar: 'جلسة واحدة (45 دقيقة)', en: '1 session (45 mins)' },
    doctorId: '',
    doctorName: '',
    description: { fr: '', ar: '', en: '' },
  });

  const categories = [
    { id: 'all', label: { fr: 'Toutes les catégories', ar: 'جميع الفئات', en: 'All Categories' } },
    { id: 'Whitening', label: { fr: 'Blanchiment Laser', ar: 'تبييض الأسنان', en: 'Teeth Whitening' } },
    { id: 'Veneers', label: { fr: 'Facettes Emax', ar: 'ابتسامة هوليود', en: 'Porcelain Veneers' } },
    { id: 'Implants', label: { fr: 'Implants & Couronnes', ar: 'زراعة الأسنان', en: 'Dental Implants' } },
    { id: 'Invisalign', label: { fr: 'Orthodontie & Aligneurs', ar: 'تقويم شفاف', en: 'Clear Aligners' } },
    { id: 'Restoration', label: { fr: 'Restaurations & Composites', ar: 'حشوات تجميلية', en: 'Restorations' } },
  ];

  const filteredCases = useMemo(() => {
    return beforeAfterCases.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        !searchTerm ||
        item.title.fr.toLowerCase().includes(term) ||
        item.title.ar.toLowerCase().includes(term) ||
        item.title.en.toLowerCase().includes(term) ||
        (item.doctorName && item.doctorName.toLowerCase().includes(term)) ||
        item.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [beforeAfterCases, selectedCategory, searchTerm]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    const newId = `case-${Date.now()}`;
    const defaultDoctor = doctors[0];
    setEditingCase(null);
    setFormData({
      id: newId,
      category: 'Whitening',
      title: { fr: '', ar: '', en: '' },
      beforeImage: '',
      afterImage: '',
      duration: { 
        fr: '1 séance (45 min)', 
        ar: 'جلسة واحدة (45 دقيقة)', 
        en: '1 session (45 mins)' 
      },
      doctorId: defaultDoctor ? defaultDoctor.id : '',
      doctorName: defaultDoctor ? defaultDoctor.name[language] : '',
      description: { fr: '', ar: '', en: '' },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: BeforeAfterCase) => {
    setEditingCase(c);
    setFormData({
      id: c.id,
      category: c.category,
      title: { ...c.title },
      beforeImage: c.beforeImage,
      afterImage: c.afterImage,
      duration: { ...c.duration },
      doctorId: c.doctorId || '',
      doctorName: c.doctorName || '',
      description: { ...c.description },
    });
    setIsModalOpen(true);
  };

  const handleDoctorChange = (doctorId: string) => {
    const doc = doctors.find(d => d.id === doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId,
      doctorName: doc ? doc.name.fr : '',
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.fr.trim() && !formData.title.ar.trim()) {
      showToast('Veuillez saisir au moins un titre en Français ou en Arabe', 'error');
      return;
    }
    if (!formData.beforeImage || !formData.afterImage) {
      showToast('Veuillez fournir les deux photos (Avant ET Après)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const preparedData: BeforeAfterCase = {
        ...formData,
        title: {
          fr: formData.title.fr.trim() || formData.title.ar.trim(),
          ar: formData.title.ar.trim() || formData.title.fr.trim(),
          en: formData.title.en.trim() || formData.title.fr.trim(),
        },
        duration: {
          fr: formData.duration.fr.trim() || '1 séance',
          ar: formData.duration.ar.trim() || 'جلسة واحدة',
          en: formData.duration.en.trim() || '1 session',
        },
        description: {
          fr: formData.description.fr.trim() || formData.title.fr,
          ar: formData.description.ar.trim() || formData.title.ar,
          en: formData.description.en.trim() || formData.title.en,
        },
      };

      if (editingCase) {
        await updateBeforeAfterCase(preparedData);
        showToast('Cas clinique mis à jour avec succès !');
      } else {
        await addBeforeAfterCase(preparedData);
        showToast('Nouveau cas clinique ajouté avec succès !');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de l’enregistrement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteBeforeAfterCase(id);
      setIsDeletingId(null);
      showToast('Cas clinique supprimé avec succès');
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const copySqlCode = () => {
    navigator.clipboard.writeText(SUPABASE_BEFORE_AFTER_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showToast('Code SQL copié dans le presse-papiers !');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="cursor-pointer hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Métamorphoses de Sourires (Avant / Après)
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Gérez les transformations cliniques affichées sur votre site avec comparaison interactive avant/après. 
              {isSupabaseConfigured() ? (
                <span className="text-emerald-400 font-medium ml-1">
                  ● Synchronisé en direct avec Supabase & Cloudflare R2
                </span>
              ) : (
                <span className="text-amber-400 font-medium ml-1">
                  ● Stockage local actif (Connectez Supabase pour persistance Cloud)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
              title="Afficher le script SQL Supabase"
            >
              <Code2 className="w-4 h-4 text-teal-400" />
              <span>Script SQL Supabase</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Cas Clinique</span>
            </button>
          </div>
        </div>

        {/* Collapsible Supabase SQL Quick Guide */}
        {showSqlGuide && (
          <div className="mt-5 pt-5 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Script SQL à coller dans Supabase (Table before_after_cases)
                </span>
              </div>
              <button
                onClick={copySqlCode}
                className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-teal-500/30 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copié !' : 'Copier le code SQL'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-48">
              {SUPABASE_BEFORE_AFTER_SQL}
            </pre>
            <p className="text-[11px] text-slate-400">
              💡 Instructions : Ouvrez votre <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-teal-400 underline">Dashboard Supabase</a> → Allez dans <strong>SQL Editor</strong> → Cliquez sur <strong>New Query</strong> → Collez le script ci-dessus et cliquez sur <strong>RUN</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label[language] || cat.label.fr}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre ou médecin..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Aucun cas clinique trouvé</h3>
            <p className="text-slate-400 text-xs mt-1">
              {searchTerm || selectedCategory !== 'all'
                ? 'Essayez de réinitialiser vos filtres de recherche.'
                : 'Commencez par ajouter votre premier cas clinique avant/après.'}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un premier cas</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCases.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                {/* Visual Side-by-Side Images */}
                <div className="relative h-48 bg-slate-900 grid grid-cols-2 gap-0.5 overflow-hidden border-b border-slate-800">
                  {/* Before Image */}
                  <div className="relative h-full overflow-hidden bg-slate-800">
                    <img
                      src={item.beforeImage}
                      alt="Avant"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                      Avant
                    </div>
                  </div>

                  {/* After Image */}
                  <div className="relative h-full overflow-hidden bg-slate-800">
                    <img
                      src={item.afterImage}
                      alt="Après"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                      Après
                    </div>
                  </div>

                  {/* Category Pill Over Center */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-teal-300 text-[10px] font-bold">
                    {item.category}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {item.title[language] || item.title.fr}
                    </h3>
                    {item.title.ar && (
                      <p className="text-xs text-slate-400 line-clamp-1 font-arabic mt-0.5" dir="rtl">
                        {item.title.ar}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description[language] || item.description.fr}
                  </p>

                  <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>{item.duration[language] || item.duration.fr}</span>
                    </div>
                    {item.doctorName && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.doctorName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                  ID: {item.id}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 px-2.5"
                    title="Modifier"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => setIsDeletingId(item.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer text-xs"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmer la suppression ?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Êtes-vous sûr de vouloir supprimer ce cas clinique ? Cette action est irréversible et supprimera le cas du site web et de Supabase.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteConfirm(isDeletingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingCase ? 'Modifier le Cas Clinique' : 'Nouveau Cas Clinique Avant / Après'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Catégorie du traitement *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Whitening">Blanchiment Dentaire (Whitening)</option>
                    <option value="Veneers">Facettes Dentaires / Hollywood Smile (Veneers)</option>
                    <option value="Implants">Implantologie & Couronnes (Implants)</option>
                    <option value="Invisalign">Orthodontie & Aligneurs (Invisalign)</option>
                    <option value="Restoration">Restaurations & Composites</option>
                    <option value="Surgery">Chirurgie & Esthétique Gingivale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Chirurgien-Dentiste en charge
                  </label>
                  <select
                    value={formData.doctorId || ''}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">-- Sélectionner un médecin --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name.fr} ({d.specialty.fr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title (Multilingual) */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Titres du Cas Clinique
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Titre en Français *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title.fr}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, fr: e.target.value }
                    })}
                    placeholder="ex: Blanchiment Fauteuil Laser - 8 Teintes gagnées"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Titre en Arabe (العربية)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.title.ar}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, ar: e.target.value }
                    })}
                    placeholder="مثال: تبييض الأسنان بالليزر في العيادة - تفتيح بـ 8 درجات"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-arabic"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Titre en Anglais (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title.en}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value }
                    })}
                    placeholder="e.g.: In-Office Laser Teeth Whitening - 8 Shades Lighter"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Photos Avant et Après (With Cloudflare / Direct Upload Picker) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                      Photo Avant (Before) *
                    </span>
                  </div>
                  <ImageUploadPicker
                    label="Image Avant Traitement"
                    folder="before-after"
                    value={formData.beforeImage}
                    onChange={(val) => setFormData({ ...formData, beforeImage: val })}
                    helperText="Photo des dents avant le soin."
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Photo Après (After) *
                    </span>
                  </div>
                  <ImageUploadPicker
                    label="Image Après Traitement"
                    folder="before-after"
                    value={formData.afterImage}
                    onChange={(val) => setFormData({ ...formData, afterImage: val })}
                    helperText="Photo du résultat final éclatant."
                    required
                  />
                </div>
              </div>

              {/* Live Preview If both images are present */}
              {formData.beforeImage && formData.afterImage && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Aperçu côte à côte :
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-32 rounded-lg overflow-hidden">
                    <div className="relative bg-slate-800">
                      <img src={formData.beforeImage} alt="Avant" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-rose-500/90 text-white text-[9px] font-black uppercase">Avant</span>
                    </div>
                    <div className="relative bg-slate-800">
                      <img src={formData.afterImage} alt="Après" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500/90 text-white text-[9px] font-black uppercase">Après</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Duration & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Durée du traitement (Français)
                  </label>
                  <input
                    type="text"
                    value={formData.duration.fr}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: { ...formData.duration, fr: e.target.value }
                    })}
                    placeholder="ex: 1 séance (45 min) ou 2 semaines"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Durée en Arabe (العربية)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.duration.ar}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: { ...formData.duration, ar: e.target.value }
                    })}
                    placeholder="مثال: جلسة واحدة (45 دقيقة)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-arabic"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description clinique (Français)
                </label>
                <textarea
                  rows={2}
                  value={formData.description.fr}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, fr: e.target.value }
                  })}
                  placeholder="Détails sur la technique employée, les teintes gagnées ou le cas initial..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description clinique en Arabe (العربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.description.ar}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, ar: e.target.value }
                  })}
                  placeholder="تفاصيل الحالة السريرية والنتيجة المحققة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-arabic"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-extrabold shadow-md shadow-teal-500/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : editingCase ? 'Mettre à jour' : 'Créer le Cas Clinique'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
