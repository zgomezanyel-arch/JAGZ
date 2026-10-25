import React, { useState, useEffect, useMemo } from 'react';
import { PatientNote, PatientFilter, ActiveAppView, ResidentLogNote } from './types/patient';
import { INITIAL_PATIENTS } from './data/initialPatients';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { PatientCard } from './components/PatientCard';
import { TableView } from './components/TableView';
import { ByDoctorView } from './components/ByDoctorView';
import { AllPendingsView } from './components/AllPendingsView';
import { ResidentNotesView } from './components/ResidentNotesView';
import { TrashBinView } from './components/TrashBinView';
import { PatientModal } from './components/PatientModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { IVCalculatorModal } from './components/IVCalculatorModal';
import { ShareNoteModal } from './components/ShareNoteModal';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Copy,
  Check,
  Stethoscope,
  Share2,
  FileText,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY = 'cliniquick_patient_notes_v1';
const RESIDENT_NOTES_STORAGE_KEY = 'cliniquick_resident_notes_v1';

const INITIAL_RESIDENT_LOGS: ResidentLogNote[] = [
  {
    id: 'res-note-1',
    title: 'Llaves de Carro Rojo y Farmacia de Terapia',
    content: 'Las llaves del carro de paro del 2do piso quedan resguardadas en la gaveta del residente de guardia (código 4521). El candado se revisó a las 20:00h.',
    priority: 'alta',
    category: 'guardia',
    createdAt: new Date().toISOString(),
    authorResident: 'Dra. Méndez (R2 Medicina Interna)',
    completed: false,
  },
  {
    id: 'res-note-2',
    title: 'Claves del Sistema PACS y Tomografía Nocturna',
    content: 'Para solicitar TAC contrastada urgente después de las 22:00h marcar directo a la extensión 1402 con el técnico Martínez. Clave del visor: MEDGUARD2025.',
    priority: 'normal',
    category: 'codigo',
    createdAt: new Date().toISOString(),
    authorResident: 'Dr. Valenzuela (R3 Cirugía)',
    completed: false,
  },
  {
    id: 'res-note-3',
    title: 'Insumos de Catéteres Venosos Centrales 7 Fr',
    content: 'Quedan solo 2 kits de CVC trilumen en el almacén de piso 3. Se dejó vale especial firmado a la jefa de enfermería del turno nocturno para reabastecimiento en la mañana.',
    priority: 'alta',
    category: 'insumos',
    createdAt: new Date().toISOString(),
    authorResident: 'Dra. Méndez (R2 Medicina Interna)',
    completed: false,
  },
  {
    id: 'res-note-4',
    title: 'Interconsulta pendiente con Cardiología de Guardia',
    content: 'El cardiólogo de guardia (Dr. Fonseca) vendrá a valorar al paciente de Cama 308 post-trombolisis a las 23:30h después de su procedimiento en hemodinamia.',
    priority: 'normal',
    category: 'administrativo',
    createdAt: new Date().toISOString(),
    authorResident: 'Dr. Herrera (R1 Medicina Interna)',
    completed: false,
  },
];

