import React from 'react';
import { ActiveAppView } from '../types/patient';
import {
  Plus,
  Stethoscope,
  FileText,
  Activity,
  Droplets,
  ListTodo,
  Share2,
  BookOpen,
  Trash2,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onNewNote: () => void;
  onOpenIVCalc: () => void;
  onOpenShare: () => void;
  activeTab: ActiveAppView;
  setActiveTab: (tab: ActiveAppView) => void;
  onPrintAll: () => void;
  trashCount: number;
  residentNotesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewNote,
  onOpenIVCalc,
  onOpenShare,
  activeTab,
  setActiveTab,
  onPrintAll,
  trashCount,
  residentNotesCount,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-14 sm:h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <button
              onClick={() => setActiveTab('cards')}
              className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left hover:text-teal-700 transition-colors"
            >
              CliniQuick
            </button>
          </div>

          {/* Zone 2: Navigation & Tools (single-line text) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('cards')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'cards' ? 'text-teal-700 font-bold border-b-2 border-teal-600' : ''
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Fichas</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'table' ? 'text-teal-700 font-bold border-b-2 border-teal-600' : ''
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Pase / Tabla</span>
            </button>

            <button
              onClick={() => setActiveTab('by_doctor')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'by_doctor' ? 'text-teal-700 font-bold border-b-2 border-teal-600' : ''
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Por Doctor</span>
            </button>

            <button
              onClick={() => setActiveTab('all_pendings')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'all_pendings' ? 'text-teal-700 font-bold border-b-2 border-teal-600' : ''
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Pendientes</span>
            </button>

            <button
              onClick={() => setActiveTab('resident_notes')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'resident_notes' ? 'text-teal-700 font-bold border-b-2 border-teal-600' : ''
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bitácora Residente</span>
              {residentNotesCount > 0 && (
                <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {residentNotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'trash' ? 'text-amber-700 font-bold border-b-2 border-amber-600' : ''
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Papelera</span>
              {trashCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono">
                  {trashCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Compartir, Calc IV, Nueva Nota) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenIVCalc}
              title="Calculadora de infusión IV"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Droplets className="w-4 h-4 text-sky-600" />
              <span className="hidden md:inline font-medium">Calc IV</span>
            </button>

            <button
              onClick={onOpenShare}
              title="Compartir entrega de guardia con médico de turno"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Compartir Turno</span>
            </button>

            <button
              onClick={onNewNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Nota</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'cards' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Fichas
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'table' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Pase
          </button>
          <button
            onClick={() => setActiveTab('by_doctor')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'by_doctor' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Por Doctor
          </button>
          <button
            onClick={() => setActiveTab('all_pendings')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'all_pendings' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveTab('resident_notes')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'resident_notes' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Bitácora Residente {residentNotesCount > 0 ? `(${residentNotesCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'trash' ? 'bg-amber-700 text-white font-bold' : 'text-slate-600 bg-slate-50'
            }`}
          >
            Papelera {trashCount > 0 ? `(${trashCount})` : ''}
          </button>
        </div>
      </div>
    </header>
  );
};
