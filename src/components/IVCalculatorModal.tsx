import React, { useState } from 'react';
import { calculateIVDripRate } from '../utils/clinicalFormat';
import { X, Droplets, Copy, Check, Calculator } from 'lucide-react';

interface IVCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSolutionText?: (text: string) => void;
}

export const IVCalculatorModal: React.FC<IVCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectSolutionText,
}) => {
  const [solutionType, setSolutionType] = useState('Solución Fisiológica 0.9%');
  const [volumeMl, setVolumeMl] = useState<number>(1000);
  const [hours, setHours] = useState<number>(8);
  const [additives, setAdditives] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { mlPerHour, dropsPerMinMacro, microDropsPerMin } = calculateIVDripRate(volumeMl, hours);

  const formattedIndication = `${solutionType} ${volumeMl} ml${
    additives ? ` + ${additives}` : ''
  } IV para ${hours} horas (${mlPerHour} ml/h · ${dropsPerMinMacro} gotas/min)`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedIndication);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-sky-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Calculadora de Soluciones IV
              </h2>
              <p className="text-xs text-slate-500">
                Goteo, velocidad de infusión parenteral y volumen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Solution Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Solución
            </label>
            <select
              value={solutionType}
              onChange={(e) => setSolutionType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Solución Fisiológica 0.9%">Solución Fisiológica 0.9% (Cloruro de Sodio)</option>
              <option value="Solución Hartmann">Solución Hartmann (Lactato Ringer)</option>
              <option value="Solución Glucosada 5%">Solución Glucosada al 5%</option>
              <option value="Solución Glucosada 10%">Solución Glucosada al 10%</option>
              <option value="Solución Mixta (Glucosa 5% + Salina 0.9%)">Solución Mixta</option>
              <option value="Solución Salina Hipertónica 3%">Solución Salina Hipertónica al 3%</option>
              <option value="SVT (Solución para Vena Permeable)">SVT (Vena Permeable)</option>
            </select>
          </div>

          {/* Volume and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Volumen (ml)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={volumeMl}
                onChange={(e) => setVolumeMl(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
              <div className="flex gap-1 mt-1.5">
                {[250, 500, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVolumeMl(v)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                  >
                    {v}ml
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiempo de Infusión (horas)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
              <div className="flex gap-1 mt-1.5">
                {[6, 8, 12, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additives */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aditivos / Electrólitos (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. 20 mEq KCl, Sulfato de Magnesio 1g, etc."
              value={additives}
              onChange={(e) => setAdditives(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Calculated Output display */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-sky-900 block mb-2">
              Resultados de la Infusión
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Bomba Infusión</span>
                <span className="text-xl font-bold text-sky-900 font-mono tabular-nums">{mlPerHour}</span>
                <span className="text-[10px] text-slate-600 block">ml/hora</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Normogotero</span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{dropsPerMinMacro}</span>
                <span className="text-[10px] text-slate-600 block">gotas/min</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Microgotero</span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{microDropsPerMin}</span>
                <span className="text-[10px] text-slate-600 block">μgotas/min</span>
              </div>
            </div>

            {/* Generated text preview */}
            <div className="mt-3 p-2.5 bg-white rounded-lg border border-sky-200/80 text-xs font-mono text-slate-800 break-words">
              {formattedIndication}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Indicación Médica</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
