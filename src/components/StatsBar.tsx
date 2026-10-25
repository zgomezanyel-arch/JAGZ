import React from 'react';
import { PatientNote } from '../types/patient';
import { Users, Clock, AlertCircle, Droplet, Utensils, Activity } from 'lucide-react';

interface StatsBarProps {
  patients: PatientNote[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ patients }) => {
  const total = patients.length;
  
  const totalPending = patients.reduce(
    (acc, p) => acc + (p.pendingTasks?.filter((t) => !t.completed).length || 0),
    0
  );

  const urgentPending = patients.reduce(
    (acc, p) =>
      acc +
      (p.pendingTasks?.filter((t) => !t.completed && t.priority === 'alta').length || 0),
    0
  );

  const withIV = patients.filter((p) => {
    const text = (p.ivSolutions || '').toLowerCase();
    return (
      text.includes('solución') ||
      text.includes('hartmann') ||
      text.includes('fisiológica') ||
      text.includes('glucosada') ||
      text.includes('ml') ||
      text.includes('iv')
    ) && !text.includes('sin soluciones');
  }).length;

  const withInfusions = patients.filter((p) => {
    const text = (p.infusions || '').toLowerCase();
    return text.trim() !== '' && !text.includes('sin infusiones');
  }).length;

  const inFasting = patients.filter((p) => {
    const diet = (p.diet || '').toLowerCase();
    return diet.includes('ayuno') || diet.includes('npo');
  }).length;

  return (
    <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Censo de Pacientes</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {total}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Registros activos en turno
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Soluciones IV</span>
          <Droplet className="w-4 h-4 text-sky-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {withIV}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Parenteral continua
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Infusiones Especiales</span>
          <Activity className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-2xl font-bold text-purple-950 font-mono tabular-nums">
          {withInfusions}
        </div>
        <div className="text-xs text-purple-700 mt-1">
          Vasoactivos / Sedación
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Dieta en Ayuno / NPO</span>
          <Utensils className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {inFasting}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          En preparación o intolerancia
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Pendientes de Guardia</span>
          {urgentPending > 0 ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <Clock className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalPending}
          </span>
          {urgentPending > 0 && (
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              {urgentPending} urgentes
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Laboratorios, imágenes y valoraciones
        </div>
      </div>
    </div>
  );
};
