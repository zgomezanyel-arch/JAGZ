import React from 'react';
import { PatientNote } from '../types/patient';
import { formatDateSpanish, calculateDaysOfStay } from '../utils/clinicalFormat';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Stethoscope,
  Calendar,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface TrashBinViewProps {
  deletedPatients: PatientNote[];
  onRestorePatient: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashBinView: React.FC<TrashBinViewProps> = ({
  deletedPatients,
  onRestorePatient,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-600" />
            <span>Papelera de Reciclaje de Pacientes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Recupera notas de pacientes dados de alta o eliminados por accidente
          </p>
        </div>

        {deletedPatients.length > 0 && (
          <button
            onClick={() => {
              if (confirm('¿Vaciar toda la papelera permanentemente? Esta acción no se puede deshacer.')) {
                onEmptyTrash();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar Papelera</span>
          </button>
        )}
      </div>

      {deletedPatients.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {deletedPatients.map((patient) => {
            const stay = calculateDaysOfStay(patient.admissionDate);
            return (
              <div
                key={patient.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                {/* Patient Summary */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {patient.bed && (
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                        {patient.bed}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900">
                      {patient.fullName}
                    </h3>
                    <span className="text-xs text-slate-500">
                      ({patient.age} {patient.ageUnit})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-teal-600" />
                      <span>{patient.attendingPhysician}</span>
                    </span>
                    <span>·</span>
                    <span>Diagnóstico: <strong className="text-slate-700">{patient.diagnosis}</strong></span>
                    {patient.admissionDate && (
                      <>
                        <span>·</span>
                        <span>Ingreso: {patient.admissionDate} ({stay} días estancia)</span>
                      </>
                    )}
                  </div>

                  <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Enviado a papelera:{' '}
                      {patient.deletedAt ? formatDateSpanish(patient.deletedAt) : 'Recientemente'}
                    </span>
                  </div>
                </div>

                {/* Actions: Restore or Permanent Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onRestorePatient(patient.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Restaurar paciente al censo activo"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restaurar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar definitivamente al paciente "${patient.fullName}"?`)) {
                        onPermanentDelete(patient.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">La papelera está vacía</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando elimines un paciente que ya se va o egresó, se guardará aquí temporalmente por si necesitas recuperarlo en cualquier momento.
          </p>
        </div>
      )}
    </div>
  );
};
