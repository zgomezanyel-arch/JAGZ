import React from 'react';
import { ResidentLogNote } from '../types/patient';
import { ResidentNotesSection } from './ResidentNotesSection';

interface ResidentNotesViewProps {
  notes: ResidentLogNote[];
  onAddNote: (note: ResidentLogNote) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const ResidentNotesView: React.FC<ResidentNotesViewProps> = ({
  notes,
  onAddNote,
  onToggleNote,
  onDeleteNote,
}) => {
  return (
    <div className="space-y-4">
      <ResidentNotesSection
        notes={notes}
        onAddNote={onAddNote}
        onToggleNote={onToggleNote}
        onDeleteNote={onDeleteNote}
        titleCustom="Bitácora Interna de Residencia Médica (Sin Pacientes / Guardia General)"
        defaultExpanded={true}
      />
    </div>
  );
};
