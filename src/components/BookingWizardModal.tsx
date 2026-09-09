import React, { useState, useMemo, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { TreatmentService, Doctor, Appointment } from '../types';
import confetti from 'canvas-confetti';
import { printAppointmentVoucher } from '../utils/printVoucher';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft, 
  MessageCircle, 
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  Lock,
  AlertCircle
} from 'lucide-react';

export const BookingWizardModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    closeBooking, 
    services, 
    doctors, 
    selectedServiceForBooking, 
    selectedDoctorForBooking,
    addAppointment,
    appointments,
    clinicInfo,
    language, 
    t 
  } = useClinic();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [notificationPref, setNotificationPref] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  
  // Completed Appointment Result
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Initialize or reset with selected props
  useEffect(() => {
    if (isBookingModalOpen) {
      setCurrentStep(1);
      setCreatedAppointment(null);
      setErrorMsg('');
      
      if (selectedServiceForBooking) {
        setSelectedServiceId(selectedServiceForBooking.id);
        setCurrentStep(2);
      } else {
        setSelectedServiceId(services[0]?.id || '');
      }

      if (selectedDoctorForBooking) {
        setSelectedDoctorId(selectedDoctorForBooking.id);
      } else {
        setSelectedDoctorId(''); // means 'any doctor'
      }

      // Default date to tomorrow or next business day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Format YYYY-MM-DD
      const dateStr = tomorrow.toISOString().slice(0, 10);
      setSelectedDate(dateStr);
      setSelectedTimeSlot('10:00');
    }
  }, [isBookingModalOpen, selectedServiceForBooking, selectedDoctorForBooking, services]);

  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const activeDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  // Available Time Slots for selected date
  const morningSlots = ['08:30', '09:15', '10:00', '10:45', '11:30', '12:15'];
  const afternoonSlots = ['13:30', '14:15', '15:00', '15:45', '16:30', '17:15'];
  const allSlots = [...morningSlots, ...afternoonSlots];

  // Helper to check if a specific time slot is already booked for the doctor & date
  const isSlotBooked = (time: string, dateToCheck = selectedDate, docIdToCheck = selectedDoctorId) => {
    const targetDocId = docIdToCheck || (activeService?.recommendedDoctorId || doctors[0]?.id);
    return appointments.some((apt) => {
      if (apt.date !== dateToCheck) return false;
      if (apt.timeSlot !== time) return false;
      if (apt.status === 'cancelled') return false; // Cancelled appointments free up the slot
      if (docIdToCheck) {
        return apt.doctorId === docIdToCheck;
      }
      return apt.doctorId === targetDocId;
    });
  };

  // Auto pick first available slot when date or doctor changes
  useEffect(() => {
    if (selectedDate) {
      if (!selectedTimeSlot || isSlotBooked(selectedTimeSlot)) {
        const firstFree = allSlots.find((time) => !isSlotBooked(time));
        if (firstFree) {
          setSelectedTimeSlot(firstFree);
        } else {
          setSelectedTimeSlot('');
        }
      }
    }
  }, [selectedDate, selectedDoctorId, appointments]);

  if (!isBookingModalOpen) return null;

  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!selectedServiceId) {
        setErrorMsg(language === 'ar' ? 'يرجى اختيار العلاج المطلوب' : 'Veuillez sélectionner un soin.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDate || !selectedTimeSlot) {
        setErrorMsg(
          language === 'ar' 
            ? 'يرجى تحديد التاريخ والوقت المناسب (المتاح بالأخضر)' 
            : 'Veuillez choisir une date et un horaire disponible (en vert).'
        );
        return;
      }
      if (isSlotBooked(selectedTimeSlot)) {
        setErrorMsg(
          language === 'ar'
            ? 'هذا التوقيت محجوز بالفعل (بالأحمر). يرجى اختيار موعد متاح بالأخضر.'
            : 'Ce créneau est déjà réservé (en rouge). Veuillez choisir un horaire disponible en vert.'
        );
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!patientName.trim() || !patientPhone.trim()) {
        setErrorMsg(language === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Veuillez renseigner votre nom et numéro de téléphone.');
        return;
      }

      // Anti-Spam & Abuse Protection: Check if this phone number already has multiple active reservations
      const cleanInputPhone = patientPhone.replace(/\D/g, '');
      const existingActiveBookings = appointments.filter((apt) => {
        const aptPhoneClean = apt.patientPhone.replace(/\D/g, '');
        return (
          aptPhoneClean.length >= 8 &&
          aptPhoneClean.slice(-8) === cleanInputPhone.slice(-8) &&
          (apt.status === 'pending' || apt.status === 'confirmed')
        );
      });

      if (existingActiveBookings.length >= 2) {
        setErrorMsg(
          language === 'ar'
            ? '⚠️ تنبيه: لديك بالفعل حجزين نشطين في النظام بهذا الرقم. لمنع إساءة الاستخدام أو لتعديل المواعيد، يرجى التواصل هاتفياً مباشرة مع العيادة.'
            : '⚠️ Attention : Vous avez déjà 2 réservations actives avec ce numéro de téléphone. Pour éviter les abus ou pour modifier vos rendez-vous, veuillez contacter directement le cabinet.'
        );
        return;
      }

      // Double-check slot collision prevention right before saving
      if (isSlotBooked(selectedTimeSlot)) {
        setErrorMsg(
          language === 'ar'
            ? 'عذراً، هذا التوقيت تم حجزه مسبقاً! يرجى العودة لاختيار توقيت آخر متاح بالأخضر.'
            : 'Désolé, ce créneau horaire vient d’être réservé ! Veuillez sélectionner un autre créneau disponible en vert.'
        );
        setCurrentStep(3);
        return;
      }

      // Save appointment
      const docId = selectedDoctorId || (activeService?.recommendedDoctorId || doctors[0].id);
      
      const newApt = addAppointment({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || 'patient@elbahdja.dz',
        serviceId: activeService.id,
        doctorId: docId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: patientNotes.trim(),
        isFirstVisit,
        notificationPreference: notificationPref,
        priceEstimatedDZD: activeService.priceDZD,
      });

      setCreatedAppointment(newApt);
      setCurrentStep(5);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#06b6d4', '#14b8a6', '#f59e0b'],
        });
      } catch (err) {
        // silent
      }
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  // Generate WhatsApp Direct Confirmation Link
  const getWhatsAppConfirmationUrl = () => {
    if (!createdAppointment) return '#';
    const doctorObj = doctors.find((d) => d.id === createdAppointment.doctorId);
    const docName = doctorObj ? doctorObj.name[language] : 'Dr. Ahmed Benali';
    const serviceName = activeService.name[language];

    const message =
      language === 'ar'
        ? `السلام عليكم عيادة البهجة لطب الأسنان 🦷\n\nأود تأكيد حجز موعدي:\n📌 رقم الملف: ${createdAppointment.id}\n👤 المريض: ${createdAppointment.patientName}\n🩺 العلاج: ${serviceName}\n👨‍⚕️ الطبيب: ${docName}\n📅 الموعد: ${createdAppointment.date} في تمام الساعة ${createdAppointment.timeSlot}\n📱 الهاتف: ${createdAppointment.patientPhone}`
        : `Bonjour Cabinet Dentaire El Bahdja 🦷\n\nJe confirme ma demande de rendez-vous :\n📌 Réf : ${createdAppointment.id}\n👤 Patient : ${createdAppointment.patientName}\n🩺 Soin : ${serviceName}\n👨‍⚕️ Praticien : ${docName}\n📅 Date & Heure : ${createdAppointment.date} à ${createdAppointment.timeSlot}\n📱 Téléphone : ${createdAppointment.patientPhone}`;

    return `https://wa.me/${clinicInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Wizard Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {t.booking.modalTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.booking.modalSubtitle}
            </p>
          </div>

          <button
            id="close-booking-wizard-btn"
            onClick={closeBooking}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-600 shrink-0">
            {[
              { num: 1, label: t.booking.step1Title },
              { num: 2, label: t.booking.step2Title },
              { num: 3, label: t.booking.step3Title },
              { num: 4, label: t.booking.step4Title },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex items-center gap-1.5 ${
                  currentStep === step.num
                    ? 'text-teal-700 font-bold'
                    : currentStep > step.num
                    ? 'text-teal-600'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === step.num
                      ? 'bg-teal-600 text-white'
                      : currentStep > step.num
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span className="hidden sm:inline">{step.label.split('. ')[1]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Wizard Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Treatment */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>{t.booking.selectServicePrompt}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    id={`booking-opt-service-${srv.id}`}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedServiceId === srv.id
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                          {srv.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {srv.priceDZD.toLocaleString()} {t.common.dzd}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {srv.name[language]}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {srv.shortDescription[language]}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <span>⏱ {srv.durationMinutes} {t.common.minutes}</span>
                      <span className="text-teal-700 font-semibold">
                        {selectedServiceId === srv.id ? '✓ Sélectionné' : 'Choisir'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Doctor */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>{t.booking.selectDoctorPrompt}</span>
              </h3>

              {/* Option: Any Available Specialist */}
              <div
                id="booking-doc-any"
                onClick={() => setSelectedDoctorId('')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDoctorId === ''
                    ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {t.booking.anyDoctor}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {language === 'ar'
                        ? 'سيتم توجيهك للطبيب المتاح والمختص في هذا العلاج'
                        : 'Affectation automatique au praticien référent disponible.'}
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-teal-600 flex items-center justify-center">
                  {selectedDoctorId === '' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                </div>
              </div>

              {/* Specific Doctor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    id={`booking-doc-${doc.id}`}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedDoctorId === doc.id
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={doc.imageUrl}
                      alt={doc.name[language]}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {doc.name[language]}
                      </h4>
                      <p className="text-xs text-teal-800 font-medium truncate">
                        {doc.title[language]}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ⭐ {doc.rating} • {doc.experienceYears}+ {language === 'ar' ? 'سنوات' : 'ans'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Date & Time Slot */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Date selection & Praticien reminder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{t.booking.selectDatePrompt}</span>
                  </h3>
                  {activeDoctor && (
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      👨‍⚕️ {activeDoctor.name[language]}
                    </span>
                  )}
                </div>
                
                <input
                  type="date"
                  id="booking-date-input"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Real-time Color Legend (Green vs Red) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 font-bold border border-emerald-300/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{language === 'ar' ? 'أخضر : موعد متاح' : 'Vert : Créneau Libre'}</span>
                  </span>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100/80 text-rose-800 font-bold border border-rose-300/60">
                    <Lock className="w-3 h-3 text-rose-600" />
                    <span>{language === 'ar' ? 'أحمر : محجوز مسبقاً (مغلق)' : 'Rouge : Déjà Réservé'}</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {language === 'ar' ? 'حجز حصري بدون ازدواجية' : 'Créneaux exclusifs sans doublon'}
                </span>
              </div>

              {/* Morning Slots */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.booking.morningSlots}</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {language === 'ar' ? 'الفترة الصباحية' : 'Matinée'}
                  </span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {morningSlots.map((time) => {
                    const booked = isSlotBooked(time);
                    const isSelected = selectedTimeSlot === time && !booked;

                    if (booked) {
                      return (
                        <div
                          key={time}
                          id={`time-slot-${time.replace(':', '')}`}
                          title={language === 'ar' ? 'هذا الموعد محجوز مسبقاً' : 'Ce créneau est déjà réservé par un autre patient'}
                          className="py-2 px-2 rounded-xl text-center bg-rose-50/90 border border-rose-300/80 text-rose-700 cursor-not-allowed opacity-80 flex flex-col items-center justify-center transition-all select-none"
                        >
                          <div className="flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-rose-500" />
                            <span className="text-xs font-bold line-through text-rose-600">{time}</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded mt-0.5">
                            {language === 'ar' ? 'محجوز' : 'Occupé'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        id={`time-slot-${time.replace(':', '')}`}
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 scale-105 border-2 border-emerald-400 ring-2 ring-emerald-300'
                            : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 hover:border-emerald-400'
                        }`}
                      >
                        <span className={`text-xs ${isSelected ? 'font-black text-white' : 'font-bold text-emerald-900'}`}>
                          {time}
                        </span>
                        <span className={`text-[9px] font-bold mt-0.5 px-1 py-0.2 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'text-emerald-700'
                        }`}>
                          {isSelected ? '✓ Sélectionné' : '🟢 Libre'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.booking.afternoonSlots}</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {language === 'ar' ? 'فترة ما بعد الظهر' : 'Après-midi'}
                  </span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {afternoonSlots.map((time) => {
                    const booked = isSlotBooked(time);
                    const isSelected = selectedTimeSlot === time && !booked;

                    if (booked) {
                      return (
                        <div
                          key={time}
                          id={`time-slot-${time.replace(':', '')}`}
                          title={language === 'ar' ? 'هذا الموعد محجوز مسبقاً' : 'Ce créneau est déjà réservé par un autre patient'}
                          className="py-2 px-2 rounded-xl text-center bg-rose-50/90 border border-rose-300/80 text-rose-700 cursor-not-allowed opacity-80 flex flex-col items-center justify-center transition-all select-none"
                        >
                          <div className="flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-rose-500" />
                            <span className="text-xs font-bold line-through text-rose-600">{time}</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded mt-0.5">
                            {language === 'ar' ? 'محجوز' : 'Occupé'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        id={`time-slot-${time.replace(':', '')}`}
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 scale-105 border-2 border-emerald-400 ring-2 ring-emerald-300'
                            : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 hover:border-emerald-400'
                        }`}
                      >
                        <span className={`text-xs ${isSelected ? 'font-black text-white' : 'font-bold text-emerald-900'}`}>
                          {time}
                        </span>
                        <span className={`text-[9px] font-bold mt-0.5 px-1 py-0.2 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'text-emerald-700'
                        }`}>
                          {isSelected ? '✓ Sélectionné' : '🟢 Libre'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Patient Info & Channel Preferences */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>{t.booking.form.fullName}</span>
              </h3>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.booking.form.fullName} *
                </label>
                <input
                  type="text"
                  id="patient-name-input"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={t.booking.form.fullNamePlaceholder}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Patient Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.booking.form.phone} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      🇩🇿 +213
                    </span>
                    <input
                      type="tel"
                      id="patient-phone-input"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder={t.booking.form.phonePlaceholder}
                      className="w-full pl-16 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.booking.form.email}
                  </label>
                  <input
                    type="email"
                    id="patient-email-input"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder={t.booking.form.emailPlaceholder}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* First Visit Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  {t.booking.form.firstVisitQuestion}
                </span>
                <div className="flex gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="firstVisit"
                      checked={isFirstVisit === true}
                      onChange={() => setIsFirstVisit(true)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{t.booking.form.yes}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="firstVisit"
                      checked={isFirstVisit === false}
                      onChange={() => setIsFirstVisit(false)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{t.booking.form.no}</span>
                  </label>
                </div>
              </div>

              {/* Message / Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.booking.form.message}
                </label>
                <textarea
                  id="patient-message-input"
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder={t.booking.form.messagePlaceholder}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notification Channel Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.booking.form.notificationPref}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotificationPref('whatsapp')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      notificationPref === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    💬 WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationPref('email')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      notificationPref === 'email'
                        ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    ✉️ Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationPref('sms')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      notificationPref === 'sms'
                        ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    📱 SMS
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: Instant Booking Confirmation Pass */}
          {currentStep === 5 && createdAppointment && (
            <div className="space-y-6 text-center">
              
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-lg shadow-teal-500/10">
                <CheckCircle2 className="w-10 h-10 text-teal-600" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {t.booking.success.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {t.booking.success.subtitle}
                </p>
              </div>

              {/* Printable Appointment Pass Card */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 text-left space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      {t.booking.success.refNumber}
                    </span>
                    <span className="text-lg font-black text-teal-700 tracking-wider">
                      #{createdAppointment.id.toUpperCase()}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                    {language === 'ar' ? 'حجز مسجل ومؤكد' : 'RDV Pré-Réservé'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.booking.summary.patient}</span>
                    <span className="font-bold text-slate-800 text-sm">{createdAppointment.patientName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{t.booking.summary.dateTime}</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {createdAppointment.date} • {createdAppointment.timeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{t.booking.summary.service}</span>
                    <span className="font-semibold text-slate-800">{activeService.name[language]}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{t.booking.summary.doctor}</span>
                    <span className="font-semibold text-slate-800">
                      {activeDoctor?.name[language] || 'Dr. Ahmed Benali'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>📍 {clinicInfo.address[language]}</span>
                  <span className="font-bold text-teal-700">
                    {createdAppointment.priceEstimatedDZD?.toLocaleString()} {t.common.dzd}
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Direct Confirmation */}
              <div className="space-y-3 pt-2">
                <a
                  id="whatsapp-direct-confirmation-link"
                  href={getWhatsAppConfirmationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{t.booking.success.sendWhatsappDirect}</span>
                </a>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (createdAppointment) {
                        printAppointmentVoucher({
                          appointment: createdAppointment,
                          clinicInfo,
                          service: activeService,
                          doctor: activeDoctor,
                          language,
                        });
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.booking.success.printVoucher}</span>
                  </button>

                  <button
                    onClick={closeBooking}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{t.booking.success.doneBtn}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Controls (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                id="booking-back-btn"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.common.back}</span>
              </button>
            ) : (
              <button
                onClick={closeBooking}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
            )}

            <button
              id="booking-next-btn"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>{currentStep === 4 ? t.common.confirm : t.common.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
