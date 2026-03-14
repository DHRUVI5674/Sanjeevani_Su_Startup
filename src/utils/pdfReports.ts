import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/* ─── Color palette matching Sanjeevani brand ─── */
const COLORS = {
  primary: [8, 145, 178] as [number, number, number],     // #0891B2
  accent: [245, 158, 11] as [number, number, number],     // #F59E0B
  dark: [30, 41, 59] as [number, number, number],         // #1E293B
  gray: [100, 116, 139] as [number, number, number],      // #64748B
  lightBg: [235, 247, 250] as [number, number, number],   // #EBF7FA
  white: [255, 255, 255] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],      // #10B981
  red: [239, 68, 68] as [number, number, number],         // #EF4444
};

/* ─── Shared Header ─── */
function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  const w = doc.internal.pageSize.getWidth();

  // Top accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, w, 4, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 4, w, 1.5, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text('Sanjeevani', 14, 18);

  // Diamond divider
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text('◇ ——— ◇', 14, 23);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.text(title, 14, 32);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.gray);
    doc.text(subtitle, 14, 37);
  }

  // Date stamp
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, w - 14, 18, { align: 'right' });
}

/* ─── Shared Footer ─── */
function addFooter(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...COLORS.lightBg);
  doc.rect(0, h - 12, w, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text('Sanjeevani — Digital Health Platform  |  This is a computer-generated document', w / 2, h - 5, { align: 'center' });
}

/* ════════════════════════════════════════════════
   1. PRESCRIPTION PDF — Doctor issues → Patient downloads
   ════════════════════════════════════════════════ */
