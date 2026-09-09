import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Star, MessageSquarePlus, CheckCircle2, ShieldCheck, ThumbsUp, X } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { reviews, addReview, language, t } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [rating, setRating] = useState(5);
  const [treatment, setTreatment] = useState('Détartrage & Polissage');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !comment.trim()) return;

    addReview({
      patientName: patientName.trim(),
      rating,
      treatmentName: {
        fr: treatment,
        ar: treatment,
        en: treatment,
      },
      comment: {
        fr: comment.trim(),
        ar: comment.trim(),
        en: comment.trim(),
      },
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setPatientName('');
      setComment('');
      setRating(5);
    }, 1500);
  };

  return (
    <section id="reviews" className="py-20 lg:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{t.reviewsSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.reviewsSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t.reviewsSection.subtitle}
          </p>
        </div>

        {/* Google Reviews Trust Banner */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black text-slate-900 leading-none">4.9</span>
              <div className="flex text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-slate-900 text-sm">
                <span>Google Avis Clients</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.reviewsSection.ratingSummary}
              </p>
            </div>
          </div>

          <button
            id="leave-review-trigger-btn"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t.reviewsSection.writeReviewBtn}</span>
          </button>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Rating & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                </div>

                {/* Treatment Tag */}
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold">
                  🩺 {rev.treatmentName[language]}
                </span>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment[language]}"
                </p>
              </div>

              {/* Patient Author Info */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {rev.patientName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.patientName}</h4>
                    <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.reviewsSection.verifiedBadge}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-400">Google ★</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Leave a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {t.reviewsSection.modal.title}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900">Merci pour votre avis !</h4>
                <p className="text-xs text-slate-500">Votre témoignage aide d'autres patients à choisir nos soins.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre Nom ou Initiales *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ex: Karim B."
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Note globale
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 text-2xl focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Traitement reçu
                  </label>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre expérience & commentaire *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre ressenti sur l'accueil, la douleur, la qualité du soin..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md hover:bg-teal-700"
                  >
                    Publier l'avis
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
