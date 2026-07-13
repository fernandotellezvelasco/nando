/* data.js — static program data: the 4 rotating monthly phases */

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const DAY_LABELS_SHORT = {
  monday: 'L', tuesday: 'M', wednesday: 'X', thursday: 'J', friday: 'V', saturday: 'S', sunday: 'D',
};

const TRAINING_DAYS = ['monday', 'tuesday', 'thursday', 'friday'];

// Helper to build an exercise entry
function ex(name, sets, reps, rpe, opts = {}) {
  return { name, sets, reps, rpe, technique: opts.technique || null, rest: opts.rest || 90, note: opts.note || null };
}

const ROUTINES = {
  1: {
    id: 1,
    name: 'Fase 1 — Hipertrofia Base',
    tagline: 'Volumen alto en biseries, técnica controlada',
    repRange: '8–15',
    rpeRange: '7–8',
    accent: 'cyan',
    techniques: ['Biseries'],
    days: {
      monday: {
        title: 'Lower A — Pierna Completa',
        focus: 'Cuádriceps, isquios, glúteos, gemelos',
        blocks: [
          [ex('Sentadilla trasera', 4, '8-10', '8'), ex('Extensión de cuádriceps', 4, '12-15', '8')],
          [ex('Peso muerto rumano', 4, '8-10', '8'), ex('Curl femoral tumbado', 4, '12-15', '8')],
          [ex('Zancada búlgara', 3, '10-12/pierna', '7')],
          [ex('Elevación de talones de pie', 4, '15-20', '8')],
        ],
      },
      tuesday: {
        title: 'Upper A — Empuje',
        focus: 'Pecho, hombro anterior, tríceps',
        blocks: [
          [ex('Press banca plano con barra', 4, '8-10', '8'), ex('Aperturas en polea', 4, '12-15', '8')],
          [ex('Press militar con mancuernas', 4, '8-10', '8'), ex('Elevaciones laterales', 4, '15-20', '8')],
          [ex('Press francés con barra Z', 3, '10-12', '8')],
          [ex('Extensión de tríceps en polea', 3, '12-15', '8')],
        ],
      },
      thursday: {
        title: 'Lower B — Pierna Complementaria + Core',
        focus: 'Glúteos, isquios, cuádriceps, core',
        blocks: [
          [ex('Prensa de piernas', 4, '12-15', '8'), ex('Hip thrust con barra', 4, '10-12', '8')],
          [ex('Sentadilla búlgara con mancuernas', 3, '10-12/pierna', '7')],
          [ex('Curl femoral sentado', 3, '12-15', '8')],
          [ex('Plancha con peso', 3, '45s', '7'), ex('Elevación de piernas colgado', 3, '12-15', '8')],
        ],
      },
      friday: {
        title: 'Upper B — Tracción',
        focus: 'Espalda, hombro posterior, bíceps',
        blocks: [
          [ex('Dominadas lastradas', 4, '6-8', '8'), ex('Remo con barra', 4, '8-10', '8')],
          [ex('Jalón al pecho agarre neutro', 4, '10-12', '8'), ex('Face pull', 4, '15-20', '7')],
          [ex('Curl con barra Z', 3, '10-12', '8')],
          [ex('Curl martillo', 3, '12-15', '8')],
        ],
      },
    },
  },

  2: {
    id: 2,
    name: 'Fase 2 — Fuerza-Hipertrofia',
    tagline: 'Menor volumen, mayor intensidad, rest-pause en compuestos',
    repRange: '4–8',
    rpeRange: '8–9',
    accent: 'violet',
    techniques: ['Rest-pause'],
    days: {
      monday: {
        title: 'Lower A — Fuerza de Pierna',
        focus: 'Cuádriceps, isquios, glúteos',
        blocks: [
          [ex('Sentadilla trasera', 5, '5', '9', { technique: 'Rest-pause en la última serie' })],
          [ex('Peso muerto convencional', 4, '5', '9')],
          [ex('Prensa de piernas', 3, '8', '8')],
          [ex('Curl femoral tumbado', 3, '8', '8', { technique: 'Rest-pause en la última serie' })],
          [ex('Elevación de talones sentado', 4, '10', '8')],
        ],
      },
      tuesday: {
        title: 'Upper A — Fuerza de Empuje',
        focus: 'Pecho, hombro, tríceps',
        blocks: [
          [ex('Press banca plano con barra', 5, '5', '9', { technique: 'Rest-pause en la última serie' })],
          [ex('Press inclinado con mancuernas', 3, '6-8', '8')],
          [ex('Fondos en paralelas lastrados', 3, '6-8', '8')],
          [ex('Elevaciones laterales en polea', 3, '12', '8')],
          [ex('Press francés con barra Z', 3, '8', '8', { technique: 'Rest-pause en la última serie' })],
        ],
      },
      thursday: {
        title: 'Lower B — Glúteo y Core',
        focus: 'Glúteos, isquios, core',
        blocks: [
          [ex('Hip thrust con barra', 4, '6-8', '9')],
          [ex('Zancadas caminando con mancuernas', 3, '8/pierna', '8')],
          [ex('Extensión de cuádriceps', 3, '10', '8', { technique: 'Rest-pause en la última serie' })],
          [ex('Rueda abdominal', 3, '10', '8')],
        ],
      },
      friday: {
        title: 'Upper B — Fuerza de Tracción',
        focus: 'Espalda, hombro posterior, bíceps',
        blocks: [
          [ex('Dominadas lastradas', 5, '5', '9')],
          [ex('Remo con mancuerna a una mano', 4, '6-8', '8')],
          [ex('Jalón al pecho agarre supino', 3, '8', '8')],
          [ex('Curl con barra recta', 3, '8', '8', { technique: 'Rest-pause en la última serie' })],
          [ex('Face pull', 3, '15', '7')],
        ],
      },
    },
  },

  3: {
    id: 3,
    name: 'Fase 3 — Metabólico',
    tagline: 'Superseries, alta densidad, descansos cortos, tempo controlado',
    repRange: '12–20',
    rpeRange: '7–8',
    accent: 'cyan',
    techniques: ['Superseries', 'Tempo controlado'],
    days: {
      monday: {
        title: 'Lower A — Circuito Metabólico',
        focus: 'Cuádriceps, glúteos, potencia',
        blocks: [
          [ex('Sentadilla goblet', 4, '15', '8'), ex('Salto al cajón', 4, '8', '7')],
          [ex('Zancada caminando', 3, '20 pasos', '7')],
          [ex('Puente de glúteo a una pierna', 3, '15/pierna', '7')],
          [ex('Elevación de talones', 4, '20', '8')],
        ],
      },
      tuesday: {
        title: 'Upper A — Empuje Metabólico',
        focus: 'Pecho, hombro, tríceps',
        blocks: [
          [ex('Press banca con mancuernas', 4, '15', '8', { technique: 'Tempo 3-1-1' }), ex('Flexiones con déficit', 4, 'al fallo', '8')],
          [ex('Press Arnold', 3, '15', '8')],
          [ex('Fondos en banco', 3, '15', '8')],
          [ex('Extensión de tríceps con cuerda', 3, '20', '8')],
        ],
      },
      thursday: {
        title: 'Lower B — Glúteo y Core Metabólico',
        focus: 'Glúteos, isquios, core',
        blocks: [
          [ex('Sentadilla sumo con mancuerna', 4, '15', '8'), ex('Puente de glúteo con barra', 4, '15', '8')],
          [ex('Curl femoral sentado', 3, '15', '8')],
          [ex('Plancha lateral', 3, '30s/lado', '7')],
          [ex('Elevación de rodillas colgado', 3, '15', '8')],
        ],
      },
      friday: {
        title: 'Upper B — Tracción Metabólica',
        focus: 'Espalda, bíceps',
        blocks: [
          [ex('Remo en máquina', 4, '15', '8'), ex('Jalón al pecho', 4, '15', '8')],
          [ex('Curl con mancuernas alterno', 3, '15', '8')],
          [ex('Face pull', 3, '20', '7')],
          [ex('Curl inverso con barra', 3, '15', '8')],
        ],
      },
    },
  },

  4: {
    id: 4,
    name: 'Fase 4 — Pico de Intensidad',
    tagline: 'Drop sets y myo-reps sobre base pesada de bajas repeticiones',
    repRange: '6–12 + drop',
    rpeRange: '9–10',
    accent: 'violet',
    techniques: ['Drop sets', 'Myo-reps'],
    days: {
      monday: {
        title: 'Lower A — Pierna Pesada',
        focus: 'Cuádriceps, isquios',
        blocks: [
          [ex('Sentadilla trasera', 4, '6', '9', { technique: 'Drop set en la última serie' })],
          [ex('Peso muerto rumano', 3, '8', '9', { technique: 'Myo-reps' })],
          [ex('Prensa de piernas', 3, '10', '9', { technique: 'Drop set triple' })],
          [ex('Extensión de cuádriceps', 3, '12', '9', { technique: 'Drop set' })],
        ],
      },
      tuesday: {
        title: 'Upper A — Empuje Pesado',
        focus: 'Pecho, hombro, tríceps',
        blocks: [
          [ex('Press banca plano con barra', 4, '6', '9', { technique: 'Drop set en la última serie' })],
          [ex('Press militar con barra', 3, '8', '9')],
          [ex('Aperturas con mancuernas', 3, '12', '9', { technique: 'Drop set' })],
          [ex('Press francés', 3, '10', '9', { technique: 'Drop set' })],
        ],
      },
      thursday: {
        title: 'Lower B — Glúteo Pesado',
        focus: 'Glúteos, isquios, core',
        blocks: [
          [ex('Hip thrust con barra', 4, '8', '9', { technique: 'Drop set' })],
          [ex('Sentadilla búlgara', 3, '8/pierna', '9')],
          [ex('Curl femoral', 3, '12', '9', { technique: 'Drop set triple' })],
          [ex('Plancha con sobrecarga', 3, '40s', '8')],
        ],
      },
      friday: {
        title: 'Upper B — Tracción Pesada',
        focus: 'Espalda, bíceps',
        blocks: [
          [ex('Dominadas lastradas', 4, '6', '9', { technique: 'Rest-pause' })],
          [ex('Remo con barra', 4, '8', '9')],
          [ex('Curl con barra', 3, '10', '9', { technique: 'Drop set' })],
          [ex('Face pull', 3, '15', '8', { technique: 'Myo-reps' })],
        ],
      },
    },
  },
};

