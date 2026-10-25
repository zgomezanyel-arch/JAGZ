import React, { useState } from 'react';
import { PatientNote } from '../types/patient';
import { generateClinicalTextNote, formatDateSpanish, calculateDaysOfStay } from '../utils/clinicalFormat';
import {
  Copy,
  Check,
  Edit2,
  Trash2,
  Printer,
  Stethoscope,
  Utensils,
  Droplet,
  FileSpreadsheet,
  Pill,
  CheckSquare,
  Square,
  AlertTriangle,
  Activity,
  Eye,
  Calendar,
  Share2,
  Baby,
  UserCheck,
} from 'lucide-react';

interface PatientCardProps {
  patient: PatientNote;
  onEdit: (patient: PatientNote) => void;
  onDelete: (id: string) => void;
  onTogglePending: (patientId: string, pendingId: string) => void;
  onViewDetail: (patient: PatientNote) => void;
  onDuplicate: (patient: PatientNote) => void;
  onShareSingle?: (patient: PatientNote) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
  onTogglePending,
  onViewDetail,
  onDuplicate,
  onShareSingle,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    const text = generateClinicalTextNote(patient);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pendingCount = patient.pendingTasks?.filter((p) => !p.completed).length || 0;
  const hasHighPriority = patient.pendingTasks?.some((p) => !p.completed && p.priority === 'alta');
  const stayDays = calculateDaysOfStay(patient.admissionDate);

