import React, { useState } from 'react';
import { PatientNote } from '../types/patient';
import { generateClinicalTextNote, calculateDaysOfStay } from '../utils/clinicalFormat';
import {
  Copy,
  Check,
  Edit2,
  Trash2,
  Printer,
  CheckSquare,
  Square,
  AlertTriangle,
  Eye,
  Calendar,
  Share2,
  Baby,
  UserCheck,
} from 'lucide-react';

interface TableViewProps {
  patients: PatientNote[];
  onEdit: (patient: PatientNote) => void;
  onDelete: (id: string) => void;
  onTogglePending: (patientId: string, pendingId: string) => void;
  onViewDetail: (patient: PatientNote) => void;
  onShareSingle?: (patient: PatientNote) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  patients,
  onEdit,
  onDelete,
  onTogglePending,
  onViewDetail,
  onShareSingle,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCopy = async (patient: PatientNote) => {
    const text = generateClinicalTextNote(patient);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(patient.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  if (patients.length === 0) {
    return (
      <div className="bg-white border-2 border-slate-300 rounded-xl p-8 text-center text-slate-500 text-[11px]">
        No hay pacientes registrados en este filtro.
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs text-[11px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-slate-700 uppercase font-bold tracking-wider text-[10px]">
              <th className="py-2 px-2.5">Cama / Paciente</th>
              <th className="py-2 px-2.5">Ingreso</th>
              <th className="py-2 px-2.5">Médico(s) Tratante(s)</th>
              <th className="py-2 px-2.5">Diagnóstico</th>
              <th className="py-2 px-2.5">Dieta</th>
              <th className="py-2 px-2.5">Soluciones & Infusiones</th>
              <th className="py-2 px-2.5">Vigilar por</th>
              <th className="py-2 px-2.5">Pendientes</th>
              <th className="py-2 px-2.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {patients.map((patient) => {
              const stayDays = calculateDaysOfStay(patient.admissionDate);

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50/80 transition-colors group align-top text-[10.5px]"
                >
                  {/* Cama & Paciente */}
                  <td className="py-2 px-2.5 font-medium min-w-[160px]">
                    <div className="flex items-center gap-1 mb-0.5">
                      {patient.bed && (
                        <span className="font-bold text-teal-900 bg-teal-100 px-1.5 py-0.2 rounded text-[9.5px] border border-teal-300">
                          {patient.bed}
                        </span>
                      )}
                      <span className="text-slate-500 font-mono text-[10px]">
                        {patient.age} {patient.ageUnit}
                      </span>
                    </div>
                    <div className="text-slate-900 font-bold text-[11px]">
                      {patient.fullName}
                    </div>

                    {/* Binomio Madre-Hijo (Alojamiento Conjunto) al fondo de la celda de paciente */}
                    {patient.isPostpartum && patient.newborn && (
                      <div className="mt-1 bg-rose-50 border border-rose-300 rounded p-1 text-[9.5px] text-rose-950 leading-tight">
                        <div className="flex items-center gap-1 font-bold">
                          <Baby className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>
                            RN {patient.newborn.sex === 'masculino' ? '♂' : '♀'} · {patient.newborn.gestationalWeeks}{patient.newborn.gestationalDays ? `.${patient.newborn.gestationalDays}` : ''} SDG ({patient.newborn.gestationalAgeMethod})
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-600 truncate mt-0.5">
                          Ped: <strong className="text-rose-950">{patient.newborn.attendingPediatrician}</strong> {patient.newborn.weightGrams ? `· ${patient.newborn.weightGrams}g` : ''}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Fecha de Ingreso & Días de estancia */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="text-slate-700 font-mono text-[10.5px] block">
                      {patient.admissionDate || 'N/R'}
                    </span>
                    <span className="text-[9px] text-teal-800 font-bold bg-teal-50 px-1 py-0.2 rounded border border-teal-200 inline-block mt-0.5">
                      Día {stayDays} estancia
                    </span>
                  </td>

                  {/* Médico Tratante + 2do Médico + Servicio */}
                  <td className="py-2 px-2.5 text-slate-700 min-w-[140px]">
                    <div className="font-bold text-slate-900 text-[11px]">{patient.attendingPhysician}</div>
                    {Boolean(patient.hasSecondDoctor || patient.coAttendingPhysician) && patient.coAttendingPhysician && (
                      <div className="flex items-center gap-0.5 text-[9.5px] text-teal-900 bg-teal-50 px-1 rounded border border-teal-200 mt-0.5">
                        <UserCheck className="w-2.5 h-2.5 text-teal-700 shrink-0" />
                        <span className="truncate">2do: {patient.coAttendingPhysician}</span>
                      </div>
                    )}
                    <span className="text-[9.5px] text-slate-500 block mt-0.5 font-medium">{patient.service || 'General'}</span>
                  </td>

                  {/* Diagnóstico */}
                  <td className="py-2 px-2.5 max-w-xs text-slate-800 font-medium text-[10.5px]">
                    <p className="line-clamp-2 leading-snug">{patient.diagnosis}</p>
                    {patient.isPostpartum && patient.newborn?.diagnosis && (
                      <p className="line-clamp-1 text-[9.5px] text-rose-800 mt-0.5">
                        <strong className="text-rose-950">Dx RN:</strong> {patient.newborn.diagnosis}
                      </p>
                    )}
                  </td>

                  {/* Dieta */}
                  <td className="py-2 px-2.5 max-w-[130px]">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium leading-snug ${
                        (patient.diet || '').toLowerCase().includes('ayuno')
                          ? 'bg-amber-100 text-amber-900 font-bold'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {patient.diet}
                    </span>
                    {patient.isPostpartum && patient.newborn?.diet && (
                      <span className="block text-[9px] text-rose-700 mt-0.5 truncate">
                        🍼 {patient.newborn.diet}
                      </span>
                    )}
                  </td>

                  {/* Soluciones IV & Infusiones */}
                  <td className="py-2 px-2.5 max-w-[180px] text-slate-700 font-mono text-[10px] space-y-0.5">
                    <p className="line-clamp-2 text-slate-700">{patient.ivSolutions}</p>
                    {patient.infusions && !patient.infusions.toLowerCase().includes('sin infusiones') && (
                      <div className="bg-purple-50 text-purple-950 p-1 rounded border border-purple-200 text-[9px] leading-tight font-mono">
                        <strong className="text-purple-800 block uppercase">Infusión:</strong>
                        <span className="line-clamp-2">{patient.infusions}</span>
                      </div>
                    )}
                  </td>

                  {/* Vigilar por */}
                  <td className="py-2 px-2.5 max-w-[170px]">
                    {patient.surveillance ? (
                      <div className="bg-rose-50 text-rose-950 p-1.5 rounded border border-rose-200 text-[10px] leading-tight flex items-start gap-1">
                        <Eye className="w-2.5 h-2.5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-3">{patient.surveillance}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Habitual</span>
                    )}
                  </td>

                  {/* Pendientes */}
                  <td className="py-2 px-2.5 min-w-[170px]">
                    {patient.pendingTasks && patient.pendingTasks.length > 0 ? (
                      <div className="space-y-0.5">
                        {patient.pendingTasks.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onTogglePending(patient.id, item.id)}
                            className={`flex items-center gap-1 text-[10px] cursor-pointer hover:text-slate-900 ${
                              item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            <button
                              type="button"
                              className="text-slate-400 hover:text-teal-600 shrink-0 cursor-pointer"
                            >
                              {item.completed ? (
                                <CheckSquare className="w-3 h-3 text-teal-600" />
                              ) : (
                                <Square className="w-3 h-3" />
                              )}
                            </button>
                            <span className="truncate">{item.text}</span>
                            {item.priority === 'alta' && !item.completed && (
                              <span className="text-[8px] px-1 bg-rose-100 text-rose-800 rounded font-bold uppercase shrink-0">
                                Alta
                              </span>
                            )}
                          </div>
                        ))}
                        {patient.pendingTasks.length > 3 && (
                          <span className="text-[9px] text-slate-400 block">
                            +{patient.pendingTasks.length - 3} más...
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Sin pendientes</span>
                    )}
                  </td>

                  {/* Acciones - Separated Edit and Delete with guard */}
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(patient)}
                        title="Copiar nota clínica"
                        className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        {copiedId === patient.id ? (
                          <Check className="w-3 h-3 text-teal-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {onShareSingle && (
                        <button
                          type="button"
                          onClick={() => onShareSingle(patient)}
                          title="Compartir"
                          className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3 h-3 text-teal-600" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewDetail(patient)}
                        title="Ver detalle completo"
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(patient)}
                        title="Editar paciente"
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded transition-colors cursor-pointer ml-0.5"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-teal-700" />
                        <span>Editar</span>
                      </button>

                      {/* Protective separator */}
                      <div className="h-3.5 w-px bg-slate-300 mx-0.5" />

                      {confirmDeleteId === patient.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded px-1.5 py-0.5">
                          <span className="text-[9.5px] text-rose-800 font-bold">¿Borrar?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(patient.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[9.5px] bg-rose-600 text-white font-bold px-1 rounded hover:bg-rose-700 cursor-pointer"
                            title="Confirmar eliminación a papelera"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[9.5px] text-slate-600 hover:bg-slate-200 px-1 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(patient.id)}
                          title="Mover a papelera (requiere confirmación)"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
