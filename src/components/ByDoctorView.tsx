import React, { useState, useMemo } from 'react';
import { PatientNote } from '../types/patient';
import { PatientCard } from './PatientCard';
import { generateClinicalTextNote, calculateDaysOfStay, compareBedNumbers } from '../utils/clinicalFormat';
import {
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Users,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ByDoctorViewProps {
  patients: PatientNote[];
  onEdit: (patient: PatientNote) => void;
  onDelete: (id: string) => void;
  onTogglePending: (patientId: string, pendingId: string) => void;
  onViewDetail: (patient: PatientNote) => void;
  onDuplicate: (patient: PatientNote) => void;
  onShareSingle?: (patient: PatientNote) => void;
}

export const ByDoctorView: React.FC<ByDoctorViewProps> = ({
  patients,
  onEdit,
  onDelete,
  onTogglePending,
  onViewDetail,
  onDuplicate,
  onShareSingle,
}) => {
  // Group patients by attending physician and sort each list by bed number
  const groupedDoctors = useMemo(() => {
    const groups: { [doctor: string]: PatientNote[] } = {};

    patients.forEach((patient) => {
      const doctor = patient.attendingPhysician.trim() || 'Médico no especificado';
      if (!groups[doctor]) {
        groups[doctor] = [];
      }
      groups[doctor].push(patient);
    });

    // Always sort beds from lowest to highest in each doctor's group
    Object.keys(groups).forEach((doc) => {
      groups[doc].sort((a, b) => compareBedNumbers(a.bed, b.bed));
    });

    return groups;
  }, [patients]);

  const [expandedDoctors, setExpandedDoctors] = useState<{ [doctor: string]: boolean }>({});
  const [copiedDoctor, setCopiedDoctor] = useState<string | null>(null);

  const toggleDoctor = (doctor: string) => {
    setExpandedDoctors((prev) => ({
      ...prev,
      [doctor]: prev[doctor] === undefined ? false : !prev[doctor],
    }));
  };

  const handleCopyDoctorRound = async (doctor: string, doctorPatients: PatientNote[]) => {
    const now = new Date().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let text = `========================================\n`;
    text += `PASE DE VISITA - ${doctor.toUpperCase()}\n`;
    text += `FECHA: ${now} | PACIENTES: ${doctorPatients.length}\n`;
    text += `========================================\n\n`;

    doctorPatients.forEach((p, idx) => {
      const stay = calculateDaysOfStay(p.admissionDate);
      text += `[${idx + 1}] CAMA: ${p.bed || 'S/C'} - ${p.fullName} (${p.age} ${p.ageUnit})\n`;
      text += `Tratante: ${p.attendingPhysician}\n`;
      if (Boolean(p.hasSecondDoctor || p.coAttendingPhysician) && p.coAttendingPhysician) {
        text += `2do Médico a Cargo: ${p.coAttendingPhysician}\n`;
      }
      text += `Fecha Ingreso: ${p.admissionDate || 'N/R'} (Día ${stay} estancia)\n`;
      text += `Diagnóstico: ${p.diagnosis}\n`;
      text += `Dieta: ${p.diet}\n`;
      text += `Soluciones IV: ${p.ivSolutions}\n`;
      if (p.infusions && !p.infusions.toLowerCase().includes('sin infusiones')) {
        text += `Infusiones: ${p.infusions}\n`;
      }
      text += `Vigilar: ${p.surveillance || 'Habitual'}\n`;
      text += `Tratamiento:\n${p.treatment}\n`;
      const pend = p.pendingTasks.filter((t) => !t.completed);
      if (pend.length > 0) {
        text += `Pendientes:\n`;
        pend.forEach((t) => {
          text += `  * [${t.priority.toUpperCase()}] ${t.text}\n`;
        });
      } else {
        text += `Pendientes: Sin pendientes activos\n`;
      }
      if (p.isPostpartum && p.newborn) {
        text += `Recién Nacido (Alojamiento Conjunto): ${p.newborn.relationLabel} (${p.newborn.sex === 'masculino' ? '♂' : '♀'}, ${p.newborn.gestationalWeeks}${p.newborn.gestationalDays ? `.${p.newborn.gestationalDays}` : ''} SDG por ${p.newborn.gestationalAgeMethod}) | Pediatra: ${p.newborn.attendingPediatrician}\n`;
        if (p.newborn.diagnosis) text += `Diagnóstico RN: ${p.newborn.diagnosis}\n`;
        if (p.newborn.diet) text += `Alimentación RN: ${p.newborn.diet}\n`;
      }
      text += `----------------------------------------\n\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedDoctor(doctor);
      setTimeout(() => setCopiedDoctor(null), 2000);
    } catch {
      // fallback
    }
  };

  const doctorList = Object.keys(groupedDoctors);

  if (doctorList.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-slate-500 text-xs">No hay pacientes registrados para agrupar por médico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Pase de Visita Agrupado por Médico Tratante</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organiza las notas por médico para presentar la ronda clínica a cada adscrito o especialista
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <strong className="text-slate-900 font-bold">{doctorList.length}</strong> médicos a cargo
        </div>
      </div>

      {doctorList.map((doctor) => {
        const doctorPatients = groupedDoctors[doctor];
        const isCollapsed = expandedDoctors[doctor] === false;
        const totalPending = doctorPatients.reduce(
          (acc, p) => acc + (p.pendingTasks?.filter((t) => !t.completed).length || 0),
          0
        );

        return (
          <div
            key={doctor}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
          >
            {/* Doctor Section Header */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div
                onClick={() => toggleDoctor(doctor)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 hover:text-teal-700 transition-colors">
                    {doctor}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>
                      <strong className="text-slate-800 font-semibold">{doctorPatients.length}</strong> pacientes
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Camas: {doctorPatients.map((p) => p.bed || 'S/A').join(', ')}
                    </span>
                    {totalPending > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-700 font-medium">
                          {totalPending} pendientes
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action: Copy round for this doctor & collapse toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyDoctorRound(doctor, doctorPatients)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Copiar solo los pacientes de este médico para el pase"
                >
                  {copiedDoctor === doctor ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">¡Pase Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Pase del Doctor</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleDoctor(doctor)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                  title={isCollapsed ? 'Desplegar pacientes' : 'Colapsar'}
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Patients Grid for this Doctor */}
            {!isCollapsed && (
              <div className="p-4 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onTogglePending={onTogglePending}
                      onViewDetail={onViewDetail}
                      onDuplicate={onDuplicate}
                      onShareSingle={onShareSingle}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
