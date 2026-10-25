import React, { useState } from 'react';
import { PatientNote, ResidentLogNote } from '../types/patient';
import { generateClinicalTextNote, calculateDaysOfStay, compareBedNumbers } from '../utils/clinicalFormat';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Mail,
  MessageCircle,
  FileText,
  UserCheck,
  BookOpen,
} from 'lucide-react';

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientNote | null;
  allPatients?: PatientNote[];
  residentNotes?: ResidentLogNote[];
  mode: 'single' | 'all';
}

export const ShareNoteModal: React.FC<ShareNoteModalProps> = ({
  isOpen,
  onClose,
  patient,
  allPatients = [],
  residentNotes = [],
  mode,
}) => {
  const [outgoingResident, setOutgoingResident] = useState('Dr. Residente Saliente');
  const [incomingResident, setIncomingResident] = useState('Dr. Residente Entrante');
  const [includeResidentNotes, setIncludeResidentNotes] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Sorted patients from lowest bed to highest
  const sortedPatients = [...allPatients].sort((a, b) => compareBedNumbers(a.bed, b.bed));

  const getShareText = () => {
    const now = new Date().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (mode === 'single' && patient) {
      let singleText = `*ENTREGA DE GUARDIA - FICHA DE PACIENTE*\nDe: ${outgoingResident} -> Para: ${incomingResident}\nFecha/Hora: ${now}\n\n${generateClinicalTextNote(patient)}`;

      if (includeResidentNotes && residentNotes && residentNotes.length > 0) {
        const activeLogs = residentNotes.filter((n) => !n.completed);
        if (activeLogs.length > 0) {
          singleText += `\n\n========================================\n`;
          singleText += `📋 BITÁCORA Y PENDIENTES DE GUARDIA (RESIDENTES)\n`;
          singleText += `========================================\n`;
          activeLogs.forEach((n, idx) => {
            const urgentTag = n.priority === 'alta' ? '⚠️ [URGENTE] ' : '';
            const docTag = n.assignedDoctor ? ` | Destino: ${n.assignedDoctor}` : ' | Sin médico en específico';
            singleText += `[${idx + 1}] ${urgentTag}${n.title.toUpperCase()} (${n.category.toUpperCase()})\n`;
            singleText += `De: ${n.authorResident || 'Residente'}${docTag}\n`;
            singleText += `${n.content}\n\n`;
          });
        }
      }

      return singleText;
    }

    // Mode 'all': full handover of active shift
    let text = `🏥 *ENTREGA DE GUARDIA HOSPITALARIA - PASE DE VISITA*\n`;
    text += `📅 Fecha: ${now}\n`;
    text += `👨‍⚕️ Entrega: ${outgoingResident}\n`;
    text += `👩‍⚕️ Recibe: ${incomingResident}\n`;
    text += `📊 Total Pacientes en Censo: ${sortedPatients.length}\n`;
    text += `========================================\n\n`;

    sortedPatients.forEach((p, idx) => {
      const stay = calculateDaysOfStay(p.admissionDate);
      text += `*${idx + 1}. [${p.bed || 'SIN CAMA'}] ${p.fullName} (${p.age} ${p.ageUnit})*\n`;
      text += `• Tratante: ${p.attendingPhysician}\n`;
      if (Boolean(p.hasSecondDoctor || p.coAttendingPhysician) && p.coAttendingPhysician) {
        text += `• 2do Médico: ${p.coAttendingPhysician}\n`;
      }
      text += `• Servicio: ${p.service || 'General'}\n`;
      text += `• Ingreso: ${p.admissionDate || 'N/R'} (Día ${stay} estancia)\n`;
      text += `• Diagnóstico: ${p.diagnosis}\n`;
      text += `• Dieta: ${p.diet}\n`;
      text += `• Soluciones: ${p.ivSolutions}\n`;
      if (p.infusions && !p.infusions.toLowerCase().includes('sin infusiones')) {
        text += `• ⚠️ Infusiones: ${p.infusions}\n`;
      }
      text += `• 👁️ Vigilar: ${p.surveillance || 'Habitual'}\n`;
      const pend = p.pendingTasks.filter((t) => !t.completed);
      if (pend.length > 0) {
        text += `• 📌 Pendientes: ${pend.map((t) => t.text).join('; ')}\n`;
      } else {
        text += `• 📌 Pendientes: Sin pendientes activos\n`;
      }
      if (p.isPostpartum && p.newborn) {
        text += `• 🍼 RN (Alojamiento Conjunto): ${p.newborn.relationLabel} (${p.newborn.sex === 'masculino' ? '♂' : '♀'}, ${p.newborn.gestationalWeeks}${p.newborn.gestationalDays ? `.${p.newborn.gestationalDays}` : ''} SDG por ${p.newborn.gestationalAgeMethod}${p.newborn.weightGrams ? `, ${p.newborn.weightGrams}g` : ''}) - Pediatra: ${p.newborn.attendingPediatrician}${p.newborn.diagnosis ? ` | Dx RN: ${p.newborn.diagnosis}` : ''}\n`;
      }
      text += `----------------------------------------\n\n`;
    });

    // Append Resident Bitácora & General Pendings if enabled
    if (includeResidentNotes && residentNotes && residentNotes.length > 0) {
      const activeLogs = residentNotes.filter((n) => !n.completed);
      if (activeLogs.length > 0) {
        text += `========================================\n`;
        text += `📋 BITÁCORA Y PENDIENTES DE GUARDIA (RESIDENTES)\n`;
        text += `(Avisos de turno, códigos y pendientes sin paciente específico)\n`;
        text += `========================================\n\n`;
        activeLogs.forEach((n, idx) => {
          const urgentTag = n.priority === 'alta' ? '⚠️ [URGENTE] ' : '';
          const docTag = n.assignedDoctor ? ` | Destino: ${n.assignedDoctor}` : ' | Sin médico en específico (Guardia general)';
          text += `[${idx + 1}] ${urgentTag}${n.title.toUpperCase()} (${n.category.toUpperCase()})\n`;
          text += `De: ${n.authorResident || 'Residente'}${docTag}\n`;
          text += `${n.content}\n`;
          text += `----------------------------------------\n\n`;
        });
      }
    }

    return text;
  };

  const shareText = getShareText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTelegram = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Entrega de Guardia Médica - ${new Date().toLocaleDateString('es-MX')}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-teal-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {mode === 'single' ? 'Compartir Nota con Médico de Guardia' : 'Compartir Entrega de Guardia (Pase Completo)'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Envío rápido a colegas vía WhatsApp, Telegram o portapapeles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Header handover resident info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Residente que Entrega
              </label>
              <input
                type="text"
                value={outgoingResident}
                onChange={(e) => setOutgoingResident(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Residente que Recibe
              </label>
              <input
                type="text"
                value={incomingResident}
                onChange={(e) => setIncomingResident(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Toggle to include Resident Bitácora */}
          {residentNotes && residentNotes.length > 0 && (
            <label className="flex items-center gap-2.5 p-2.5 bg-teal-50 border border-teal-200 rounded-xl cursor-pointer text-xs text-teal-950 font-medium hover:bg-teal-100/70 transition-colors">
              <input
                type="checkbox"
                checked={includeResidentNotes}
                onChange={(e) => setIncludeResidentNotes(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>
                  Compartir también la <strong>Bitácora y Pendientes de Guardia</strong> ({residentNotes.filter((n) => !n.completed).length} activos)
                </span>
              </div>
            </label>
          )}

          {/* Quick Share Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={handleTelegram}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
            >
              <Send className="w-4 h-4" />
              <span>Enviar por Telegram</span>
            </button>

            <button
              onClick={handleEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
            >
              <Mail className="w-4 h-4" />
              <span>Correo Electrónico</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium rounded-lg transition-colors cursor-pointer text-xs ml-auto shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copiar Todo el Texto</span>
                </>
              )}
            </button>
          </div>

          {/* Text preview */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Vista Previa del Mensaje para el Médico de Turno
            </label>
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] max-h-60 overflow-y-auto whitespace-pre-line leading-relaxed selection:bg-teal-600">
              {shareText}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