export default function App() {
  // Master patients array (includes active and soft-deleted)
  const [patients, setPatients] = useState<PatientNote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PATIENTS;
  });

  // Resident log notes (independent of patients)
  const [residentNotes, setResidentNotes] = useState<ResidentLogNote[]>(() => {
    try {
      const stored = localStorage.getItem(RESIDENT_NOTES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_LOGS_OR_EMPTY();
  });

  function INITIAL_LOGS_OR_EMPTY(): ResidentLogNote[] {
    return INITIAL_RESIDENT_LOGS;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PatientFilter>('todos');
  const [activeTab, setActiveTab] = useState<ActiveAppView>('cards');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientNote | null>(null);
  const [selectedDetailPatient, setSelectedDetailPatient] = useState<PatientNote | null>(null);
  const [isIVCalcOpen, setIsIVCalcOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharePatient, setSharePatient] = useState<PatientNote | null>(null);
  const [shareMode, setShareMode] = useState<'single' | 'all'>('all');
  const [copiedHandoff, setCopiedHandoff] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Auto-hide toast notification
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Persist patients to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch {
      // storage error
    }
  }, [patients]);

  // Persist resident log notes to local storage
  useEffect(() => {
    try {
      localStorage.setItem(RESIDENT_NOTES_STORAGE_KEY, JSON.stringify(residentNotes));
    } catch {
      // storage error
    }
  }, [residentNotes]);

  // Separate active vs soft-deleted patients
  const activePatients = useMemo(() => {
    return patients.filter((p) => !p.deletedAt);
  }, [patients]);

  const deletedPatients = useMemo(() => {
    return patients.filter((p) => Boolean(p.deletedAt));
  }, [patients]);

  // Filtered active patients
  const filteredPatients = useMemo(() => {
    return activePatients.filter((patient) => {
      // Query search
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        patient.fullName.toLowerCase().includes(q) ||
        (patient.bed && patient.bed.toLowerCase().includes(q)) ||
        patient.attendingPhysician.toLowerCase().includes(q) ||
        (patient.coAttendingPhysician && patient.coAttendingPhysician.toLowerCase().includes(q)) ||
        (patient.service && patient.service.toLowerCase().includes(q)) ||
        patient.diagnosis.toLowerCase().includes(q) ||
        patient.diet.toLowerCase().includes(q) ||
        patient.ivSolutions.toLowerCase().includes(q) ||
        (patient.infusions && patient.infusions.toLowerCase().includes(q)) ||
        patient.treatment.toLowerCase().includes(q) ||
        (patient.surveillance && patient.surveillance.toLowerCase().includes(q)) ||
        (patient.newborn && (
          patient.newborn.relationLabel.toLowerCase().includes(q) ||
          patient.newborn.attendingPediatrician.toLowerCase().includes(q) ||
          (patient.newborn.diagnosis && patient.newborn.diagnosis.toLowerCase().includes(q))
        )) ||
        patient.pendingTasks.some((p) => p.text.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      // Status Filter
      if (filter === 'todos') return true;
      if (filter === 'hospitalizado') return patient.status === 'hospitalizado';
      if (filter === 'observacion') return patient.status === 'observacion';
      if (filter === 'quirurgico') return patient.status === 'quirurgico';
      if (filter === 'alta') return patient.status === 'alta';
      if (filter === 'posparto') return Boolean(patient.isPostpartum);
      if (filter === 'con_infusiones') {
        return Boolean(
          patient.infusions &&
            patient.infusions.trim() !== '' &&
            !patient.infusions.toLowerCase().includes('sin infusiones')
        );
      }
      if (filter === 'con_pendientes') {
        return patient.pendingTasks?.some((t) => !t.completed && t.priority === 'alta');
      }

      return true;
    });
  }, [activePatients, searchQuery, filter]);

  // Patient Handlers
  const handleSavePatient = (savedPatient: PatientNote) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === savedPatient.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPatient.id ? savedPatient : p));
      }
      return [savedPatient, ...prev];
    });
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  // Soft delete (moves patient to trash)
  const handleDeletePatient = (id: string) => {
    const toDelete = patients.find((p) => p.id === id);
    if (!toDelete) return;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, deletedAt: new Date().toISOString() }
          : p
      )
    );

    if (selectedDetailPatient?.id === id) {
      setSelectedDetailPatient(null);
    }

    setToastNotification(`El paciente "${toDelete.fullName}" fue movido a la Papelera.`);
  };

  // Restore patient from trash
  const handleRestorePatient = (id: string) => {
    const toRestore = patients.find((p) => p.id === id);
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, deletedAt: null } : p))
    );
    if (toRestore) {
      setToastNotification(`Paciente "${toRestore.fullName}" recuperado exitosamente.`);
    }
  };

  // Permanent delete of single patient
  const handlePermanentDelete = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setToastNotification('Paciente eliminado definitivamente del sistema.');
  };

  // Empty all trash
  const handleEmptyTrash = () => {
    setPatients((prev) => prev.filter((p) => !p.deletedAt));
    setToastNotification('La papelera ha sido vaciada.');
  };

  const handleDuplicatePatient = (patient: PatientNote) => {
    const duplicated: PatientNote = {
      ...patient,
      id: `pat-${Date.now()}`,
      fullName: `${patient.fullName} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      pendingTasks: patient.pendingTasks.map((t, idx) => ({
        ...t,
        id: `pend-dup-${Date.now()}-${idx}`,
        completed: false,
      })),
    };
    setPatients((prev) => [duplicated, ...prev]);
  };

  const handleTogglePending = (patientId: string, pendingId: string) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;
        return {
          ...patient,
          pendingTasks: patient.pendingTasks.map((t) =>
            t.id === pendingId ? { ...t, completed: !t.completed } : t
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Keep detail view in sync if open
    if (selectedDetailPatient && selectedDetailPatient.id === patientId) {
      setSelectedDetailPatient((prev) =>
        prev
          ? {
              ...prev,
              pendingTasks: prev.pendingTasks.map((t) =>
                t.id === pendingId ? { ...t, completed: !t.completed } : t
              ),
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  // Sharing Handlers
  const handleOpenShareSingle = (patient: PatientNote) => {
    setSharePatient(patient);
    setShareMode('single');
    setIsShareOpen(true);
  };

  const handleOpenShareAll = () => {
    setSharePatient(null);
    setShareMode('all');
    setIsShareOpen(true);
  };

  const handleCopyMasterHandoff = async () => {
    const dateStr = new Date().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let fullText = `========================================================\n`;
    fullText += `RESUMEN DE PASE DE GUARDIA / CENSO HOSPITALARIO\n`;
    fullText += `FECHA Y HORA: ${dateStr}\n`;
    fullText += `TOTAL DE PACIENTES ACTIVOS: ${activePatients.length}\n`;
    fullText += `========================================================\n\n`;

    activePatients.forEach((p, idx) => {
      const secondDoc = Boolean(p.hasSecondDoctor || p.coAttendingPhysician) && p.coAttendingPhysician
        ? ` | 2do Dr: ${p.coAttendingPhysician}`
        : '';
      fullText += `[${idx + 1}] ${p.bed || 'CAMA S/A'} - ${p.fullName} (${p.age} ${p.ageUnit})\n`;
      fullText += `Médico Tratante: ${p.attendingPhysician}${secondDoc} | Servicio: ${p.service || 'General'}\n`;
      fullText += `Fecha Ingreso: ${p.admissionDate || 'N/A'}\n`;
      fullText += `Diagnóstico: ${p.diagnosis}\n`;
      fullText += `Dieta: ${p.diet}\n`;
      fullText += `Soluciones IV: ${p.ivSolutions}\n`;
      if (p.infusions && !p.infusions.toLowerCase().includes('sin infusiones')) {
        fullText += `Infusiones Continuas: ${p.infusions}\n`;
      }
      if (p.surveillance) {
        fullText += `Vigilar Por: ${p.surveillance}\n`;
      }
      fullText += `Tratamiento:\n${p.treatment}\n`;
      const uncompletedPending = p.pendingTasks.filter((t) => !t.completed);
      if (uncompletedPending.length > 0) {
        fullText += `Pendientes Activos:\n`;
        uncompletedPending.forEach((t) => {
          fullText += `  * [${t.priority.toUpperCase()}] ${t.text}\n`;
        });
      } else {
        fullText += `Pendientes: Sin pendientes activos\n`;
      }
      if (p.isPostpartum && p.newborn) {
        fullText += `Recién Nacido (Alojamiento Conjunto): ${p.newborn.relationLabel} (${p.newborn.sex === 'masculino' ? 'Masculino' : 'Femenino'}) - ${p.newborn.gestationalWeeks}${p.newborn.gestationalDays ? `.${p.newborn.gestationalDays}` : ''} SDG por ${p.newborn.gestationalAgeMethod} | Peso: ${p.newborn.weightGrams ? `${p.newborn.weightGrams}g` : 'N/R'}\n`;
        fullText += `Pediatra a Cargo del RN: ${p.newborn.attendingPediatrician}\n`;
        if (p.newborn.diagnosis) fullText += `Diagnóstico RN: ${p.newborn.diagnosis}\n`;
        if (p.newborn.diet) fullText += `Alimentación RN: ${p.newborn.diet}\n`;
      }
      fullText += `--------------------------------------------------------\n\n`;
    });

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedHandoff(true);
      setTimeout(() => setCopiedHandoff(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            patients,
            residentNotes,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `cliniquick_respaldo_guardia_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          if (
            confirm(
              `Se encontraron ${imported.length} notas en el archivo. ¿Deseas importarlas a CliniQuick?`
            )
          ) {
            setPatients(imported);
          }
        } else if (imported && Array.isArray(imported.patients)) {
          if (
            confirm(
              `Se encontraron ${imported.patients.length} pacientes y ${
                imported.residentNotes ? imported.residentNotes.length : 0
              } notas de residente. ¿Deseas restaurar este respaldo?`
            )
          ) {
            setPatients(imported.patients);
            if (imported.residentNotes) {
              setResidentNotes(imported.residentNotes);
            }
          }
        } else {
          alert('El archivo no contiene un formato compatible de CliniQuick.');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreDemoData = () => {
    if (
      confirm(
        '¿Restablecer los pacientes de demostración iniciales? Se reiniciarán las notas demo.'
      )
    ) {
      setPatients(INITIAL_PATIENTS);
      setResidentNotes(INITIAL_RESIDENT_LOGS);
    }
  };

  // Resident Note Handlers
  const handleAddResidentNote = (note: ResidentLogNote) => {
    setResidentNotes((prev) => [note, ...prev]);
  };

  const handleToggleResidentNote = (id: string) => {
    setResidentNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const handleDeleteResidentNote = (id: string) => {
    setResidentNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed top-3 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in border border-slate-700">
          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        onNewNote={() => {
          setEditingPatient(null);
          setIsModalOpen(true);
        }}
        onOpenIVCalc={() => setIsIVCalcOpen(true)}
        onOpenShare={handleOpenShareAll}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPrintAll={() => window.print()}
        trashCount={deletedPatients.length}
        residentNotesCount={residentNotes.filter((n) => !n.completed).length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Medical Stats Summary Strip - only active non-deleted patients */}
        <StatsBar patients={activePatients} />

        {/* Filter, Search & Quick Actions Bar (Shown for cards and table views) */}
        {(activeTab === 'cards' || activeTab === 'table') && (
          <div className="no-print bg-white border border-slate-200 rounded-xl p-3 mb-5 shadow-xs space-y-2.5">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por paciente, cama, médico tratante, diagnóstico, pendientes o alarma a vigilar..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Quick Actions (Copy master handover, backup export/import) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyMasterHandoff}
                  title="Copiar resumen estructurado de todos los pacientes para el pase de guardia"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedHandoff ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-700" />
                      <span>¡Pase Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-teal-700" />
                      <span>Copiar Pase General</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenShareAll}
                  title="Compartir pase por WhatsApp o Telegram"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleExportJSON}
                  title="Exportar respaldo de notas médicas (JSON)"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <label
                  title="Importar archivo JSON de respaldo"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleRestoreDemoData}
                  title="Restablecer casos de demostración iniciales"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Segmented Filter Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1 text-[11px]">
                <Filter className="w-3 h-3" />
                Filtrar:
              </span>

              {[
                { id: 'todos', label: 'Todos los Pacientes' },
                { id: 'hospitalizado', label: 'En Piso' },
                { id: 'observacion', label: 'Observación Urgencias' },
                { id: 'quirurgico', label: 'Postquirúrgicos' },
                { id: 'posparto', label: 'Posparto / Binomios (RN)' },
                { id: 'con_infusiones', label: 'Con Infusiones (Vasoactivos/Sedación)' },
                { id: 'con_pendientes', label: 'Pendientes Urgentes' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as PatientFilter)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    filter === tab.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <div className="ml-auto text-[11px] text-slate-500 font-mono pl-2 shrink-0">
                Mostrando <strong className="text-slate-800">{filteredPatients.length}</strong> de{' '}
                {activePatients.length}
              </div>
            </div>
          </div>
        )}

        {/* View Switcher: Router depending on activeTab */}
        {activeTab === 'cards' && (
          filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onEdit={(p) => {
                    setEditingPatient(p);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeletePatient}
                  onTogglePending={handleTogglePending}
                  onViewDetail={(p) => setSelectedDetailPatient(p)}
                  onDuplicate={handleDuplicatePatient}
                  onShareSingle={handleOpenShareSingle}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                No se encontraron notas
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                No hay pacientes que coincidan con la búsqueda o el filtro actual.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('todos');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer mr-2"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={() => {
                  setEditingPatient(null);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
              >
                + Crear Paciente
              </button>
            </div>
          )
        )}

        {activeTab === 'table' && (
          <TableView
            patients={filteredPatients}
            onEdit={(p) => {
              setEditingPatient(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDeletePatient}
            onTogglePending={handleTogglePending}
            onViewDetail={(p) => setSelectedDetailPatient(p)}
            onShareSingle={handleOpenShareSingle}
          />
        )}

        {activeTab === 'by_doctor' && (
          <ByDoctorView
            patients={activePatients}
            onEdit={(p) => {
              setEditingPatient(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDeletePatient}
            onTogglePending={handleTogglePending}
            onViewDetail={(p) => setSelectedDetailPatient(p)}
            onDuplicate={handleDuplicatePatient}
            onShareSingle={handleOpenShareSingle}
          />
        )}

        {activeTab === 'all_pendings' && (
          <AllPendingsView
            patients={activePatients}
            onTogglePending={handleTogglePending}
            onSelectPatient={(p) => setSelectedDetailPatient(p)}
          />
        )}

        {activeTab === 'resident_notes' && (
          <ResidentNotesView
            notes={residentNotes}
            onAddNote={handleAddResidentNote}
            onToggleNote={handleToggleResidentNote}
            onDeleteNote={handleDeleteResidentNote}
          />
        )}

        {activeTab === 'trash' && (
          <TrashBinView
            deletedPatients={deletedPatients}
            onRestorePatient={handleRestorePatient}
            onPermanentDelete={handlePermanentDelete}
            onEmptyTrash={handleEmptyTrash}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-10 border-t border-slate-200 bg-white py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs">CliniQuick · Notas Médicas Rápidas</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Registro clínico de hospitalización y pase de visita. Diseñado para médicos y residentes de guardia.
          </p>
        </div>
      </footer>

      {/* MODAL 1: Create / Edit Patient Note */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        initialData={editingPatient}
      />

      {/* MODAL 2: Detail Clinical Sheet / Print */}
      <PatientDetailModal
        patient={selectedDetailPatient}
        isOpen={Boolean(selectedDetailPatient)}
        onClose={() => setSelectedDetailPatient(null)}
        onTogglePending={handleTogglePending}
        onEdit={(p) => {
          setSelectedDetailPatient(null);
          setEditingPatient(p);
          setIsModalOpen(true);
        }}
        onShare={handleOpenShareSingle}
      />

      {/* MODAL 3: IV Rate Calculator */}
      <IVCalculatorModal
        isOpen={isIVCalcOpen}
        onClose={() => setIsIVCalcOpen(false)}
      />

      {/* MODAL 4: Share Note / Shift Handoff */}
      <ShareNoteModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setSharePatient(null);
        }}
        patient={sharePatient}
        allPatients={activePatients}
        mode={shareMode}
      />
    </div>
  );
}