export function generatePrescriptionPDF(rx: {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  bloodGroup?: string;
  doctorName: string;
  doctorSpecialization?: string;
  hospitalName: string;
  hospitalCity?: string;
  diagnosis: string;
  generalInstructions?: string;
  prescriptionDate: string;
  validUntil?: string;
  medicines: {
    name: string;
    dosage: string;
    form: string;
    timesPerDay: number;
    durationDays: number;
    schedule?: { time: string; label: string; with: string }[];
    specialInstructions?: string;
  }[];
}) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  addHeader(doc, '💊 Prescription', `${rx.hospitalName}${rx.hospitalCity ? ' — ' + rx.hospitalCity : ''}`);

  let y = 44;

  // Patient & Doctor info box
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(14, y, w - 28, 28, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Patient:', 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${rx.patientName}${rx.patientAge ? `, ${rx.patientAge} yrs` : ''}${rx.patientGender ? `, ${rx.patientGender}` : ''}`, 40, y + 7);

  if (rx.bloodGroup) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.red);
    doc.text(`Blood: ${rx.bloodGroup}`, w - 18, y + 7, { align: 'right' });
  }

  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Doctor:', 18, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dr. ${rx.doctorName}${rx.doctorSpecialization ? ' (' + rx.doctorSpecialization + ')' : ''}`, 40, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Diagnosis:', 18, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(rx.diagnosis, 48, y + 21);

  y += 34;

  // Date line
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Date: ${rx.prescriptionDate ? format(new Date(rx.prescriptionDate), 'dd MMM yyyy') : '—'}`, 14, y);
  if (rx.validUntil) {
    doc.text(`Valid Until: ${format(new Date(rx.validUntil), 'dd MMM yyyy')}`, w - 14, y, { align: 'right' });
  }
  y += 6;

  // Rx symbol
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.primary);
  doc.text('℞', 14, y + 10);
  y += 4;

  // Medicines table
  const medRows = rx.medicines.map((m, idx) => {
    const scheduleStr = (m.schedule || []).map(s => `${s.label} (${s.time}) — ${s.with}`).join('\n');
    return [
      String(idx + 1),
      `${m.name}\n${m.form}`,
      m.dosage,
      `${m.timesPerDay}× / day\n${m.durationDays} days`,
      scheduleStr || '—',
      m.specialInstructions || '—',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Medicine', 'Dosage', 'Frequency', 'Schedule', 'Instructions']],
    body: medRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, textColor: COLORS.dark, lineColor: [209, 235, 241], lineWidth: 0.3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [247, 251, 252] },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 30 }, 4: { cellWidth: 42 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // General Instructions
  if (rx.generalInstructions) {
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(14, y, w - 28, 16, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.dark);
    doc.text('General Instructions:', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.generalInstructions, 18, y + 12);
    y += 20;
  }

  // Signature line
  doc.setDrawColor(...COLORS.gray);
  doc.line(w - 70, y + 12, w - 14, y + 12);
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Dr. ${rx.doctorName}`, w - 42, y + 18, { align: 'center' });
  doc.text('Authorized Signatory', w - 42, y + 22, { align: 'center' });

  addFooter(doc);

  doc.save(`Prescription_${rx.patientName.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

/* ════════════════════════════════════════════════
   2. FEEDBACK REPORT PDF — Per-patient feedback
   ════════════════════════════════════════════════ */
export function generateFeedbackPDF(data: {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  bloodGroup?: string;
  doctorName: string;
  hospitalName: string;
  diagnosis: string;
  prescriptionDate: string;
  feedback: {
    improvement_rating: number;
    adherence_rating: string;
    symptoms_resolved: boolean;
    pain_level_before: number;
    pain_level_after: number;
    had_side_effects: boolean;
    side_effects: string[];
    side_effect_severity?: string;
    patient_notes?: string;
    submitted_at?: string;
    medicine_feedback?: { medicine_name: string; rating: number; notes?: string }[];
  };
}) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const fb = data.feedback;
  const ratingLabels = ['', 'Much worse', 'Worse', 'Same', 'Better', 'Much better'];
  const ratingEmojis = ['', '😞', '😕', '😐', '🙂', '😊'];

  addHeader(doc, '📊 Patient Feedback Report', data.hospitalName);

  let y = 44;

  // Patient box
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(14, y, w - 28, 20, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text(`Patient: ${data.patientName}`, 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Dr. ${data.doctorName} | Diagnosis: ${data.diagnosis}`, 18, y + 14);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Rx Date: ${data.prescriptionDate ? format(new Date(data.prescriptionDate), 'dd MMM yyyy') : '—'}`, w - 18, y + 7, { align: 'right' });
  y += 28;

  // Big rating cards
  const cardW = (w - 42) / 3;
  const cards = [
    { label: 'Improvement', value: `${ratingLabels[fb.improvement_rating] || '—'}`, sub: `${fb.improvement_rating}/5`, color: COLORS.green },
    { label: 'Adherence', value: fb.adherence_rating, sub: '', color: COLORS.primary },
    { label: 'Pain Change', value: `${fb.pain_level_before} → ${fb.pain_level_after}`, sub: `${fb.pain_level_before > fb.pain_level_after ? '↓ Improved' : fb.pain_level_before === fb.pain_level_after ? '= Same' : '↑ Worsened'}`, color: fb.pain_level_before > fb.pain_level_after ? COLORS.green : COLORS.red },
  ];

  cards.forEach((c, i) => {
    const x = 14 + i * (cardW + 7);
    doc.setFillColor(...c.color);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(c.label, x + cardW / 2, y + 6, { align: 'center' });
    doc.setFontSize(12);
    doc.text(c.value, x + cardW / 2, y + 14, { align: 'center' });
    if (c.sub) {
      doc.setFontSize(7);
      doc.text(c.sub, x + cardW / 2, y + 19, { align: 'center' });
    }
  });
  y += 30;

  // Symptoms resolved
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Symptoms Resolved:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(fb.symptoms_resolved ? COLORS.green[0] : COLORS.red[0], fb.symptoms_resolved ? COLORS.green[1] : COLORS.red[1], fb.symptoms_resolved ? COLORS.green[2] : COLORS.red[2]);
  doc.text(fb.symptoms_resolved ? '✅ Yes' : '❌ No', 58, y);
  y += 8;

  // Side effects
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Side Effects:', 14, y);
  if (fb.had_side_effects) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.red);
    doc.text(`⚠️ ${fb.side_effect_severity || ''}  —  ${(fb.side_effects || []).join(', ')}`, 46, y);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.green);
    doc.text('None reported', 46, y);
  }
  y += 10;

  // Medicine-wise feedback
  if (fb.medicine_feedback && fb.medicine_feedback.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.dark);
    doc.text('Medicine-wise Feedback', 14, y);
    y += 4;

    const medRows = fb.medicine_feedback.map(mf => [
      mf.medicine_name,
      `${mf.rating}/5`,
      mf.notes || '—',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Medicine', 'Rating', 'Patient Notes']],
      body: medRows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.dark },
      headStyles: { fillColor: COLORS.accent, textColor: COLORS.white, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Patient notes
  if (fb.patient_notes) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, w - 28, 18, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.gray);
    doc.text("Patient's Words:", 18, y + 6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.dark);
    doc.text(`"${fb.patient_notes}"`, 18, y + 13);
  }

  addFooter(doc);
  doc.save(`Feedback_Report_${data.patientName.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

/* ════════════════════════════════════════════════
   3. ANALYTICS REPORT PDF — Aggregated hospital report
   ════════════════════════════════════════════════ */
export function generateAnalyticsReportPDF(data: {
  hospitalName: string;
  totalPrescriptions: number;
  totalFeedback: number;
  feedbackRate: number;
  avgImprovement: string;
  topMedicine: string;
  topMedicines: { name: string; count: number }[];
  effectivenessData: { name: string; rating: number }[];
  ageGroupData: { group: string; rating: number; count: number }[];
  sideEffects: { name: string; value: number }[];
  adherenceData: { name: string; value: number }[];
}) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  addHeader(doc, '📈 Prescription Analytics Report', data.hospitalName);

  let y = 44;

  // Summary cards
  const cardW = (w - 42) / 4;
  const summaryCards = [
    { label: 'Total Rx', value: String(data.totalPrescriptions), color: COLORS.primary },
    { label: 'Feedback Rate', value: data.feedbackRate + '%', color: COLORS.green },
    { label: 'Avg Improvement', value: data.avgImprovement + '/5', color: COLORS.accent },
    { label: 'Most Prescribed', value: data.topMedicine.length > 12 ? data.topMedicine.slice(0, 12) + '...' : data.topMedicine, color: COLORS.gray },
  ];

  summaryCards.forEach((c, i) => {
    const x = 14 + i * (cardW + 4.6);
    doc.setFillColor(...c.color);
    doc.roundedRect(x, y, cardW, 18, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(c.label, x + cardW / 2, y + 6, { align: 'center' });
    doc.setFontSize(13);
    doc.text(c.value, x + cardW / 2, y + 14, { align: 'center' });
  });
  y += 26;

  // Section: Top Medicines
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Top Prescribed Medicines', 14, y);
  y += 4;

  if (data.topMedicines.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Medicine', 'Times Prescribed']],
      body: data.topMedicines.slice(0, 10).map((m, i) => [String(i + 1), m.name, String(m.count)]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.dark },
      headStyles: { fillColor: COLORS.accent, textColor: COLORS.white },
      columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 2: { cellWidth: 30, halign: 'center' } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.gray);
    doc.text('No prescription data yet.', 14, y + 6);
    y += 14;
  }

  // Section: Medicine Effectiveness
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Medicine Effectiveness (Patient Ratings)', 14, y);
  y += 4;

  if (data.effectivenessData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Medicine', 'Avg Rating (1-5)', 'Assessment']],
      body: data.effectivenessData.map(m => [
        m.name,
        m.rating.toFixed(1),
        m.rating >= 4 ? '✅ Effective' : m.rating >= 3 ? '🟡 Moderate' : '⚠️ Low',
      ]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.dark },
      headStyles: { fillColor: COLORS.green, textColor: COLORS.white },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.gray);
    doc.text('No effectiveness data yet.', 14, y + 6);
    y += 14;
  }

  // New page for more sections
  doc.addPage();
  addHeader(doc, '📈 Analytics Report (continued)', data.hospitalName);
  y = 44;

  // Section: Age Group Analysis
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Effectiveness by Age Group', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Age Group', 'Avg Improvement', 'Responses', 'Assessment']],
    body: data.ageGroupData.map(a => [
      a.group,
      a.rating > 0 ? a.rating.toFixed(1) + '/5' : 'No data',
      String(a.count),
      a.count === 0 ? '—' : a.rating >= 4 ? '✅ Great response' : a.rating >= 3 ? '🟡 Moderate' : '⚠️ Below average',
    ]),
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.dark },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section: Side Effects
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Reported Side Effects', 14, y);
  y += 4;

  if (data.sideEffects.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Side Effect', 'Reports', '% of Feedback']],
      body: data.sideEffects.map(se => [
        se.name,
        String(se.value),
        data.totalFeedback > 0 ? ((se.value / data.totalFeedback) * 100).toFixed(0) + '%' : '—',
      ]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.dark },
      headStyles: { fillColor: COLORS.red, textColor: COLORS.white },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.gray);
    doc.text('No side effects reported.', 14, y + 6);
    y += 14;
  }

  // Section: Adherence
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('Medicine Adherence Distribution', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Adherence Level', 'Patients', 'Assessment']],
    body: data.adherenceData.map(a => [
      a.name,
      String(a.value),
      a.name === 'Always' || a.name === 'Mostly' ? '✅ Good' : a.name === 'Sometimes' ? '🟡 Moderate' : '⚠️ Needs attention',
    ]),
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.dark },
    headStyles: { fillColor: [139, 92, 246], textColor: COLORS.white },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`Analytics_Report_${data.hospitalName.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
