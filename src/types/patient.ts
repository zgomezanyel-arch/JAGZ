export interface PendingItem {
  id: string;
  text: string;
  category: 'laboratorio' | 'imagen' | 'interconsulta' | 'procedimiento' | 'general';
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  dueDate?: string;
}

export interface VitalSigns {
  ta?: string; // Tensión arterial (e.g., 120/80)
  fc?: number; // Frecuencia cardíaca (lpm)
  fr?: number; // Frecuencia respiratoria (rpm)
  temp?: number; // Temperatura (°C)
  spo2?: number; // Saturación de O2 (%)
  dextro?: number; // Glucemia capilar (mg/dL)
}

export interface NewbornData {
  relationLabel: string; // ej. "Hijo de Mariana Rodríguez"
  sex: 'masculino' | 'femenino' | 'indeterminado';
  gestationalAgeMethod: 'Capurro' | 'Ballard' | 'FUM / USG';
  gestationalWeeks: number; // e.g. 39
  gestationalDays?: number; // e.g. 2 -> "39.2 SDG"
  weightGrams?: number; // e.g. 3250 gramos
  attendingPediatrician: string; // Pediatra a cargo del RN
  diagnosis?: string; // Diagnóstico si lo amerita o "RNAT / AEG / Sano"
  diet?: string; // ej. "Seno materno exclusivo a libre demanda" o "Fórmula inicio"
  apgar?: string; // e.g. "8/9"
  silverman?: number; // e.g. 0
  notes?: string; // Vacunas BCG/Hepatitis B, tamiz, micción, evacuación
}

export interface PatientNote {
  id: string;
  // Core clinical fields:
  fullName: string; // Nombre completo
  age: number; // Edad (valor)
  ageUnit: 'años' | 'meses' | 'días'; // Unidad de edad
  attendingPhysician: string; // Médico tratante principal
  hasSecondDoctor?: boolean; // Checkbox si hay segundo médico a cargo
  coAttendingPhysician?: string; // Segundo médico a cargo (interconsultante o co-responsable)
  admissionDate: string; // Fecha de ingreso (YYYY-MM-DD o ISO)
  diet: string; // Dieta
  ivSolutions: string; // Soluciones intravenosas aplicadas
  infusions?: string; // Infusiones continuas especiales (Norepinefrina, Fentanilo, Midazolam, etc.)
  diagnosis: string; // Diagnóstico
  treatment: string; // Tratamiento
  pendingTasks: PendingItem[]; // Pendientes
  surveillance: string; // Vigilar por (signo vital, dolor, vómitos, sangrado, etc.)

  // Binomio Madre - Recién Nacido (Alojamiento Conjunto en la misma cama):
  isPostpartum?: boolean; // Habilitado si paciente está posparto / binomio
  newborn?: NewbornData | null; // Datos del RN compartiendo habitación/cama

  // Clinical context:
  bed?: string; // Cama / Habitación
  service?: string; // Servicio (Urgencias, Medicina Interna, Urología, Cardiología, Nefrología, etc.)
  customService?: string; // Por si se especificó vía "Otro"
  vitals?: VitalSigns; // Signos vitales opcionales
  allergies?: string; // Alergias conocidas
  status: 'hospitalizado' | 'observacion' | 'alta' | 'quirurgico';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt?: string | null; // Fecha de eliminación para papelera de reciclaje
  notes?: string; // Observaciones adicionales / Evolución
}

export interface ResidentLogNote {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'alta';
  category: 'guardia' | 'administrativo' | 'insumos' | 'codigo' | 'general' | 'pendiente_residente';
  createdAt: string;
  authorResident?: string;
  assignedDoctor?: string; // "Sin médico en específico (Guardia general)" or specific doctor name
  completed?: boolean;
}

export type PatientFilter =
  | 'todos'
  | 'hospitalizado'
  | 'observacion'
  | 'quirurgico'
  | 'posparto'
  | 'con_infusiones'
  | 'con_pendientes'
  | 'alta';

export type ActiveAppView = 'cards' | 'table' | 'by_doctor' | 'all_pendings' | 'resident_notes' | 'trash';
