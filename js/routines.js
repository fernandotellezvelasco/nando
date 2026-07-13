/* routines.js — phase rotation, scheduling, and progression logic */

const Routines = (() => {
  function phaseNumberForDate(date) {
    return (date.getMonth() % 4) + 1;
  }

  function getCurrentPhase(date = new Date()) {
    return ROUTINES[phaseNumberForDate(date)];
  }

  function getPhaseMonthLabel(date = new Date()) {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  function dayKeyForDate(date) {
    // JS getDay(): 0=Sunday..6=Saturday -> convert to our monday-first index
    return DAYS[(date.getDay() + 6) % 7];
  }

  function isTrainingDay(dayKey) {
    return TRAINING_DAYS.includes(dayKey);
  }

  function getWorkoutForDate(date, phase = getCurrentPhase(date)) {
    const dayKey = dayKeyForDate(date);
    if (!isTrainingDay(dayKey)) return null;
    return { dayKey, ...phase.days[dayKey] };
  }

  function getTodayWorkout() {
    return getWorkoutForDate(new Date());
  }

  // Builds a 7-day plan for the current week (Mon-Sun) with training/rest flags
  function getWeekPlan(date = new Date()) {
    const phase = getCurrentPhase(date);
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

    return DAYS.map((dayKey, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const training = isTrainingDay(dayKey);
      return {
        dayKey,
        date: d,
        label: DAY_LABELS[dayKey],
        isToday: d.toDateString() === new Date().toDateString(),
        isTraining: training,
        title: training ? phase.days[dayKey].title : (dayKey === 'wednesday' ? 'Descanso' : 'Descanso / Fútbol'),
      };
    });
  }

  // Finds the next upcoming (or today's) scheduled training session
  function getNextSession(sessions = Storage.getSessions()) {
    const now = new Date();
    const loggedToday = sessions.some((s) => s.date === Storage.todayISO());

    for (let offset = loggedToday ? 1 : 0; offset < 8; offset += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      const dayKey = dayKeyForDate(d);
      if (isTrainingDay(dayKey)) {
        const phase = getCurrentPhase(d);
        return {
          date: d,
          dayKey,
          title: phase.days[dayKey].title,
          daysUntil: offset,
          isToday: offset === 0,
        };
      }
    }
    return null;
  }

  // Simple progression suggestion based on the most recent logged instance of an exercise
  function getProgressionSuggestion(exerciseName, sessions = Storage.getSessions()) {
    const instances = [];
    sessions.forEach((s) => {
      s.exercises.forEach((e) => {
        if (e.name === exerciseName && e.sets.length) instances.push({ date: s.date, exercise: e });
      });
    });
    if (!instances.length) return null;
    instances.sort((a, b) => new Date(b.date) - new Date(a.date));
    const last = instances[0].exercise;
    const validSets = last.sets.filter((s) => s.weight > 0 && s.reps > 0);
    if (!validSets.length) return null;

    const avgRpe = validSets.reduce((sum, s) => sum + (Number(s.rpe) || 8), 0) / validSets.length;
    const topWeight = Math.max(...validSets.map((s) => Number(s.weight)));

    if (avgRpe <= 6.5) {
      return { level: 'up', message: `Sube ${Math.round(topWeight * 0.05 * 2) / 2 || 2.5} kg — el RPE medio (${avgRpe.toFixed(1)}) fue bajo` };
    }
    if (avgRpe <= 8) {
      return { level: 'up-small', message: `Sube ${Math.round(topWeight * 0.025 * 2) / 2 || 1.25} kg o añade 1 rep por serie` };
    }
    if (avgRpe <= 9) {
      return { level: 'hold', message: 'Mantén el peso, la intensidad ya es alta' };
    }
    return { level: 'down', message: 'Considera bajar carga o volumen la próxima sesión (RPE muy alto)' };
  }

  return {
    phaseNumberForDate,
    getCurrentPhase,
    getPhaseMonthLabel,
    dayKeyForDate,
    isTrainingDay,
    getWorkoutForDate,
    getTodayWorkout,
    getWeekPlan,
    getNextSession,
    getProgressionSuggestion,
  };
})();
