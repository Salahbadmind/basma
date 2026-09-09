import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { algeriaWilayas, getWilayaByCode } from '../data/algeriaWilayas';
import { Product } from '../types';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight, 
  Sparkles,
  Phone,
  User,
  MapPin,
  FileText
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutModalOpen, 
    closeCheckout, 
    productForCheckout, 
    language, 
    t, 
    addOrder,
    clinicInfo 
  } = useClinic();

  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default Algiers
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  // Selected Wilaya details
  const currentWilaya = getWilayaByCode(selectedWilayaCode) || algeriaWilayas[15];

  // Set default commune when wilaya changes
  useEffect(() => {
    if (currentWilaya && currentWilaya.communes.length > 0) {
      setCommune(currentWilaya.communes[0]);
    }
  }, [selectedWilayaCode]);

  // Reset form on open
  useEffect(() => {
    if (isCheckoutModalOpen) {
      setOrderConfirmed(null);
      setQuantity(1);
      setIsSubmitting(false);
    }
  }, [isCheckoutModalOpen]);

  if (!isCheckoutModalOpen || !productForCheckout) return null;

  const deliveryFee = deliveryType === 'home' 
    ? currentWilaya.homeDeliveryFee 
    : currentWilaya.deskDeliveryFee;
  const subtotal = productForCheckout.priceDZD * quantity;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !commune.trim()) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية ورقم الهاتف.' : 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = addOrder({
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerPhone2: phone2.trim() || undefined,
        wilayaCode: selectedWilayaCode,
        wilayaName: language === 'ar' ? currentWilaya.nameAr : currentWilaya.nameFr,
        commune: commune.trim(),
        deliveryAddress: address.trim(),
        deliveryType,
        deliveryFeeDZD: deliveryFee,
        items: [
          {
            productId: productForCheckout.id,
            productSlug: productForCheckout.slug,
            productName: productForCheckout.name[language] || productForCheckout.name.fr,
            priceDZD: productForCheckout.priceDZD,
            quantity: quantity,
            imageUrl: productForCheckout.images[0] || productForCheckout.image,
            image: productForCheckout.images[0] || productForCheckout.image,
          },
        ],
        subtotalDZD: subtotal,
        totalDZD: total,
        notes: notes.trim() || undefined,
        source: 'direct',
      });

      setOrderConfirmed(newOrder);
      setIsSubmitting(false);
    }, 600);
  };

  const generateWhatsappMessage = () => {
    if (!orderConfirmed) return '';
    const prodName = productForCheckout.name[language] || productForCheckout.name.fr;
    if (language === 'ar') {
      return `مرحباً، أود تأكيد طلبي لـ ${prodName} (الكمية: ${quantity}). رقم الطلب: ${orderConfirmed.orderNumber}، الولاية: ${currentWilaya.nameAr}، البلدية: ${commune}. المبلغ الإجمالي عند الاستلام: ${total.toLocaleString()} دج.`;
    }
    return `Bonjour Cabinet El Bahdja, je confirme ma commande pour ${prodName} (Qté: ${quantity}). Réf commande: ${orderConfirmed.orderNumber}, Wilaya: ${currentWilaya.nameFr}, Commune: ${commune}. Total à la livraison: ${total.toLocaleString()} DA.`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        id="checkout-modal-container"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {orderConfirmed ? t.checkout.successTitle : t.checkout.modalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {orderConfirmed ? t.checkout.successSubtitle : t.checkout.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={closeCheckout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {orderConfirmed ? (
            /* Order Success View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75 duration-300" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-300 dark:border-amber-700">
                  {t.checkout.orderRef}: {orderConfirmed.orderNumber}
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {fullName}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  {language === 'ar' 
                    ? `تم تسجيل طلبكم بنجاح لتوصيله إلى ${commune} (${currentWilaya.nameAr}). سيصلكم الطرد خلال 24-48 ساعة، يرجى تجهيز المبلغ (${total.toLocaleString()} دج) نقداً عند الاستلام.`
                    : `Votre commande sera livrée à ${commune} (${currentWilaya.nameFr}) sous 24-48h. Prévoyez le montant exact (${total.toLocaleString()} DA) en espèces à la livraison.`}
                </p>
              </div>

              {/* Order Quick Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t.checkout.productPrice}:</span>
                  <span className="font-semibold">{productForCheckout.name[language] || productForCheckout.name.fr} (x{quantity})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t.checkout.deliveryFee}:</span>
                  <span className="font-semibold">{deliveryFee} DA ({deliveryType === 'home' ? t.checkout.homeDelivery : t.checkout.deskDelivery})</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-teal-700 dark:text-teal-400">
                  <span>{t.checkout.total}:</span>
                  <span>{total.toLocaleString()} DA</span>
                </div>
              </div>

              {/* Actions: Direct WhatsApp confirmation & close */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                <a
                  id="whatsapp-confirm-order-btn"
                  href={`https://wa.me/${clinicInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(generateWhatsappMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{t.checkout.whatsappConfirmBtn}</span>
                </a>
                <button
                  id="finish-checkout-btn"
                  onClick={closeCheckout}
                  className="px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-sm transition-colors"
                >
                  {t.checkout.continueShopping}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product preview banner in modal */}
              <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-900/50">
                <img 
                  src={productForCheckout.images[0]} 
                  alt={productForCheckout.name[language] || productForCheckout.name.fr}
                  className="w-14 h-14 object-cover rounded-lg bg-white border border-teal-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {productForCheckout.name[language] || productForCheckout.name.fr}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                      {productForCheckout.priceDZD.toLocaleString()} DA
                    </span>
                    {productForCheckout.originalPriceDZD && (
                      <span className="text-xs text-slate-400 line-through">
                        {productForCheckout.originalPriceDZD.toLocaleString()} DA
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-bold rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-bold rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.checkout.fullName} *</span>
                  </label>
                  <input
                    id="checkout-fullname-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t.checkout.fullNamePlaceholder}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Primary Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.checkout.phone} *</span>
                  </label>
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t.checkout.phonePlaceholder}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Wilaya Selection (58 Wilayas) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.checkout.wilaya} *</span>
                  </label>
                  <select
                    id="checkout-wilaya-select"
                    value={selectedWilayaCode}
                    onChange={e => setSelectedWilayaCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {algeriaWilayas.map(w => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameFr} ({w.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commune Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.checkout.commune} *</span>
                  </label>
                  {currentWilaya.communes.length > 0 ? (
                    <select
                      id="checkout-commune-select"
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      {currentWilaya.communes.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="checkout-commune-input"
                      type="text"
                      required
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      placeholder={t.checkout.selectCommune}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  )}
                </div>

              </div>

              {/* Exact Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.checkout.address} *
                </label>
                <input
                  id="checkout-address-input"
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={t.checkout.addressPlaceholder}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Delivery Type Option (Home vs Stop-desk) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t.checkout.deliveryType}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      deliveryType === 'home'
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{t.checkout.homeDelivery}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Directement à votre adresse</div>
                    </div>
                    <span className="font-bold text-xs text-teal-700 dark:text-teal-400">{currentWilaya.homeDeliveryFee} DA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('desk')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      deliveryType === 'desk'
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{t.checkout.deskDelivery}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Bureau Yalidine / Procolis</div>
                    </div>
                    <span className="font-bold text-xs text-teal-700 dark:text-teal-400">{currentWilaya.deskDeliveryFee} DA</span>
                  </button>
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.checkout.subtotal} ({quantity} {quantity > 1 ? 'articles' : 'article'}):</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.checkout.deliveryFee} ({currentWilaya.nameFr}):</span>
                  <span className="font-semibold">+{deliveryFee} DA</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{t.checkout.total}:</span>
                  <span className="text-teal-600 dark:text-teal-400 font-extrabold">{total.toLocaleString()} DA</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-order-cod-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                {isSubmitting ? (
                  <span>{t.checkout.submitting}</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.checkout.confirmOrderBtn} ({total.toLocaleString()} DA)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paiement en espèces à la livraison. Aucun paiement en ligne requis.</span>
              </p>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
