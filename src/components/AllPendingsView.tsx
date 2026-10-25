import React, { useState, useMemo } from 'react';
import { PatientNote, PendingItem } from '../types/patient';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  Search,
  Filter,
  Copy,
  Check,
  Clock,
  ListTodo,
  ExternalLink,
} from 'lucide-react';

interface AllPendingsViewProps {
  patients: PatientNote[];
  onTogglePending: (patientId: string, pendingId: string) => void;
  onSelectPatient: (patient: PatientNote) => void;
}

export const AllPendingsView: React.FC<AllPendingsViewProps> = ({
  patients,
  onTogglePending,
  onSelectPatient,
}) => {
  const [filterMode, setFilterMode] = useState<'active' | 'all' | 'urgent' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Flatten all pendings with patient context
  const flattenedPendings = useMemo(() => {
    const list: Array<{
      patient: PatientNote;
      task: PendingItem;
    }> = [];

    patients.forEach((patient) => {
      if (patient.pendingTasks) {
        patient.pendingTasks.forEach((task) => {
          list.push({ patient, task });
        });
      }
    });

    return list;
  }, [patients]);

  // Filter items
  const filtered = useMemo(() => {
    return flattenedPendings.filter(({ patient, task }) => {
      // Status filter
      if (filterMode === 'active' && task.completed) return false;
      if (filterMode === 'completed' && !task.completed) return false;
      if (filterMode === 'urgent' && (task.completed || task.priority !== 'alta')) return false;

      // Query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        task.text.toLowerCase().includes(q) ||
        patient.fullName.toLowerCase().includes(q) ||
        (patient.bed && patient.bed.toLowerCase().includes(q)) ||
        task.category.toLowerCase().includes(q) ||
        task.priority.toLowerCase().includes(q)
      );
    });
  }, [flattenedPendings, filterMode, searchQuery]);

  const totalCount = flattenedPendings.length;
  const activeCount = flattenedPendings.filter((i) => !i.task.completed).length;
  const urgentCount = flattenedPendings.filter((i) => !i.task.completed && i.task.priority === 'alta').length;
  const completedCount = flattenedPendings.filter((i) => i.task.completed).length;

  const handleCopyPendings = async () => {
    let text = `📋 LISTA RÁPIDA DE PENDIENTES DE GUARDIA (${new Date().toLocaleDateString('es-MX')})\n`;
    text += `========================================\n\n`;

    filtered.forEach(({ patient, task }, idx) => {
      text += `${task.completed ? '[X]' : '[ ]'} ${task.priority === 'alta' ? '⚠️ URGENTE ' : ''}[${patient.bed || 'S/C'}] ${patient.fullName}: ${task.text} (${task.category.toUpperCase()})\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-teal-600" />
              <span>Resumen Global de Pendientes de Guardia</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lista consolidada de laboratorios, estudios, interconsultas y cuidados de todos los pacientes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPendings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-700" />
                  <span>¡Pendientes Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-teal-700" />
                  <span>Copiar Lista Rápida</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Counters & Filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'active'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Por Resolver ({activeCount})
            </button>
            <button
              onClick={() => setFilterMode('urgent')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'urgent'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Urgentes ({urgentCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'completed'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Completados ({completedCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar pendiente, paciente o cama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Pendings List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map(({ patient, task }) => (
              <div
                key={task.id}
                className={`p-3 sm:px-4 sm:py-3 flex items-start gap-3 transition-colors ${
                  task.completed
                    ? 'bg-slate-50/60 opacity-60'
                    : task.priority === 'alta'
                    ? 'bg-rose-50/40 hover:bg-rose-50/70'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Checkbox button */}
                <button
                  type="button"
                  onClick={() => onTogglePending(patient.id, task.id)}
                  className="mt-0.5 text-slate-400 hover:text-teal-700 transition-colors shrink-0 cursor-pointer"
                  title={task.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {/* Patient and Bed tag */}
                    <button
                      type="button"
                      onClick={() => onSelectPatient(patient)}
                      className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-teal-700 text-xs transition-colors cursor-pointer"
                    >
                      {patient.bed && (
                        <span className="bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                          {patient.bed}
                        </span>
                      )}
                      <span>{patient.fullName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <span className="text-slate-300">·</span>

                    {/* Attending physician */}
                    <span className="text-[11px] text-slate-500 truncate max-w-xs">
                      {patient.attendingPhysician}
                    </span>

                    {/* Priority badge */}
                    {task.priority === 'alta' && !task.completed && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Urgente
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs leading-relaxed font-medium ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.text}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span className="uppercase font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {task.category}
                    </span>
                    <span>Diagnóstico: {patient.diagnosis}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-700">
              No hay pendientes que coincidan con el filtro actual
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ¡Excelente trabajo en la guardia o ajusta los criterios de búsqueda!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
