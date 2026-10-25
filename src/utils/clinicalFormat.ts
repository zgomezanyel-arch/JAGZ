import { PatientNote } from '../types/patient';

export function calculateDaysOfStay(admissionDate?: string): number {
  if (!admissionDate) return 1;
  try {
    const admission = new Date(admissionDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - admission.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays + 1; // Día 1 de estancia en adelante
  } catch {
    return 1;
  }
}

/**
 * Extracts the first numeric value from a bed string (e.g., "Cama 04" -> 4, "Cama 104" -> 104)
 */
export function extractBedNumber(bedStr?: string): number | null {
  if (!bedStr) return null;
  const match = bedStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Natural bed number sorting from lowest to highest:
 * e.g., "Cama 04" -> "Cama 12" -> "Cama 104" -> "Cama 210-A" -> "Cama 210-B" -> "Cama 304"
 * Beds without numbers or empty beds sort to the very end.
 */
export function compareBedNumbers(bedA?: string, bedB?: string): number {
  const a = (bedA || '').trim();
  const b = (bedB || '').trim();

  // Empty beds always go to the end
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const numA = extractBedNumber(a);
  const numB = extractBedNumber(b);

  if (numA !== null && numB !== null) {
    if (numA !== numB) {
      return numA - numB;
    }
    // If numeric values are identical (e.g. Cama 210-A vs Cama 210-B), compare alphanumerically
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }

  if (numA !== null && numB === null) {
    return -1; // numbered beds first
  }
  if (numA === null && numB !== null) {
    return 1;
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function generateClinicalTextNote(patient: PatientNote): string {
  const dateFormatted = new Date(patient.updatedAt || patient.createdAt).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const stayDays = calculateDaysOfStay(patient.admissionDate);
  const admissionFormatted = patient.admissionDate
    ? new Date(patient.admissionDate).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'No especificada';

  const vitalsText = patient.vitals
    ? `SIGNOS VITALES:
- TA: ${patient.vitals.ta || 'N/R'} mmHg | FC: ${patient.vitals.fc ? `${patient.vitals.fc} lpm` : 'N/R'} | FR: ${patient.vitals.fr ? `${patient.vitals.fr} rpm` : 'N/R'} | Temp: ${patient.vitals.temp ? `${patient.vitals.temp}°C` : 'N/R'} | SpO2: ${patient.vitals.spo2 ? `${patient.vitals.spo2}%` : 'N/R'}${patient.vitals.dextro ? ` | Dx: ${patient.vitals.dextro} mg/dL` : ''}`
    : '';

  const pendingList = patient.pendingTasks && patient.pendingTasks.length > 0
    ? patient.pendingTasks
        .map((p) => `  ${p.completed ? '[x]' : '[ ]'} (${p.priority.toUpperCase()}) ${p.text}`)
        .join('\n')
    : '  Sin pendientes registrados';

  let newbornText = '';
  if (patient.isPostpartum && patient.newborn) {
    const nb = patient.newborn;
    newbornText = `\n========================================
DATOS DEL RECIÉN NACIDO (ALOJAMIENTO CONJUNTO - MISMA CAMA)
- Paciente RN: ${nb.relationLabel || `Hijo(a) de ${patient.fullName}`}
- Sexo: ${nb.sex === 'masculino' ? 'Masculino' : nb.sex === 'femenino' ? 'Femenino' : 'Indeterminado'}
- Edad Gestacional: ${nb.gestationalWeeks}${nb.gestationalDays ? `.${nb.gestationalDays}` : ''} SDG por ${nb.gestationalAgeMethod}
- Peso: ${nb.weightGrams ? `${nb.weightGrams.toLocaleString()} g` : 'No registrado'}
- Pediatra a Cargo del RN: ${nb.attendingPediatrician || 'Por asignar'}
- Diagnóstico RN: ${nb.diagnosis || 'RNAT / AEG / Sano en alojamiento conjunto'}
- Dieta RN: ${nb.diet || 'Seno materno exclusivo a libre demanda'}${nb.apgar ? `\n- Apgar: ${nb.apgar}` : ''}${nb.silverman !== undefined ? ` | Silverman: ${nb.silverman}` : ''}${nb.notes ? `\n- Observaciones RN: ${nb.notes}` : ''}`;
  }

  const secondDocLine =
    Boolean(patient.hasSecondDoctor || patient.coAttendingPhysician) && patient.coAttendingPhysician
      ? `\nSEGUNDO MÉDICO A CARGO: ${patient.coAttendingPhysician}`
      : '';

  return `========================================
NOTA MÉDICA RÁPIDA - HOSPITALIZACIÓN
========================================
FECHA/HORA: ${dateFormatted}
PACIENTE: ${patient.fullName}
EDAD: ${patient.age} ${patient.ageUnit}
CAMA/SERVICIO: ${patient.bed || 'No asignada'} / ${patient.service || 'General'}
FECHA DE INGRESO: ${admissionFormatted} (Día ${stayDays} de estancia)
MÉDICO TRATANTE: ${patient.attendingPhysician}${secondDocLine}
ALERGIAS: ${patient.allergies || 'Negadas'}

DIAGNÓSTICO:
${patient.diagnosis || 'En estudio'}

DIETA:
${patient.diet || 'Ayuno'}

SOLUCIONES INTRAVENOSAS APLICADAS:
${patient.ivSolutions || 'Sin soluciones activas'}
${patient.infusions ? `\nINFUSIONES CONTINUAS (VASOACTIVAS / SEDACIÓN):\n${patient.infusions}` : ''}

TRATAMIENTO:
${patient.treatment || 'Sin tratamiento farmacológico activo'}

VIGILAR POR (DATOS DE ALARMA / VIGILANCIA):
${patient.surveillance || 'Vigilar signos vitales y datos de alarma habituales'}

PENDIENTES:
${pendingList}
${vitalsText ? `\n${vitalsText}` : ''}
${patient.notes ? `\nEVOLUCIÓN / OBSERVACIONES:\n${patient.notes}` : ''}
${newbornText}
========================================`;
}

export function calculateIVDripRate(volumeMl: number, hours: number) {
  if (!hours || hours <= 0 || !volumeMl || volumeMl <= 0) {
    return { mlPerHour: 0, dropsPerMinMacro: 0, microDropsPerMin: 0 };
  }
  const mlPerHour = Math.round((volumeMl / hours) * 10) / 10;
  // Factor macrogotero (20 gotas = 1 ml): (Volumen * 20) / (horas * 60) = Volumen / (horas * 3)
  const dropsPerMinMacro = Math.round(volumeMl / (hours * 3));
  // Microgotero (60 microgotas = 1 ml): igual a ml/hora
  const microDropsPerMin = Math.round(mlPerHour);

  return {
    mlPerHour,
    dropsPerMinMacro,
    microDropsPerMin,
  };
}

export function formatDateSpanish(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