const PHASE_ACCENTS = {
  cyan: { main: '#22d3ee', soft: 'rgba(34,211,238,0.14)' },
  violet: { main: '#a78bfa', soft: 'rgba(167,139,250,0.14)' },
};

// Maps each exercise name to a minimalist movement-pattern pictogram (icons/exercises/*.png)
const EXERCISE_ICONS = {
  'Sentadilla trasera': 'squat',
  'Sentadilla goblet': 'squat',
  'Sentadilla sumo con mancuerna': 'squat',
  'Peso muerto rumano': 'hinge',
  'Peso muerto convencional': 'hinge',
  'Zancada búlgara': 'lunge',
  'Zancada caminando': 'lunge',
  'Zancadas caminando con mancuernas': 'lunge',
  'Sentadilla búlgara con mancuernas': 'lunge',
  'Sentadilla búlgara': 'lunge',
  'Hip thrust con barra': 'hipthrust',
  'Puente de glúteo a una pierna': 'hipthrust',
  'Puente de glúteo con barra': 'hipthrust',
  'Prensa de piernas': 'legmachine',
  'Extensión de cuádriceps': 'legmachine',
  'Curl femoral tumbado': 'legmachine',
  'Curl femoral sentado': 'legmachine',
  'Curl femoral': 'legmachine',
  'Elevación de talones de pie': 'calf',
  'Elevación de talones sentado': 'calf',
  'Elevación de talones': 'calf',
  'Salto al cajón': 'jump',
  'Press banca plano con barra': 'pushhoriz',
  'Press banca con mancuernas': 'pushhoriz',
  'Press inclinado con mancuernas': 'pushhoriz',
  'Aperturas en polea': 'pushhoriz',
  'Aperturas con mancuernas': 'pushhoriz',
  'Flexiones con déficit': 'pushhoriz',
  'Fondos en paralelas lastrados': 'pushhoriz',
  'Fondos en banco': 'pushhoriz',
  'Press militar con mancuernas': 'pushvert',
  'Press militar con barra': 'pushvert',
  'Press Arnold': 'pushvert',
  'Elevaciones laterales': 'pushvert',
  'Elevaciones laterales en polea': 'pushvert',
  'Remo con barra': 'pullhoriz',
  'Remo con mancuerna a una mano': 'pullhoriz',
  'Remo en máquina': 'pullhoriz',
  'Face pull': 'pullhoriz',
  'Dominadas lastradas': 'pullvert',
  'Jalón al pecho agarre neutro': 'pullvert',
  'Jalón al pecho agarre supino': 'pullvert',
  'Jalón al pecho': 'pullvert',
  'Curl con barra Z': 'curl',
  'Curl martillo': 'curl',
  'Curl con barra recta': 'curl',
  'Curl con mancuernas alterno': 'curl',
  'Curl inverso con barra': 'curl',
  'Curl con barra': 'curl',
  'Press francés con barra Z': 'triceps',
  'Press francés': 'triceps',
  'Extensión de tríceps en polea': 'triceps',
  'Extensión de tríceps con cuerda': 'triceps',
  'Plancha con peso': 'core',
  'Plancha lateral': 'core',
  'Plancha con sobrecarga': 'core',
  'Elevación de piernas colgado': 'core',
  'Rueda abdominal': 'core',
  'Elevación de rodillas colgado': 'core',
};