  return (
    <article className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs hover:border-slate-400 hover:shadow-sm transition-all flex flex-col justify-between print-card text-[11px] divide-y divide-slate-200">
      {/* 1. Header with patient identity & location - Crisp Delimited Box */}
      <div className="p-3 bg-slate-50/90">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            {/* Top badges bar */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mb-1">
              {patient.bed && (
                <span className="font-bold text-teal-900 bg-teal-100/80 px-2 py-0.5 rounded border border-teal-300">
                  {patient.bed}
                </span>
              )}
              {patient.service && (
                <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                  {patient.service}
                </span>
              )}
              {patient.isPostpartum && (
                <span className="font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                  <Baby className="w-3 h-3 text-rose-600" />
                  <span>Binomio Madre-Hijo</span>
                </span>
              )}
              {patient.admissionDate && (
                <span className="flex items-center gap-1 text-slate-600 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  <Calendar className="w-2.5 h-2.5 text-teal-600" />
                  <span>Ingreso: {patient.admissionDate}</span>
                  <span className="font-bold text-teal-800 bg-teal-50 px-1 rounded">
                    (Día {stayDays})
                  </span>
                </span>
              )}
            </div>

            {/* Patient Name */}
            <h3 className="text-[13px] font-bold text-slate-900 tracking-tight leading-snug truncate">
              {patient.fullName}
            </h3>

            {/* Doctors: Primary Attending & Optional Second Doctor */}
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-1 text-[10.5px] text-slate-700">
                <span className="font-bold text-slate-900">
                  {patient.age} {patient.ageUnit}
                </span>
                <span aria-hidden="true" className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-slate-700 truncate max-w-xs">
                  <Stethoscope className="w-3 h-3 text-teal-600 shrink-0" />
                  <span className="font-medium truncate">{patient.attendingPhysician}</span>
                </span>
              </div>

              {/* Segundo Médico a Cargo si fue registrado */}
              {Boolean(patient.hasSecondDoctor || patient.coAttendingPhysician) && patient.coAttendingPhysician && (
                <div className="flex items-center gap-1 text-[10px] text-slate-600 pl-0.5">
                  <UserCheck className="w-3 h-3 text-teal-700 shrink-0" />
                  <span className="font-semibold text-slate-700">2do Dr:</span>
                  <span className="truncate font-medium text-slate-800 bg-teal-50 px-1 rounded border border-teal-200">
                    {patient.coAttendingPhysician}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick status & pending indicators */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {pendingCount > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold ${
                  hasHighPriority
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {hasHighPriority && <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />}
                <span className="font-mono tabular-nums">{pendingCount}</span> pend.
              </span>
            )}
            <span className="text-[9px] text-slate-400 font-mono">
              {formatDateSpanish(patient.updatedAt || patient.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Maternal Clinical Content */}
      <div className="p-3 space-y-2.5 flex-1 text-[11px] text-slate-700 bg-white">
        {/* Diagnóstico de la Madre */}
        <section>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
            <FileSpreadsheet className="w-3 h-3 text-teal-600" />
            <span>Diagnóstico</span>
          </div>
          <p className="text-slate-900 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200 leading-relaxed text-[11px]">
            {patient.diagnosis || 'Diagnóstico no registrado'}
          </p>
        </section>

        {/* Dieta & Soluciones Intravenosas in crisp 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Dieta */}
          <section className="bg-amber-50/40 rounded-lg p-2 border border-amber-200">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
              <Utensils className="w-3 h-3 text-amber-600" />
              <span>Dieta</span>
            </div>
            <p className="text-slate-900 text-[11px] font-medium leading-snug">
              {patient.diet || 'Ayuno'}
            </p>
          </section>

          {/* Soluciones Intravenosas */}
          <section className="bg-sky-50/40 rounded-lg p-2 border border-sky-200">
            <div className="flex items-center gap-1 text-[10px] font-bold text-sky-900 uppercase tracking-wider mb-0.5">
              <Droplet className="w-3 h-3 text-sky-600" />
              <span>Soluciones IV</span>
            </div>
            <p className="text-slate-900 text-[10.5px] font-mono leading-snug">
              {patient.ivSolutions || 'Sin soluciones activas'}
            </p>
          </section>
        </div>

        {/* Infusiones Continuas Especiales (si existen) */}
        {patient.infusions && patient.infusions.trim() !== '' && !patient.infusions.toLowerCase().includes('sin infusiones') && (
          <section className="bg-violet-50/60 rounded-lg p-2 border border-violet-200">
            <div className="flex items-center gap-1 text-[10px] font-bold text-violet-950 uppercase tracking-wider mb-0.5">
              <Activity className="w-3 h-3 text-violet-600" />
              <span>Infusiones Continuas (Bomba / Titulables)</span>
            </div>
            <p className="text-violet-950 text-[10.5px] font-mono font-medium leading-snug">
              {patient.infusions}
            </p>
          </section>
        )}

        {/* VIGILAR POR (Datos de Alarma / Residencia) */}
        {patient.surveillance && (
          <section className="bg-rose-50/50 rounded-lg p-2 border border-rose-200">
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-950 uppercase tracking-wider mb-0.5">
              <Eye className="w-3 h-3 text-rose-600" />
              <span>Vigilar por (Signos Vitales, Dolor, Vómitos, Alarmas)</span>
            </div>
            <p className="text-rose-950 text-[11px] font-medium leading-relaxed">
              {patient.surveillance}
            </p>
          </section>
        )}

        {/* Tratamiento Farmacológico */}
        <section>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
            <Pill className="w-3 h-3 text-teal-600" />
            <span>Tratamiento y Medicamentos</span>
          </div>
          <div className="text-[10.5px] text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 whitespace-pre-line font-mono leading-relaxed">
            {patient.treatment || 'Sin tratamiento farmacológico'}
          </div>
        </section>

        {/* Pendientes Clínicos */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              <CheckSquare className="w-3 h-3 text-teal-600" />
              <span>Pendientes ({patient.pendingTasks?.length || 0})</span>
            </div>
            <span className="text-[9px] text-slate-400">Clic para cambiar estado</span>
          </div>

          {patient.pendingTasks && patient.pendingTasks.length > 0 ? (
            <ul className="space-y-1">
              {patient.pendingTasks.map((item) => (
                <li
                  key={item.id}
                  onClick={() => onTogglePending(patient.id, item.id)}
                  className={`flex items-start gap-1.5 p-1.5 rounded-md cursor-pointer transition-colors text-[10.5px] ${
                    item.completed
                      ? 'bg-slate-50 text-slate-400 line-through'
                      : item.priority === 'alta'
                      ? 'bg-rose-50 hover:bg-rose-100 text-slate-800 border border-rose-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-teal-600 shrink-0"
                    aria-label={item.completed ? 'Marcar pendiente' : 'Marcar completado'}
                  >
                    {item.completed ? (
                      <CheckSquare className="w-3 h-3 text-teal-600" />
                    ) : (
                      <Square className="w-3 h-3" />
                    )}
                  </button>
                  <span className="flex-1">{item.text}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase shrink-0 ${
                      item.priority === 'alta'
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'media'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.priority}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[10px] text-slate-400 italic bg-slate-50 p-1.5 rounded border border-slate-200">
              Sin pendientes activos
            </p>
          )}
        </section>

        {/* 3. APARTADO DE RECIÉN NACIDO: UBICADO HASTA ABAJO DE LA FICHA SEGÚN SOLICITUD */}
        {patient.isPostpartum && patient.newborn && (
          <section className="mt-3 pt-2.5 border-t-2 border-rose-200 bg-rose-50/60 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between border-b border-rose-200/80 pb-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-950">
                <Baby className="w-3.5 h-3.5 text-rose-600" />
                <span>Recién Nacido (Alojamiento Conjunto)</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                patient.newborn.sex === 'masculino'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {patient.newborn.sex === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[10.5px]">
              <div>
                <span className="text-slate-500 font-semibold">RN: </span>
                <span className="font-bold text-slate-900">{patient.newborn.relationLabel}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Pediatra: </span>
                <span className="font-bold text-rose-900">{patient.newborn.attendingPediatrician}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Edad Gestacional: </span>
                <span className="font-mono text-slate-900 font-bold">
                  {patient.newborn.gestationalWeeks}{patient.newborn.gestationalDays ? `.${patient.newborn.gestationalDays}` : ''} SDG ({patient.newborn.gestationalAgeMethod})
                </span>
              </div>
              {patient.newborn.weightGrams && (
                <div>
                  <span className="text-slate-500 font-semibold">Peso: </span>
                  <span className="font-mono text-slate-900 font-bold">{patient.newborn.weightGrams.toLocaleString()} g</span>
                  <span className="text-slate-500 text-[9px]"> ({(patient.newborn.weightGrams / 1000).toFixed(2)} kg)</span>
                </div>
              )}
            </div>

            {/* Diagnóstico del Recién Nacido */}
            <div className="text-[10.5px] pt-1 border-t border-rose-100">
              <span className="text-slate-500 font-semibold">Dx RN: </span>
              <span className="text-slate-900 font-medium">
                {patient.newborn.diagnosis || 'RNAT / AEG / Sano en alojamiento conjunto'}
              </span>
            </div>

            {/* Dieta del RN */}
            {patient.newborn.diet && (
              <div className="text-[10px] flex items-center gap-1 text-rose-950 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                <span className="font-semibold text-slate-500">Alimentación RN:</span>
                <span className="font-medium truncate">{patient.newborn.diet}</span>
              </div>
            )}

            {/* Vacunas / Notas RN if present */}
            {patient.newborn.notes && (
              <div className="text-[10px] text-slate-600 bg-white/70 px-2 py-0.5 rounded border border-rose-100">
                <span className="font-semibold text-slate-500">Tamiz / Vacunas: </span>
                <span>{patient.newborn.notes}</span>
              </div>
            )}
          </section>
        )}
      </div>

      {/* 4. Card Footer Actions - Separated Edit and Delete buttons for safety */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-1 text-slate-600">
        {/* Left cluster: Safe delete action separated from editing */}
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded px-1.5 py-0.5 animate-in fade-in duration-100">
              <span className="text-[10px] text-rose-800 font-bold">¿Borrar?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(patient.id);
                  setConfirmDelete(false);
                }}
                className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                title="Confirmar eliminación a papelera"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-slate-600 hover:bg-slate-200 px-1 py-0.5 rounded cursor-pointer transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Mover paciente a la papelera (requiere confirmación)"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

          <button
            type="button"
            onClick={handleCopy}
            title="Copiar nota al portapapeles"
            className="p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer text-slate-700"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Copiado</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px]">
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copiar</span>
              </span>
            )}
          </button>

          {onShareSingle && (
            <button
              type="button"
              onClick={() => onShareSingle(patient)}
              title="Compartir por WhatsApp, Telegram o Correo"
              className="p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer text-slate-700 flex items-center gap-1 text-[10px]"
            >
              <Share2 className="w-3 h-3 text-teal-600" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewDetail(patient)}
            title="Ver hoja clínica completa o imprimir"
            className="p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer text-slate-700 flex items-center gap-1 text-[10px]"
          >
            <Printer className="w-3 h-3" />
            <span className="hidden sm:inline">Detalle</span>
          </button>
        </div>

        {/* Right cluster: Clinical workflow and Edit (clearly separated from Delete) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDuplicate(patient)}
            title="Duplicar ficha de paciente"
            className="px-1.5 py-0.5 text-[10px] hover:bg-slate-200 rounded transition-colors cursor-pointer text-slate-600 font-medium"
          >
            Duplicar
          </button>

          <button
            type="button"
            onClick={() => onEdit(patient)}
            title="Editar nota médica"
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded transition-colors cursor-pointer shadow-2xs"
          >
            <Edit2 className="w-3 h-3 text-teal-700" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </article>
  );
};
