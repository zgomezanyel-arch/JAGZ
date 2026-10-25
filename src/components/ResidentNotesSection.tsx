import React, { useState } from 'react';
import { ResidentLogNote } from '../types/patient';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  User,
  AlertTriangle,
  Clock,
  ClipboardList,
} from 'lucide-react';

interface ResidentNotesSectionProps {
  notes: ResidentLogNote[];
  onAddNote: (note: ResidentLogNote) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  titleCustom?: string;
  defaultExpanded?: boolean;
}

export const ResidentNotesSection: React.FC<ResidentNotesSectionProps> = ({
  notes,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  titleCustom = 'Bitácora del Residente y Pendientes de Guardia',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ResidentLogNote['category']>('pendiente_residente');
  const [priority, setPriority] = useState<'normal' | 'alta'>('normal');
  const [authorResident, setAuthorResident] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('Sin médico en específico (Guardia general)');
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const newNote: ResidentLogNote = {
      id: `res-note-${Date.now()}`,
      title: title.trim() || 'Pendiente de Residente',
      content: content.trim(),
      category,
      priority,
      authorResident: authorResident.trim() || 'Residente de Guardia',
      assignedDoctor: assignedDoctor.trim() || 'Sin médico en específico (Guardia general)',
      createdAt: new Date().toISOString(),
      completed: false,
    };

    onAddNote(newNote);
    setTitle('');
    setContent('');
    setAssignedDoctor('Sin médico en específico (Guardia general)');
    setPriority('normal');
    setIsAdding(false);
  };

  const handleApplyPreset = (presetTitle: string, presetContent: string, presetCategory: ResidentLogNote['category']) => {
    setTitle(presetTitle);
    setContent(presetContent);
    setCategory(presetCategory);
    setAssignedDoctor('Sin médico en específico (Guardia general)');
    setIsAdding(true);
  };

  const handleCopyNotes = async () => {
    const now = new Date().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let text = `📝 *BITÁCORA Y PENDIENTES DE RESIDENTES (GUARDIA)*\n`;
    text += `📅 Fecha/Hora: ${now}\n`;
    text += `========================================\n\n`;

    const active = notes.filter((n) => !n.completed);
    if (active.length === 0) {
      text += `Sin avisos pendientes en la bitácora de guardia.\n`;
    } else {
      active.forEach((n, idx) => {
        const urgentTag = n.priority === 'alta' ? '⚠️ URGENTE - ' : '';
        const doc = n.assignedDoctor || 'Sin médico en específico';
        text += `[${idx + 1}] ${urgentTag}${n.title.toUpperCase()} (${n.category.toUpperCase()})\n`;
        text += `De: ${n.authorResident || 'Residente'} | Destino: ${doc}\n`;
        text += `${n.content}\n`;
        text += `----------------------------------------\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const activeCount = notes.filter((n) => !n.completed).length;
  const urgentCount = notes.filter((n) => !n.completed && n.priority === 'alta').length;

  const filteredNotes = notes.filter((n) => {
    if (filterCategory === 'todos') return true;
    if (filterCategory === 'activos') return !n.completed;
    if (filterCategory === 'alta') return n.priority === 'alta' && !n.completed;
    if (filterCategory === 'sin_medico') {
      const doc = (n.assignedDoctor || '').toLowerCase();
      return doc.includes('sin médico') || doc.includes('guardia general') || !n.assignedDoctor;
    }
    return n.category === filterCategory;
  });

  return (
    <section className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs mt-6 text-[11px]">
      {/* Header Bar */}
      <div className="p-3.5 bg-gradient-to-r from-slate-50 via-teal-50/40 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-teal-800 transition-colors">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                {titleCustom}
              </h3>
              <span className="text-[10px] bg-teal-100 text-teal-900 font-bold px-1.5 py-0.2 rounded-full border border-teal-200">
                {activeCount} activo{activeCount === 1 ? '' : 's'}
              </span>
              {urgentCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full border border-rose-200 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                  {urgentCount} urgente{urgentCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Notas internas, pendientes de turno sin médico en específico, claves e insumos para el pase entre residentes
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleCopyNotes}
            title="Copiar todas las notas activas para el pase de guardia"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copiar Bitácora</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              setIsAdding(!isAdding);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>+ Agregar Pendiente de Residente</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer ml-1"
            title={isExpanded ? 'Colapsar bitácora' : 'Expandir bitácora'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-slate-50/50">
          {/* Preset fast buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-0.5 mr-1">
              <Sparkles className="w-2.5 h-2.5 text-teal-600" />
              Plantillas rápidas:
            </span>
            {[
              {
                label: '⚡ Carro Rojo & Laringoscopio',
                title: 'Revisión de Carro Rojo y Laringoscopio de Urgencias',
                content: 'Se verificó hoja curva #3, pilas nuevas y precinto de seguridad del carro rojo a las 20:00h.',
                cat: 'guardia' as const,
              },
              {
                label: '🧪 Vales de Laboratorio Mañana',
                title: 'Entrega de Vales de Laboratorio al Turno Matutino',
                content: 'Dejar órdenes impresas en ventanilla de bacteriología y química clínica antes de las 06:30 AM.',
                cat: 'pendiente_residente' as const,
              },
              {
                label: '🔑 Claves del Sistema PACS / TAC',
                title: 'Claves de Acceso a Tomografía y PACS Nocturno',
                content: 'Extensión técnica 1402. Clave de usuario de guardia para visor: MEDGUARD2025.',
                cat: 'codigo' as const,
              },
              {
                label: '📦 Stock de Catéteres e Insumos',
                title: 'Stock de Catéteres Venosos Centrales en Piso 3',
                content: 'Quedan 2 kits de CVC trilumen 7 Fr. Vale de reposición firmado con jefa de piso.',
                cat: 'insumos' as const,
              },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.title, p.content, p.cat)}
                className="px-2 py-0.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 rounded font-medium transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Add Form Drawer */}
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="bg-teal-50/60 border-2 border-teal-300 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                    Nuevo Pendiente o Nota de Residencia
                  </h4>
                  <span className="text-[10px] bg-teal-200 text-teal-900 px-1.5 py-0.2 rounded font-bold">
                    Sin paciente específico
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-[10.5px] text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    Título o Asunto del Pendiente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Revisión de insumos en farmacia / Llaves de carro rojo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                    Residente que Registra
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Dra. Méndez (R2)"
                    value={authorResident}
                    onChange={(e) => setAuthorResident(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>

              {/* Doctor Assignment - with explicit "Sin médico en específico" */}
              <div className="p-2 bg-white rounded-lg border border-teal-200 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-teal-700" />
                    Asignación / Destinatario:
                  </label>
                  <button
                    type="button"
                    onClick={() => setAssignedDoctor('Sin médico en específico (Guardia general)')}
                    className="text-[10px] px-2 py-0.5 bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold rounded cursor-pointer transition-colors"
                  >
                    ⭐ Usar "Sin médico en específico"
                  </button>
                </div>
                <input
                  type="text"
                  value={assignedDoctor}
                  onChange={(e) => setAssignedDoctor(e.target.value)}
                  placeholder="Sin médico en específico (Guardia general)"
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                  Detalle / Indicación para el Siguiente Turno *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe la tarea, número de extensión, código o recordatorio que debe realizar el médico residente de guardia..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-teal-200">
                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none"
                  >
                    <option value="pendiente_residente">📌 Pendiente de Residente</option>
                    <option value="guardia">Guardia General</option>
                    <option value="codigo">Códigos y Accesos</option>
                    <option value="insumos">Insumos y Farmacia</option>
                    <option value="administrativo">Jefatura / Administrativo</option>
                    <option value="general">Aviso General</option>
                  </select>

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none"
                  >
                    <option value="normal">Prioridad Normal</option>
                    <option value="alta">⚠️ Prioridad Alta / Urgente</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-md transition-colors cursor-pointer shadow-2xs"
                >
                  Guardar Pendiente en Bitácora
                </button>
              </div>
            </form>
          )}

          {/* Filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[10.5px] pb-0.5">
            {[
              { id: 'todos', label: 'Todas las Notas' },
              { id: 'activos', label: 'Activas' },
              { id: 'alta', label: '⚠️ Urgentes' },
              { id: 'sin_medico', label: '⭐ Sin Médico Específico' },
              { id: 'pendiente_residente', label: 'Pendientes' },
              { id: 'codigo', label: 'Códigos' },
              { id: 'insumos', label: 'Insumos' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterCategory(f.id)}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === f.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col justify-between ${
                    note.completed
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : note.priority === 'alta'
                      ? 'bg-rose-50/60 border-rose-300 shadow-2xs'
                      : 'bg-white border-slate-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleNote(note.id)}
                          className="text-slate-400 hover:text-teal-700 shrink-0 cursor-pointer"
                          title={note.completed ? 'Marcar pendiente' : 'Marcar completado'}
                        >
                          {note.completed ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <h4
                          className={`text-xs font-bold leading-snug ${
                            note.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {note.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {note.priority === 'alta' && !note.completed && (
                          <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-700 px-1 py-0.2 rounded border border-rose-200">
                            Urgente
                          </span>
                        )}
                        <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {note.category}
                        </span>
                      </div>
                    </div>

                    {/* Assigned doctor badge */}
                    <div className="mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[9.5px] bg-teal-50 text-teal-900 font-semibold px-1.5 py-0.2 rounded border border-teal-200">
                        <User className="w-2.5 h-2.5 text-teal-700" />
                        <span>{note.assignedDoctor || 'Sin médico en específico (Guardia general)'}</span>
                      </span>
                    </div>

                    <p
                      className={`text-[11px] leading-relaxed whitespace-pre-line ${
                        note.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200 text-[9.5px] text-slate-400">
                    <span>
                      Por: <strong className="text-slate-700 font-medium">{note.authorResident || 'Residente'}</strong> ·{' '}
                      {new Date(note.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {confirmDeleteId === note.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded px-1 py-0.2">
                        <span className="text-[9px] text-rose-800 font-bold">¿Borrar?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteNote(note.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-[9px] bg-rose-600 text-white font-bold px-1 rounded hover:bg-rose-700 cursor-pointer"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[9px] text-slate-600 hover:bg-slate-200 px-1 rounded cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(note.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                        title="Eliminar aviso de bitácora"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 text-center text-slate-500">
              <BookOpen className="w-6 h-6 text-teal-600 mx-auto mb-1.5 opacity-80" />
              <p className="text-xs font-bold text-slate-800">No hay notas en este filtro de bitácora</p>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Usa el botón superior para agregar un pendiente de turno sin médico asignado.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