function getExerciseIcon(name) {
  return EXERCISE_ICONS[name] || null;
}

// Which body-map zones light up for each phase/day combo (see js/bodymap.js for zone keys)
const DAY_MUSCLES = {
  '1-monday': ['quads', 'hamstrings', 'glutes', 'calves'],
  '1-tuesday': ['chest', 'shoulders', 'triceps'],
  '1-thursday': ['quads', 'hamstrings', 'glutes', 'abs'],
  '1-friday': ['upperBack', 'lats', 'rearDelts', 'biceps'],

  '2-monday': ['quads', 'hamstrings', 'glutes', 'calves'],
  '2-tuesday': ['chest', 'shoulders', 'triceps'],
  '2-thursday': ['glutes', 'hamstrings', 'abs'],
  '2-friday': ['upperBack', 'lats', 'rearDelts', 'biceps'],

  '3-monday': ['quads', 'glutes', 'calves'],
  '3-tuesday': ['chest', 'shoulders', 'triceps'],
  '3-thursday': ['glutes', 'hamstrings', 'abs'],
  '3-friday': ['upperBack', 'lats', 'biceps'],

  '4-monday': ['quads', 'hamstrings', 'calves'],
  '4-tuesday': ['chest', 'shoulders', 'triceps'],
  '4-thursday': ['glutes', 'hamstrings', 'abs'],
  '4-friday': ['upperBack', 'lats', 'rearDelts', 'biceps'],
};

function getDayMuscles(phaseId, dayKey) {
  return DAY_MUSCLES[`${phaseId}-${dayKey}`] || [];
}
