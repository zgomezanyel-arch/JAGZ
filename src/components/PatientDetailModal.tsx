import React, { useState } from 'react';
import { PatientNote } from '../types/patient';
import { generateClinicalTextNote, formatDateSpanish, calculateDaysOfStay } from '../utils/clinicalFormat';
import {
  X,
  Printer,
  Copy,
  Check,
  Stethoscope,
  Utensils,
  Droplet,
  FileSpreadsheet,
  Pill,
  CheckSquare,
  Square,
  AlertTriangle,
  User,
  Heart,
  Calendar,
  Activity,
  Eye,
  Share2,
  Baby,
  UserCheck,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: PatientNote | null;
  isOpen: boolean;
  onClose: () => void;
  onTogglePending: (patientId: string, pendingId: string) => void;
  onEdit: (patient: PatientNote) => void;
  onShare?: (patient: PatientNote) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onTogglePending,
  onEdit,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !patient) return null;

  const stayDays = calculateDaysOfStay(patient.admissionDate);

  const handleCopy = async () => {
    const text = generateClinicalTextNote(patient);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 text-[11px]">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (Hidden when printing via CSS @media print) */}
        <div className="no-print px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded text-[10px] border border-teal-300">
              {patient.bed || 'CAMA S/A'}
            </span>
            <span className="text-xs font-bold text-slate-800">
              Ficha Clínica Detallada
            </span>
            {patient.service && (
              <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {patient.service}
              </span>
            )}
            {patient.isPostpartum && (
              <span className="text-[10px] text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                <Baby className="w-3 h-3 text-rose-600" />
                <span>Binomio</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onShare && (
              <button
                onClick={() => onShare(patient)}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Compartir nota vía WhatsApp o portapapeles"
              >
                <Share2 className="w-3 h-3 text-teal-600" />
                <span>Compartir</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copiar Nota</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet View */}
        <div id="printable-clinical-sheet" className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3.5 text-[11px] bg-white">
          {/* Hospital Header Banner */}
          <div className="border-b-2 border-slate-900 pb-2.5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-5 h-5 rounded bg-teal-700 text-white flex items-center justify-center font-bold text-[11px]">
                  +
                </div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 uppercase">
                  Nota Médica de Hospitalización y Pase de Guardia
                </h1>
              </div>
              <p className="text-[10px] text-slate-500">
                Servicio: <strong>{patient.service || 'Hospitalización General'}</strong> · Ubicación:{' '}
                <strong>{patient.bed || 'En Piso'}</strong>
              </p>
            </div>

            <div className="text-right text-[10px] text-slate-600 font-mono">
              <div>Fecha: {formatDateSpanish(patient.updatedAt || patient.createdAt)}</div>
              <div>Estancia: Día {stayDays}</div>
            </div>
          </div>

          {/* Patient Details Grid - Well Delimited */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-300 text-[11px]">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[9px] block">Paciente</span>
              <strong className="text-slate-900 text-xs block truncate">{patient.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[9px] block">Edad</span>
              <strong className="text-slate-900 text-xs block">{patient.age} {patient.ageUnit}</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[9px] block">Médico Tratante</span>
              <strong className="text-slate-900 text-xs block truncate">{patient.attendingPhysician}</strong>
              {Boolean(patient.hasSecondDoctor || patient.coAttendingPhysician) && patient.coAttendingPhysician && (
                <span className="text-[9.5px] text-teal-800 font-semibold block truncate mt-0.5">
                  2do Dr: {patient.coAttendingPhysician}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[9px] block">Fecha de Ingreso</span>
              <strong className="text-teal-900 text-xs block font-mono">
                {patient.admissionDate || 'N/R'} (Día {stayDays})
              </strong>
            </div>
          </div>

          {/* Signos Vitales if present */}
          {patient.vitals && (
            <div className="p-2 bg-teal-50/60 rounded-lg border border-teal-200 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
              <span className="font-bold text-teal-900 uppercase text-[9px] font-sans">
                Signos Vitales:
              </span>
              <span>TA: <strong>{patient.vitals.ta || 'N/R'}</strong></span>
              <span>FC: <strong>{patient.vitals.fc ? `${patient.vitals.fc} lpm` : 'N/R'}</strong></span>
              <span>FR: <strong>{patient.vitals.fr ? `${patient.vitals.fr} rpm` : 'N/R'}</strong></span>
              <span>T°: <strong>{patient.vitals.temp ? `${patient.vitals.temp}°C` : 'N/R'}</strong></span>
              <span>SpO2: <strong>{patient.vitals.spo2 ? `${patient.vitals.spo2}%` : 'N/R'}</strong></span>
              {patient.vitals.dextro && <span>Dx: <strong>{patient.vitals.dextro} mg/dL</strong></span>}
            </div>
          )}

          {/* Diagnóstico */}
          <section className="space-y-1">
            <h3 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-3 h-3 text-teal-600" />
              Diagnóstico
            </h3>
            <div className="p-2 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800 font-medium">
              {patient.diagnosis}
            </div>
          </section>

          {/* Dieta & Soluciones Intravenosas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <section className="space-y-1">
              <h3 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3 h-3 text-amber-600" />
                Dieta
              </h3>
              <div className="p-2 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800">
                {patient.diet}
              </div>
            </section>

            <section className="space-y-1">
              <h3 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-3 h-3 text-sky-600" />
                Soluciones Intravenosas Aplicadas
              </h3>
              <div className="p-2 bg-white border border-slate-300 rounded-lg text-[10.5px] text-slate-800 font-mono">
                {patient.ivSolutions}
              </div>
            </section>
          </div>

          {/* Infusiones Continuas Especiales */}
          {patient.infusions && patient.infusions.trim() !== '' && !patient.infusions.toLowerCase().includes('sin infusiones') && (
            <section className="space-y-1">
              <h3 className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-purple-600" />
                Infusiones Continuas (Vasoactivas / Sedación / Analgesia / Titulables)
              </h3>
              <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-lg text-[10.5px] text-purple-950 font-mono whitespace-pre-line leading-relaxed">
                {patient.infusions}
              </div>
            </section>
          )}

          {/* Vigilar por (Datos de Alarma y Vigilancia de Guardia) */}
          <section className="space-y-1">
            <h3 className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-rose-600" />
              Vigilar por (Signos Vitales, Dolor, Vómitos, Datos de Alarma)
            </h3>
            <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg text-[11px] text-rose-950 font-medium leading-relaxed">
              {patient.surveillance || 'Vigilancia de signos vitales y datos de alarma habituales'}
            </div>
          </section>

          {/* Tratamiento Farmacológico */}
          <section className="space-y-1">
            <h3 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3 h-3 text-teal-600" />
              Tratamiento Farmacológico
            </h3>
            <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[10.5px] text-slate-800 font-mono whitespace-pre-line leading-relaxed">
              {patient.treatment}
            </div>
          </section>

          {/* Pendientes Clínicos */}
          <section className="space-y-1.5">
            <h3 className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3 h-3 text-teal-600" />
              Pendientes para el Siguiente Turno ({patient.pendingTasks?.length || 0})
            </h3>
            <div className="space-y-1">
              {patient.pendingTasks && patient.pendingTasks.length > 0 ? (
                patient.pendingTasks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onTogglePending(patient.id, item.id)}
                    className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[10.5px] cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <button type="button" className="text-slate-400">
                        {item.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-900 font-medium'}>
                        {item.text}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        item.priority === 'alta'
                          ? 'bg-rose-100 text-rose-700'
                          : item.priority === 'media'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic p-2 bg-slate-50 rounded-lg border border-slate-200">
                  Sin pendientes registrados para este paciente.
                </p>
              )}
            </div>
          </section>

          {/* Alergias & Observaciones */}
          <div className="border-t border-slate-200 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-600">
            <div>
              <strong>Alergias:</strong>{' '}
              <span className={patient.allergies?.toLowerCase().includes('negada') ? 'text-slate-600' : 'text-rose-600 font-bold'}>
                {patient.allergies || 'Negadas'}
              </span>
            </div>
            {patient.notes && (
              <div className="w-full text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                Observaciones: {patient.notes}
              </div>
            )}
          </div>

          {/* APARTADO DE RECIÉN NACIDO EN ALOJAMIENTO CONJUNTO (HASTA ABAJO DE LA HOJA CLÍNICA) */}
          {patient.isPostpartum && patient.newborn && (
            <section className="mt-4 pt-3 border-t-2 border-rose-300 p-3 bg-rose-50/70 rounded-xl border border-rose-300 space-y-2">
              <div className="flex items-center justify-between border-b border-rose-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-rose-600" />
                  <h3 className="text-[11px] font-bold text-rose-950 uppercase tracking-wider">
                    Recién Nacido en Alojamiento Conjunto (Misma Cama)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                  {patient.newborn.sex === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Identificación RN</span>
                  <strong className="text-slate-900 text-[11px] block">{patient.newborn.relationLabel}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Pediatra a Cargo</span>
                  <strong className="text-rose-900 text-[11px] block">{patient.newborn.attendingPediatrician}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Edad Gestacional</span>
                  <strong className="text-slate-900 text-[11px] block font-mono">
                    {patient.newborn.gestationalWeeks}{patient.newborn.gestationalDays ? `.${patient.newborn.gestationalDays}` : ''} SDG ({patient.newborn.gestationalAgeMethod})
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Peso al Nacer</span>
                  <strong className="text-slate-900 text-[11px] block font-mono">
                    {patient.newborn.weightGrams ? `${patient.newborn.weightGrams.toLocaleString()} g (${(patient.newborn.weightGrams / 1000).toFixed(2)} kg)` : 'N/R'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Diagnóstico del RN</span>
                  <p className="text-slate-900 font-medium">{patient.newborn.diagnosis || 'RNAT / AEG / Sano en alojamiento conjunto'}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-100">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Alimentación del RN</span>
                  <p className="text-slate-900 font-medium">{patient.newborn.diet || 'Seno materno exclusivo a libre demanda'}</p>
                </div>
              </div>

              {(patient.newborn.apgar || patient.newborn.silverman !== undefined || patient.newborn.notes) && (
                <div className="bg-white p-2 rounded-lg border border-rose-100 text-[10px] flex flex-wrap items-center gap-3 text-slate-700">
                  {patient.newborn.apgar && (
                    <div>
                      <span className="text-slate-500 font-semibold block text-[9px]">Apgar 1' y 5':</span>
                      <strong className="font-mono text-[10.5px]">{patient.newborn.apgar}</strong>
                    </div>
                  )}
                  {patient.newborn.silverman !== undefined && (
                    <div>
                      <span className="text-slate-500 font-semibold block text-[9px]">Silverman:</span>
                      <strong className="font-mono text-[10.5px]">{patient.newborn.silverman}</strong>
                    </div>
                  )}
                  {patient.newborn.notes && (
                    <div className="flex-1 min-w-[180px]">
                      <span className="text-slate-500 font-semibold block text-[9px]">Tamiz / Vacunas / Observaciones:</span>
                      <p className="text-slate-800 text-[10px]">{patient.newborn.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onEdit(patient)}
            className="px-3 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
          >
            Editar Esta Nota
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
