import React, { useState, useEffect } from 'react';
import { PatientNote, PendingItem, NewbornData } from '../types/patient';
import {
  STANDARD_SERVICES,
  FREQUENT_OTHER_SERVICES,
  COMMON_DIETS,
  COMMON_IV_SOLUTIONS,
  COMMON_INFUSIONS,
  COMMON_DIAGNOSES,
  COMMON_TREATMENTS,
  COMMON_SURVEILLANCE,
  COMMON_NEWBORN_DIAGNOSES,
  COMMON_NEWBORN_DIETS,
  CLINICAL_TEMPLATES,
} from '../data/clinicalPresets';
import {
  X,
  Plus,
  Trash2,
  Mic,
  MicOff,
  Sparkles,
  Stethoscope,
  Utensils,
  Droplet,
  FileSpreadsheet,
  Pill,
  CheckSquare,
  AlertCircle,
  Activity,
  Eye,
  Calendar,
  Baby,
  UserCheck,
} from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: PatientNote) => void;
  initialData?: PatientNote | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(45);
  const [ageUnit, setAgeUnit] = useState<'años' | 'meses' | 'días'>('años');
  const [bed, setBed] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<PatientNote['status']>('hospitalizado');

  // Attending Physicians
  const [attendingPhysician, setAttendingPhysician] = useState('');
  const [hasSecondDoctor, setHasSecondDoctor] = useState(false);
  const [coAttendingPhysician, setCoAttendingPhysician] = useState('');

  // Service selector & "Otro"
  const [selectedServiceOption, setSelectedServiceOption] = useState<string>('Medicina Interna');
  const [customServiceText, setCustomServiceText] = useState<string>('');

  // Core Maternal Clinical Fields
  const [diet, setDiet] = useState('');
  const [ivSolutions, setIvSolutions] = useState('');
  const [infusions, setInfusions] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [surveillance, setSurveillance] = useState('');
  const [allergies, setAllergies] = useState('Negadas');
  const [notes, setNotes] = useState('');

  // Vitals
  const [ta, setTa] = useState('');
  const [fc, setFc] = useState<number | ''>('');
  const [fr, setFr] = useState<number | ''>('');
  const [temp, setTemp] = useState<number | ''>('');
  const [spo2, setSpo2] = useState<number | ''>('');
  const [dextro, setDextro] = useState<number | ''>('');

  // Pendientes list
  const [pendingTasks, setPendingTasks] = useState<PendingItem[]>([]);
  const [newPendingText, setNewPendingText] = useState('');
  const [newPendingPriority, setNewPendingPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [newPendingCategory, setNewPendingCategory] = useState<PendingItem['category']>('laboratorio');

  // Binomio Madre - Recién Nacido (Alojamiento Conjunto en la misma cama)
  // UBICADO HASTA ABAJO SEGÚN SOLICITUD
  const [isPostpartum, setIsPostpartum] = useState(false);
  const [newbornRelationLabel, setNewbornRelationLabel] = useState('');
  const [newbornSex, setNewbornSex] = useState<'masculino' | 'femenino' | 'indeterminado'>('masculino');
  const [newbornMethod, setNewbornMethod] = useState<'Capurro' | 'Ballard' | 'FUM / USG'>('Capurro');
  const [newbornWeeks, setNewbornWeeks] = useState<number | ''>(39);
  const [newbornDays, setNewbornDays] = useState<number | ''>(0);
  const [newbornWeight, setNewbornWeight] = useState<number | ''>(3200);
  const [newbornPediatrician, setNewbornPediatrician] = useState('');
  const [newbornDiagnosis, setNewbornDiagnosis] = useState('');
  const [newbornDiet, setNewbornDiet] = useState('Seno materno exclusivo a libre demanda');
  const [newbornApgar, setNewbornApgar] = useState('8/9');
  const [newbornSilverman, setNewbornSilverman] = useState<number | ''>(0);
  const [newbornNotes, setNewbornNotes] = useState('Vacunas BCG y Hepatitis B aplicadas');

  // Voice dictation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<'diagnosis' | 'treatment' | 'notes' | 'infusions' | 'surveillance' | null>(null);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setAge(initialData.age ?? '');
      setAgeUnit(initialData.ageUnit || 'años');
      setBed(initialData.bed || '');
      setAdmissionDate(initialData.admissionDate || new Date().toISOString().slice(0, 10));
      setStatus(initialData.status || 'hospitalizado');

      // Doctors
      setAttendingPhysician(initialData.attendingPhysician || '');
      const hadSecond = Boolean(initialData.hasSecondDoctor || initialData.coAttendingPhysician);
      setHasSecondDoctor(hadSecond);
      setCoAttendingPhysician(initialData.coAttendingPhysician || '');

      // Service & "Otro"
      const curService = initialData.service || 'Medicina Interna';
      const isKnownStandard = STANDARD_SERVICES.filter((s) => s !== 'Otro').includes(curService);
      if (isKnownStandard) {
        setSelectedServiceOption(curService);
        setCustomServiceText('');
      } else {
        setSelectedServiceOption('Otro');
        setCustomServiceText(curService);
      }

      // Maternal clinical data
      setDiet(initialData.diet || '');
      setIvSolutions(initialData.ivSolutions || '');
      setInfusions(initialData.infusions || '');
      setDiagnosis(initialData.diagnosis || '');
      setTreatment(initialData.treatment || '');
      setSurveillance(initialData.surveillance || '');
      setAllergies(initialData.allergies || 'Negadas');
      setNotes(initialData.notes || '');
      setPendingTasks(initialData.pendingTasks || []);

      if (initialData.vitals) {
        setTa(initialData.vitals.ta || '');
        setFc(initialData.vitals.fc ?? '');
        setFr(initialData.vitals.fr ?? '');
        setTemp(initialData.vitals.temp ?? '');
        setSpo2(initialData.vitals.spo2 ?? '');
        setDextro(initialData.vitals.dextro ?? '');
      } else {
        setTa('');
        setFc('');
        setFr('');
        setTemp('');
        setSpo2('');
        setDextro('');
      }

      // Newborn & Postpartum
      if (initialData.isPostpartum) {
        setIsPostpartum(true);
        if (initialData.newborn) {
          setNewbornRelationLabel(initialData.newborn.relationLabel || `Hijo de ${initialData.fullName}`);
          setNewbornSex(initialData.newborn.sex || 'masculino');
          setNewbornMethod(initialData.newborn.gestationalAgeMethod || 'Capurro');
          setNewbornWeeks(initialData.newborn.gestationalWeeks ?? 39);
          setNewbornDays(initialData.newborn.gestationalDays ?? 0);
          setNewbornWeight(initialData.newborn.weightGrams ?? 3200);
          setNewbornPediatrician(initialData.newborn.attendingPediatrician || '');
          setNewbornDiagnosis(initialData.newborn.diagnosis || '');
          setNewbornDiet(initialData.newborn.diet || 'Seno materno exclusivo a libre demanda');
          setNewbornApgar(initialData.newborn.apgar || '8/9');
          setNewbornSilverman(initialData.newborn.silverman ?? 0);
          setNewbornNotes(initialData.newborn.notes || '');
        }
      } else {
        setIsPostpartum(false);
        setNewbornRelationLabel('');
        setNewbornSex('masculino');
        setNewbornMethod('Capurro');
        setNewbornWeeks(39);
        setNewbornDays(0);
        setNewbornWeight(3200);
        setNewbornPediatrician('');
        setNewbornDiagnosis('');
        setNewbornDiet('Seno materno exclusivo a libre demanda');
        setNewbornApgar('8/9');
        setNewbornSilverman(0);
        setNewbornNotes('');
      }
    } else {
      // Clean state for new patient
      setFullName('');
      setAge(45);
      setAgeUnit('años');
      setAttendingPhysician('');
      setHasSecondDoctor(false);
      setCoAttendingPhysician('');
      setBed('');
      setSelectedServiceOption('Medicina Interna');
      setCustomServiceText('');
      setAdmissionDate(new Date().toISOString().slice(0, 10));
      setStatus('hospitalizado');
      setDiet('');
      setIvSolutions('');
      setInfusions('');
      setDiagnosis('');
      setTreatment('');
      setSurveillance('');
      setAllergies('Negadas');
      setNotes('');
      setPendingTasks([]);
      setTa('');
      setFc('');
      setFr('');
      setTemp('');
      setSpo2('');
      setDextro('');
      setIsPostpartum(false);
      setNewbornRelationLabel('');
      setNewbornSex('masculino');
      setNewbornMethod('Capurro');
      setNewbornWeeks(39);
      setNewbornDays(0);
      setNewbornWeight(3200);
      setNewbornPediatrician('');
      setNewbornDiagnosis('');
      setNewbornDiet('Seno materno exclusivo a libre demanda');
      setNewbornApgar('8/9');
      setNewbornSilverman(0);
      setNewbornNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const toggleDictation = (field: 'diagnosis' | 'treatment' | 'notes' | 'infusions' | 'surveillance') => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('El reconocimiento de voz no está soportado en este navegador. Se recomienda Google Chrome.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setRecordingTarget(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-MX';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTarget(field);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (field === 'diagnosis') {
          setDiagnosis((prev) => (prev ? `${prev}. ${transcript}` : transcript));
        } else if (field === 'treatment') {
          setTreatment((prev) => (prev ? `${prev}\n• ${transcript}` : transcript));
        } else if (field === 'infusions') {
          setInfusions((prev) => (prev ? `${prev}, ${transcript}` : transcript));
        } else if (field === 'surveillance') {
          setSurveillance((prev) => (prev ? `${prev}. ${transcript}` : transcript));
        } else if (field === 'notes') {
          setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsRecording(false);
        setRecordingTarget(null);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setRecordingTarget(null);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingTarget(null);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
      setRecordingTarget(null);
    }
  };

  const handleApplyTemplate = (template: typeof CLINICAL_TEMPLATES[0]) => {
    setDiet(template.data.diet);
    setIvSolutions(template.data.ivSolutions);
    setDiagnosis(template.data.diagnosis);
    setTreatment(template.data.treatment);
    setSurveillance(template.data.surveillance || '');

    if (template.data.isPostpartum) {
      setIsPostpartum(true);
      setSelectedServiceOption('Gineco-Obstetricia');
      if (template.data.newborn) {
        setNewbornRelationLabel(template.data.newborn.relationLabel || `Hijo de ${fullName || 'la paciente'}`);
        setNewbornSex(template.data.newborn.sex || 'masculino');
        setNewbornMethod(template.data.newborn.gestationalAgeMethod || 'Capurro');
        setNewbornWeeks(template.data.newborn.gestationalWeeks || 39);
        setNewbornDays(template.data.newborn.gestationalDays || 0);
        setNewbornWeight(template.data.newborn.weightGrams || 3250);
        setNewbornPediatrician(template.data.newborn.attendingPediatrician || '');
        setNewbornDiagnosis(template.data.newborn.diagnosis || '');
        setNewbornDiet(template.data.newborn.diet || 'Seno materno exclusivo a libre demanda');
      }
    }

    const newItems: PendingItem[] = template.data.pendingTasks.map((t, idx) => ({
      id: `pend-tmpl-${Date.now()}-${idx}`,
      text: t.text,
      category: t.category,
      priority: t.priority,
      completed: false,
    }));
    setPendingTasks(newItems);
  };

  const handleAddPending = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPendingText.trim()) return;

    const newItem: PendingItem = {
      id: `pend-${Date.now()}`,
      text: newPendingText.trim(),
      category: newPendingCategory,
      priority: newPendingPriority,
      completed: false,
    };

    setPendingTasks([...pendingTasks, newItem]);
    setNewPendingText('');
  };

  const handleRemovePending = (id: string) => {
    setPendingTasks(pendingTasks.filter((t) => t.id !== id));
  };

  const handleTogglePending = (id: string) => {
    setPendingTasks(
      pendingTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'El nombre completo es requerido';
    if (age === '' || age < 0) newErrors.age = 'Ingrese una edad válida';
    if (!attendingPhysician.trim()) newErrors.attendingPhysician = 'El médico tratante es requerido';
    if (!diagnosis.trim()) newErrors.diagnosis = 'El diagnóstico es requerido';

    if (hasSecondDoctor && !coAttendingPhysician.trim()) {
      newErrors.coAttendingPhysician = 'Especifique el nombre del segundo médico';
    }

    if (selectedServiceOption === 'Otro' && !customServiceText.trim()) {
      newErrors.customService = 'Especifique el servicio médico';
    }

    if (isPostpartum && !newbornPediatrician.trim()) {
      newErrors.newbornPediatrician = 'Especifique el pediatra a cargo del recién nacido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalService =
      selectedServiceOption === 'Otro'
        ? customServiceText.trim() || 'Otro'
        : selectedServiceOption;

    let newbornData: NewbornData | undefined = undefined;
    if (isPostpartum) {
      newbornData = {
        relationLabel: newbornRelationLabel.trim() || `Hijo(a) de ${fullName.trim()}`,
        sex: newbornSex,
        gestationalAgeMethod: newbornMethod,
        gestationalWeeks: typeof newbornWeeks === 'number' ? newbornWeeks : 39,
        gestationalDays: typeof newbornDays === 'number' ? newbornDays : 0,
        weightGrams: newbornWeight !== '' ? Number(newbornWeight) : undefined,
        attendingPediatrician: newbornPediatrician.trim() || 'Pediatra de guardia',
        diagnosis: newbornDiagnosis.trim() || 'RNAT / AEG / Sano en alojamiento conjunto',
        diet: newbornDiet.trim() || 'Seno materno exclusivo a libre demanda',
        apgar: newbornApgar.trim() || undefined,
        silverman: newbornSilverman !== '' ? Number(newbornSilverman) : undefined,
        notes: newbornNotes.trim() || undefined,
      };
    }

    const noteToSave: PatientNote = {
      id: initialData?.id || `pat-${Date.now()}`,
      fullName: fullName.trim(),
      age: Number(age),
      ageUnit,
      attendingPhysician: attendingPhysician.trim(),
      hasSecondDoctor,
      coAttendingPhysician: hasSecondDoctor ? coAttendingPhysician.trim() : undefined,
      bed: bed.trim() || undefined,
      service: finalService,
      customService: selectedServiceOption === 'Otro' ? customServiceText.trim() : undefined,
      admissionDate: admissionDate || new Date().toISOString().slice(0, 10),
      status,
      diet: diet.trim() || 'Ayuno',
      ivSolutions: ivSolutions.trim() || 'Sin soluciones parenterales activas',
      infusions: infusions.trim() || undefined,
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim() || 'Sin tratamiento farmacológico registrado',
      surveillance: surveillance.trim() || 'Vigilar signos vitales y datos de alarma habituales',
      pendingTasks,
      allergies: allergies.trim() || 'Negadas',
      notes: notes.trim() || undefined,
      vitals: {
        ta: ta.trim() || undefined,
        fc: fc !== '' ? Number(fc) : undefined,
        fr: fr !== '' ? Number(fr) : undefined,
        temp: temp !== '' ? Number(temp) : undefined,
        spo2: spo2 !== '' ? Number(spo2) : undefined,
        dextro: dextro !== '' ? Number(dextro) : undefined,
      },
      // Recién Nacido (Alojamiento Conjunto) al fondo de la ficha
      isPostpartum,
      newborn: isPostpartum ? newbornData : null,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(noteToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 text-[11px]">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>{initialData ? 'Editar Ficha Clínica' : 'Nueva Nota Médica Rápida'}</span>
            </h2>
            <p className="text-[10px] text-slate-500">
              Formato clínico delimitado con densidad de guardia para pase de visita y entrega de turno
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates quick bar */}
        <div className="px-4 py-1.5 bg-teal-50/60 border-b border-teal-100 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
          <span className="text-teal-900 font-bold flex items-center gap-1 shrink-0 text-[10px]">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Plantillas:
          </span>
          {CLINICAL_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="px-2 py-0.5 font-medium bg-white hover:bg-teal-600 hover:text-white text-teal-900 rounded border border-teal-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
              title={tmpl.description}
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/30">
          {/* SECTION 1: Identificación y Datos de Admisión */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                1. Identificación y Ubicación del Paciente
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">ID: {initialData?.id || 'Nuevo'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Nombre Completo */}
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Nombre Completo del Paciente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Valeria Montserrat Gómez Ortiz"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (isPostpartum && (!newbornRelationLabel || newbornRelationLabel.startsWith('Hijo de '))) {
                      setNewbornRelationLabel(`Hijo de ${e.target.value}`);
                    }
                  }}
                  className={`w-full px-2.5 py-1 text-[11px] bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    errors.fullName ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-rose-600 mt-0.5">{errors.fullName}</p>}
              </div>

              {/* Edad */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Edad *
                </label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0"
                    max="130"
                    required
                    placeholder="27"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full px-2.5 py-1 text-[11px] bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono ${
                      errors.age ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  <select
                    value={ageUnit}
                    onChange={(e) => setAgeUnit(e.target.value as any)}
                    className="px-2 py-1 text-[10px] bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700"
                  >
                    <option value="años">años</option>
                    <option value="meses">meses</option>
                    <option value="días">días</option>
                  </select>
                </div>
              </div>

              {/* Cama / Habitación */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Cama / Habitación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cama 104"
                  value={bed}
                  onChange={(e) => setBed(e.target.value)}
                  className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Fecha de Ingreso */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  <span>Ingreso *</span>
                </label>
                <input
                  type="date"
                  required
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* SERVICIO CON APARTADO "OTRO" */}
              <div className="sm:col-span-6 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-800">
                    Servicio Hospitalario *
                  </label>
                  <span className="text-[9px] text-teal-700 font-semibold bg-teal-50 px-1 rounded">
                    Opción "Otro" para Urología, Cardiología, etc.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <select
                    value={selectedServiceOption}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedServiceOption(val);
                      if (val !== 'Otro') {
                        setCustomServiceText('');
                      }
                    }}
                    className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 font-medium"
                  >
                    <option value="Gineco-Obstetricia">Gineco-Obstetricia</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                    <option value="Cirugía General">Cirugía General</option>
                    <option value="Urgencias">Urgencias</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Terapia Intensiva">Terapia Intensiva (UCI)</option>
                    <option value="Traumatología">Traumatología</option>
                    <option value="Ambulatorio">Ambulatorio / Consulta</option>
                    <option value="Otro">Otro (especificar...)</option>
                  </select>

                  {selectedServiceOption === 'Otro' ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Ej. Urología, Cardiología..."
                        value={customServiceText}
                        onChange={(e) => setCustomServiceText(e.target.value)}
                        className={`w-full px-2.5 py-1 text-[11px] bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          errors.customService ? 'border-rose-500' : 'border-teal-400 ring-1 ring-teal-200'
                        }`}
                      />
                      {errors.customService && (
                        <p className="text-[9px] text-rose-600 mt-0.5">{errors.customService}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-[10px] text-slate-500 px-1">
                      <span>Servicio estándar seleccionado</span>
                    </div>
                  )}
                </div>

                {/* Chips rápidos de servicios frecuentes */}
                {selectedServiceOption === 'Otro' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-slate-200">
                    <span className="text-[9px] text-slate-500 font-semibold self-center">Especialidades:</span>
                    {FREQUENT_OTHER_SERVICES.map((serv) => (
                      <button
                        key={serv}
                        type="button"
                        onClick={() => setCustomServiceText(serv)}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                          customServiceText.toLowerCase() === serv.toLowerCase()
                            ? 'bg-teal-600 text-white border-teal-700 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                        }`}
                      >
                        {serv}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MÉDICOS: TRATANTE PRINCIPAL + CHECKBOX DE SEGUNDO MÉDICO A CARGO */}
              <div className="sm:col-span-6 bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-800 mb-0.5">
                    Médico Tratante Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Dr. Hernán Castellanos"
                    value={attendingPhysician}
                    onChange={(e) => setAttendingPhysician(e.target.value)}
                    className={`w-full px-2.5 py-1 text-[11px] bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                      errors.attendingPhysician ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.attendingPhysician && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{errors.attendingPhysician}</p>
                  )}
                </div>

                {/* Checkbox: ¿Tiene un segundo médico a cargo? */}
                <div className="pt-1 border-t border-slate-200">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasSecondDoctor}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasSecondDoctor(checked);
                        if (!checked) setCoAttendingPhysician('');
                      }}
                      className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-800">
                      <UserCheck className="w-3 h-3 text-teal-600" />
                      <span>¿Tiene un segundo médico a cargo? (Interconsultante / Co-tratante)</span>
                    </div>
                  </label>

                  {hasSecondDoctor && (
                    <div className="mt-1.5 pl-5">
                      <input
                        type="text"
                        placeholder="Ej. Dr. Mario Ruiz (Cardiología / Interconsultante)"
                        value={coAttendingPhysician}
                        onChange={(e) => setCoAttendingPhysician(e.target.value)}
                        className={`w-full px-2.5 py-1 text-[11px] bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          errors.coAttendingPhysician ? 'border-rose-500' : 'border-teal-300'
                        }`}
                      />
                      {errors.coAttendingPhysician && (
                        <p className="text-[10px] text-rose-600 mt-0.5">{errors.coAttendingPhysician}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Diagnóstico de la Madre */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                2. Diagnóstico de la Paciente *
              </label>
              <button
                type="button"
                onClick={() => toggleDictation('diagnosis')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                  isRecording && recordingTarget === 'diagnosis'
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
                title="Dictar diagnóstico por voz"
              >
                {isRecording && recordingTarget === 'diagnosis' ? (
                  <>
                    <MicOff className="w-3 h-3 text-rose-600" />
                    <span>Grabando...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>Dictar</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              required
              rows={2}
              placeholder="Ej. Puerperio quirúrgico mediato (Cesárea segmentaria) + Alojamiento conjunto..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-[11px] bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                errors.diagnosis ? 'border-rose-500' : 'border-slate-300'
              }`}
            />
            {errors.diagnosis && <p className="text-[10px] text-rose-600">{errors.diagnosis}</p>}

            {/* Quick Diagnosis suggestions */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="text-[9px] text-slate-400 self-center">Frecuentes:</span>
              {COMMON_DIAGNOSES.slice(0, 6).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiagnosis(d)}
                  className="text-[9px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                >
                  {d.split(' (')[0].slice(0, 36)}...
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Dieta & Soluciones Intravenosas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Dieta */}
            <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  3. Dieta de la Paciente *
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="Ej. Dieta normal para madre lactante con abundantes líquidos"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_DIETS.slice(0, 4).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiet(d)}
                    className="text-[9px] px-1.5 py-0.5 bg-amber-50/50 text-amber-900 rounded border border-amber-200 hover:bg-amber-100 cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Soluciones Intravenosas Aplicadas */}
            <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-sky-600" />
                  4. Soluciones Intravenosas *
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="Ej. Solución Hartmann 1000 ml IV para 12 horas (83 ml/h)"
                value={ivSolutions}
                onChange={(e) => setIvSolutions(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_IV_SOLUTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setIvSolutions(s)}
                    className="text-[9px] px-1.5 py-0.5 bg-sky-50/60 text-sky-900 rounded border border-sky-200 hover:bg-sky-100 cursor-pointer"
                  >
                    {s.split(' IV')[0].slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: Infusiones Especiales (Bombas / Vasoactivos / Sedación) */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-violet-100 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-violet-950 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-violet-600" />
                <span>5. Infusiones Continuas Especiales (Bomba de Infusión / Titulables)</span>
              </label>
              <span className="text-[9px] text-violet-600 font-medium">Opcional</span>
            </div>
            <textarea
              rows={2}
              placeholder="Ej. Norepinefrina 8mg en 100 cc Dextrosa al 5% a 10 cc/h titular (meta PAM ≥65 mmHg)..."
              value={infusions}
              onChange={(e) => setInfusions(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-violet-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="text-[9px] text-violet-600 self-center">Ejemplos:</span>
              {COMMON_INFUSIONS.slice(0, 3).map((inf) => (
                <button
                  key={inf}
                  type="button"
                  onClick={() => setInfusions(inf)}
                  className="text-[9px] px-1.5 py-0.5 bg-violet-50 text-violet-900 rounded border border-violet-200 hover:bg-violet-100 cursor-pointer"
                >
                  {inf.split(' en ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Tratamiento Farmacológico Completo */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                6. Tratamiento Farmacológico Completo *
              </label>
              <button
                type="button"
                onClick={() => toggleDictation('treatment')}
                className="text-[10px] text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>Dictar</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="1. Paracetamol 1g VO cada 8 horas&#10;2. Ketorolaco 30mg IV c/8h&#10;3. Ceftriaxona 1g IV c/12h"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono leading-relaxed"
            />
          </div>

          {/* SECTION 6: Vigilar por (Datos de alarma) */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-rose-100 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-600" />
                <span>7. Vigilar por... (Signos Vitales, Dolor, Vómitos, Alarmas Clínicas) *</span>
              </label>
              <button
                type="button"
                onClick={() => toggleDictation('surveillance')}
                className="text-[10px] text-rose-800 hover:text-rose-950 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>Dictar Alarma</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Ej. Vigilar curva térmica (avisar si T° ≥38.0°C), dolor EVA >4, vómitos, sangrado transvaginal y diuresis..."
              value={surveillance}
              onChange={(e) => setSurveillance(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {/* Quick alert tags */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="text-[9px] text-rose-800 font-medium self-center">Alarmas:</span>
              {COMMON_SURVEILLANCE.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setSurveillance((prev) => (prev ? `${prev}. ${s}` : s))
                  }
                  className="text-[9px] px-1.5 py-0.5 bg-rose-50 text-rose-900 rounded border border-rose-200 hover:bg-rose-100 cursor-pointer shadow-2xs"
                >
                  {s.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 7: Pendientes Clínicos */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                8. Pendientes para el Siguiente Turno
              </label>
              <span className="text-[10px] text-slate-400">Total: {pendingTasks.length}</span>
            </div>

            {/* Existing tasks */}
            <div className="space-y-1">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px]"
                >
                  <label className="flex items-center gap-1.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTogglePending(task.id)}
                      className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {task.text}
                    </span>
                  </label>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-semibold uppercase ${
                        task.priority === 'alta'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'media'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePending(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new pending task */}
            <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Agregar pendiente (ej. BHC de control matutino, USG abdominal)..."
                value={newPendingText}
                onChange={(e) => setNewPendingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPending();
                  }
                }}
                className="flex-1 px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <div className="flex items-center gap-1">
                <select
                  value={newPendingPriority}
                  onChange={(e) => setNewPendingPriority(e.target.value as any)}
                  className="px-2 py-1 text-[10px] bg-white border border-slate-300 rounded-md text-slate-700"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAddPending()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md text-[10px] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 8: Signos Vitales y Alergias (Madre) */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                9. Signos Vitales y Alergias (Madre)
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">TA (mmHg)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={ta}
                  onChange={(e) => setTa(e.target.value)}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">FC (lpm)</label>
                <input
                  type="number"
                  placeholder="78"
                  value={fc}
                  onChange={(e) => setFc(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">FR (rpm)</label>
                <input
                  type="number"
                  placeholder="18"
                  value={fr}
                  onChange={(e) => setFr(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">T° (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Glucemia (mg/dL)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={dextro}
                  onChange={(e) => setDextro(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-md font-mono text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                Alergias Conocidas
              </label>
              <input
                type="text"
                placeholder="Negadas, o especificar (ej. Penicilina, AINEs)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded-md"
              />
            </div>
          </div>

          {/* SECTION 9: RECIÉN NACIDO (RN) COLOCADO HASTA ABAJO SEGÚN SOLICITUD */}
          <div className={`border-2 rounded-xl transition-all ${
            isPostpartum
              ? 'bg-rose-50/50 border-rose-300 p-3.5 shadow-xs'
              : 'bg-white border-slate-300 p-3'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPostpartum}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsPostpartum(checked);
                    if (checked) {
                      if (selectedServiceOption === 'Medicina Interna') {
                        setSelectedServiceOption('Gineco-Obstetricia');
                      }
                      if (!newbornRelationLabel) {
                        setNewbornRelationLabel(`Hijo de ${fullName || 'la paciente'}`);
                      }
                      if (!newbornPediatrician) {
                        setNewbornPediatrician('Dra. Sofía Valenzuela (Pediatría / Neonatología)');
                      }
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    isPostpartum ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Baby className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-900 block">
                      ¿Paciente Posparto o con Recién Nacido en Alojamiento Conjunto?
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Habilitar datos del recién nacido que comparte habitación/cama con la madre
                    </span>
                  </div>
                </div>
              </label>

              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full self-start sm:self-auto ${
                isPostpartum ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {isPostpartum ? 'Binomio Madre - Hijo (Misma Cama)' : 'Sin RN en Cama'}
              </span>
            </div>

            {/* FORMULARIO COMPLETO DEL RECIÉN NACIDO AL FINAL */}
            {isPostpartum && (
              <div className="mt-3 pt-3 border-t border-rose-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-rose-600" />
                    <span>Datos Clínicos del Recién Nacido (Alojamiento Conjunto)</span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-semibold font-mono">
                    Ubicación: {bed || 'Cama de la madre'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-white p-3 rounded-lg border border-rose-200">
                  {/* Identificación: "Hijo de..." */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Identificación / "Hijo de..." *
                    </label>
                    <input
                      type="text"
                      placeholder={`Ej. Hijo de ${fullName || 'la paciente'}`}
                      value={newbornRelationLabel}
                      onChange={(e) => setNewbornRelationLabel(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
                    />
                  </div>

                  {/* Sexo del RN */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Sexo del RN *
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setNewbornSex('masculino')}
                        className={`py-1 px-1.5 rounded font-bold text-[10px] border cursor-pointer transition-colors ${
                          newbornSex === 'masculino'
                            ? 'bg-sky-100 text-sky-800 border-sky-300 ring-1 ring-sky-400'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ♂ Masculino
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewbornSex('femenino')}
                        className={`py-1 px-1.5 rounded font-bold text-[10px] border cursor-pointer transition-colors ${
                          newbornSex === 'femenino'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-400'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ♀ Femenino
                      </button>
                    </div>
                  </div>

                  {/* Pediatra a cargo del RN */}
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Pediatra a Cargo del RN *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Dra. Sofía Valenzuela (Pediatría)"
                      value={newbornPediatrician}
                      onChange={(e) => setNewbornPediatrician(e.target.value)}
                      className={`w-full px-2.5 py-1 text-[11px] bg-slate-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white ${
                        errors.newbornPediatrician ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.newbornPediatrician && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{errors.newbornPediatrician}</p>
                    )}
                  </div>

                  {/* Semanas de Gestación (Capurro o Ballard) */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Edad Gestacional por Capurro / Ballard *
                    </label>
                    <div className="flex gap-1">
                      <select
                        value={newbornMethod}
                        onChange={(e) => setNewbornMethod(e.target.value as any)}
                        className="px-2 py-1 text-[10px] bg-slate-50 border border-slate-300 rounded-md text-slate-700 font-semibold"
                      >
                        <option value="Capurro">Por Capurro</option>
                        <option value="Ballard">Por Ballard</option>
                        <option value="FUM / USG">Por FUM/USG</option>
                      </select>

                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          min="24"
                          max="43"
                          placeholder="39"
                          value={newbornWeeks}
                          onChange={(e) => setNewbornWeeks(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-14 px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-500">sem</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          max="6"
                          placeholder="2"
                          value={newbornDays}
                          onChange={(e) => setNewbornDays(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-12 px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md font-mono text-center"
                        />
                        <span className="text-[10px] text-slate-500">d</span>
                      </div>
                    </div>
                  </div>

                  {/* Peso al Nacer / Actual */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Peso en Gramos (g)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="500"
                        max="6000"
                        step="10"
                        placeholder="3250"
                        value={newbornWeight}
                        onChange={(e) => setNewbornWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md font-mono pr-7"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-medium">
                        g
                      </span>
                    </div>
                    {newbornWeight && Number(newbornWeight) > 0 && (
                      <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
                        ≈ {(Number(newbornWeight) / 1000).toFixed(2)} kg
                      </p>
                    )}
                  </div>

                  {/* Apgar y Silverman */}
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Apgar 1'/5' · Silverman
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="8/9"
                        value={newbornApgar}
                        onChange={(e) => setNewbornApgar(e.target.value)}
                        className="w-1/2 px-2 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md font-mono text-center"
                        title="Apgar al minuto 1 y 5"
                      />
                      <input
                        type="number"
                        min="0"
                        max="10"
                        placeholder="0"
                        value={newbornSilverman}
                        onChange={(e) => setNewbornSilverman(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-1/2 px-2 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md font-mono text-center"
                        title="Silverman-Andersen"
                      />
                    </div>
                  </div>

                  {/* Diagnóstico del Recién Nacido (si lo amerita o no) */}
                  <div className="sm:col-span-12 space-y-1 pt-1 border-t border-rose-100">
                    <label className="block text-[10px] font-bold text-slate-700">
                      Diagnóstico del Recién Nacido (si lo amerita o no)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. RNAT / AEG / Sano en alojamiento conjunto en seno materno exclusivo"
                      value={newbornDiagnosis}
                      onChange={(e) => setNewbornDiagnosis(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
                    />

                    {/* Chips rápidos de diagnóstico RN */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <span className="text-[9px] text-slate-400 self-center">Sugerencias:</span>
                      {COMMON_NEWBORN_DIAGNOSES.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setNewbornDiagnosis(d)}
                          className="text-[9px] px-1.5 py-0.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-900 rounded border border-slate-200 cursor-pointer"
                        >
                          {d.split(' (')[0].slice(0, 36)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alimentación del RN */}
                  <div className="sm:col-span-7">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Alimentación del Recién Nacido
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Seno materno exclusivo a libre demanda"
                      value={newbornDiet}
                      onChange={(e) => setNewbornDiet(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md"
                    />
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {COMMON_NEWBORN_DIETS.map((nd) => (
                        <button
                          key={nd}
                          type="button"
                          onClick={() => setNewbornDiet(nd)}
                          className="text-[9px] px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                        >
                          {nd.split(' (')[0].slice(0, 28)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vacunas, Tamiz y Observaciones del RN */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Vacunas, Tamiz y Observaciones del RN
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Vacunas BCG y Hepatitis B aplicadas. Tamiz metabólico pendiente."
                      value={newbornNotes}
                      onChange={(e) => setNewbornNotes(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer Controls */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {initialData ? 'Guardar Cambios' : 'Crear Nota Rápida'}
          </button>
        </div>
      </div>
    </div>
  );
};
