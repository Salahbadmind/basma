import { Appointment, ClinicInfo, Language, TreatmentService, Doctor } from '../types';

export function printAppointmentVoucher({
  appointment,
  clinicInfo,
  service,
  doctor,
  language,
}: {
  appointment: Appointment;
  clinicInfo: ClinicInfo;
  service?: TreatmentService | null;
  doctor?: Doctor | null;
  language: Language;
}) {
  const isAr = language === 'ar';
  const clinicName = clinicInfo.name[language] || clinicInfo.name.fr;
  const clinicAddress = clinicInfo.address[language] || clinicInfo.address.fr;
  const serviceName = service?.name[language] || service?.name.fr || appointment.serviceId;
  const doctorName = doctor?.name[language] || doctor?.name.fr || 'Dr. Ahmed Benali';

  const htmlContent = `
<!DOCTYPE html>
<html lang="${language}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>Bon de Rendez-vous - ${appointment.id.toUpperCase()}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #1e293b;
      padding: 20px;
    }
    .voucher-card {
      max-width: 650px;
      margin: 0 auto;
      border: 2px solid #0f766e;
      border-radius: 16px;
      padding: 28px;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .clinic-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f766e;
    }
    .clinic-subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .badge {
      background-color: #ccfbf1;
      color: #0f766e;
      font-weight: 700;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 9999px;
      border: 1px solid #99f6e4;
      display: inline-block;
    }
    .ref-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
    }
    .ref-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .ref-value {
      font-size: 18px;
      font-weight: 900;
      color: #0f766e;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 22px;
    }
    .info-item {
      padding: 10px 14px;
      border-radius: 8px;
      background: #f1f5f9;
    }
    .info-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-val {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .price-box {
      border-top: 2px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      margin-bottom: 20px;
    }
    .price-amount {
      font-size: 18px;
      font-weight: 800;
      color: #0f766e;
    }
    .footer-notes {
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer-notes strong {
      color: #1e293b;
    }
    .print-btn-bar {
      margin-top: 20px;
      text-align: center;
    }
    .print-btn {
      background: #0f766e;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    @media print {
      .print-btn-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
      .voucher-card {
        border-color: #0f766e;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="header">
      <div>
        <div class="clinic-title">🦷 ${clinicName}</div>
        <div class="clinic-subtitle">${clinicAddress} • Alger</div>
        <div class="clinic-subtitle">📞 ${clinicInfo.phone} | Urgences: ${clinicInfo.emergencyPhone || clinicInfo.phone}</div>
      </div>
      <div>
        <span class="badge">${isAr ? 'بطاقة حجز موعد مؤكد' : 'BON DE RENDEZ-VOUS'}</span>
      </div>
    </div>

    <div class="ref-section">
      <div>
        <div class="ref-label">${isAr ? 'رقم الحجز المرجعي' : 'RÉFÉRENCE DU RENDEZ-VOUS'}</div>
        <div class="ref-value">#${appointment.id.toUpperCase()}</div>
      </div>
      <div style="text-align: ${isAr ? 'left' : 'right'};">
        <div class="ref-label">${isAr ? 'الحالة' : 'STATUT'}</div>
        <div style="font-weight: 800; color: #059669;">${isAr ? 'مؤكد في الجدول' : 'CONFIRMÉ'}</div>
      </div>
    </div>

    <div class="grid">
      <div class="info-item">
        <div class="info-label">${isAr ? 'اسم المريض' : 'PATIENT'}</div>
        <div class="info-val">${appointment.patientName}</div>
        <div style="font-size: 12px; color: #475569; margin-top: 2px;">📞 ${appointment.patientPhone}</div>
      </div>

      <div class="info-item">
        <div class="info-label">${isAr ? 'التاريخ والوقت المحدد' : 'DATE & HEURE'}</div>
        <div class="info-val">📅 ${appointment.date}</div>
        <div style="font-size: 13px; color: #0f766e; font-weight: 800; margin-top: 2px;">⏰ ${appointment.timeSlot}</div>
      </div>

      <div class="info-item">
        <div class="info-label">${isAr ? 'العلاج أو الفحص' : 'SOIN OU TRAITEMENT'}</div>
        <div class="info-val">${serviceName}</div>
      </div>

      <div class="info-item">
        <div class="info-label">${isAr ? 'طبيب الأسنان المعالج' : 'CHIRURGIEN-DENTISTE'}</div>
        <div class="info-val">👨‍⚕️ ${doctorName}</div>
      </div>
    </div>

    <div class="price-box">
      <span><strong>${isAr ? 'التعريفة التقديرية للخدمة :' : 'Tarif indicatif du soin :'}</strong></span>
      <span class="price-amount">${appointment.priceEstimatedDZD ? appointment.priceEstimatedDZD.toLocaleString() : '0'} DA</span>
    </div>

    <div class="footer-notes">
      <p>📌 <strong>${isAr ? 'تعليمات مهمة للمريض :' : 'Consignes importantes :'}</strong></p>
      <p>• ${isAr ? 'يرجى الحضور إلى العيادة قبل 10 دقائق من الموعد المحدد.' : 'Prière de vous présenter au cabinet 10 minutes avant l’heure prévue.'}</p>
      <p>• ${isAr ? 'في حال الرغبة في التأجيل أو الإلغاء، يرجى الاتصال بنا مسبقاً على الرقم' : 'En cas d’empêchement ou de report, veuillez nous avertir au'} <strong>${clinicInfo.phone}</strong>.</p>
      <p>• ${isAr ? 'العنوان : ' : 'Adresse : '} ${clinicAddress} (Wilaya d’Alger).</p>
    </div>

    <div class="print-btn-bar">
      <button class="print-btn" onclick="window.print()">🖨️ ${isAr ? 'طباعة هذه البطاقة' : 'Imprimer ce bon de rendez-vous'}</button>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>
`;

  // Reliable Blob URL opening for download/print with iframe popup safety
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      let printWindow: Window | null = null;
      try {
        printWindow = window.open(url, '_blank');
      } catch {
        printWindow = null;
      }

      if (!printWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = `bon-rendez-vous-${appointment.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore cleanup errors
        }
      }, 15000);
    }
  } catch (err) {
    console.warn('Unable to print voucher directly in current environment:', err);
  }
}
