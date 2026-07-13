/* seed.js — generates 2 weeks of plausible prior history on first run */

const Seed = (() => {
  function iso(d) { return d.toISOString().slice(0, 10); }

  function buildSession(date, dayKey, phase, dayIndex) {
    const template = phase.days[dayKey];
    const progressFactor = dayIndex / 14; // 0 -> 1 over the two seeded weeks

    const exercises = template.blocks.flat().map((exTemplate) => {
      const baseWeight = baseWeightFor(exTemplate.name);
      const setsCount = exTemplate.sets;
      const sets = [];
      for (let i = 0; i < setsCount; i += 1) {
        const fatigue = i * 1.5; // weight drops slightly across sets
        const weight = baseWeight > 0
          ? Math.max(0, Math.round((baseWeight + progressFactor * baseWeight * 0.04 - fatigue) / 1.25) * 1.25)
          : 0;
        const reps = repsFromRange(exTemplate.reps);
        const rpe = 7 + Math.round((i / Math.max(setsCount - 1, 1)) * 1.5 * 10) / 10;
        sets.push({ reps, weight, rpe: Math.min(9, Number(rpe.toFixed(1))) });
      }
      return { name: exTemplate.name, sets };
    });

    const totalVolume = exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0
    );
    const avgRpe = (
      exercises.reduce((sum, e) => sum + e.sets.reduce((s, set) => s + set.rpe, 0), 0)
      / exercises.reduce((sum, e) => sum + e.sets.length, 0)
    );

    return {
      id: `seed-${iso(date)}`,
      date: iso(date),
      dayKey,
      title: template.title,
      phaseId: phase.id,
      exercises,
      totalVolume: Math.round(totalVolume),
      avgRpe: Number(avgRpe.toFixed(1)),
      durationMin: 55 + Math.round(Math.random() * 10),
      notes: '',
    };
  }

  function baseWeightFor(name) {
    const table = {
      'Sentadilla trasera': 100,
      'Extensión de cuádriceps': 55,
      'Peso muerto rumano': 90,
      'Curl femoral tumbado': 40,
      'Zancada búlgara': 24,
      'Elevación de talones de pie': 80,
      'Press banca plano con barra': 85,
      'Aperturas en polea': 20,
      'Press militar con mancuernas': 26,
      'Elevaciones laterales': 10,
      'Press francés con barra Z': 30,
      'Extensión de tríceps en polea': 25,
      'Prensa de piernas': 180,
      'Hip thrust con barra': 120,
      'Sentadilla búlgara con mancuernas': 22,
      'Curl femoral sentado': 45,
      'Plancha con peso': 0,
      'Elevación de piernas colgado': 0,
      'Dominadas lastradas': 15,
      'Remo con barra': 75,
      'Jalón al pecho agarre neutro': 60,
      'Face pull': 22,
      'Curl con barra Z': 30,
      'Curl martillo': 14,
    };
    return table[name] ?? 20;
  }

  function repsFromRange(rangeStr) {
    const match = String(rangeStr).match(/(\d+)(?:-(\d+))?/);
    if (!match) return 10;
    const lo = Number(match[1]);
    const hi = match[2] ? Number(match[2]) : lo;
    return Math.round((lo + hi) / 2);
  }

  function run() {
    const meta = Storage.getMeta();
    if (meta.seeded) return;

    const today = new Date();
    const sessions = [];
    const weightLog = [];
    let startWeight = 90.6;

    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayKey = Routines.dayKeyForDate(d);
      const phase = Routines.getCurrentPhase(d);
      const dayIndex = 13 - i;

      if (TRAINING_DAYS.includes(dayKey)) {
        sessions.push(buildSession(d, dayKey, phase, dayIndex));
      }

      if (dayIndex % 3 === 0) {
        const drift = (Math.random() - 0.55) * 0.3;
        startWeight = Math.round((startWeight + drift - 0.02) * 10) / 10;
        weightLog.push({ date: iso(d), weight: startWeight });
      }
    }

    Storage.saveSessions(sessions);
    Storage.saveWeightLog(weightLog);
    Storage.saveMeta({ ...meta, seeded: true });
  }

  return { run };
})();
