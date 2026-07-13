/* achievements.js — milestone definitions and evaluation */

const Achievements = (() => {
  const DEFS = [
    {
      id: 'first_session',
      name: 'Primer paso',
      description: 'Registra tu primera sesión de entrenamiento',
      icon: 'flag',
      check: (s) => s.sessions.length >= 1,
    },
    {
      id: 'streak_5',
      name: 'Racha de 5',
      description: 'Completa 5 sesiones registradas',
      icon: 'zap',
      check: (s) => s.sessions.length >= 5,
    },
    {
      id: 'sessions_10',
      name: 'Doble dígito',
      description: 'Completa 10 sesiones registradas',
      icon: 'activity',
      check: (s) => s.sessions.length >= 10,
    },
    {
      id: 'sessions_25',
      name: 'Constancia real',
      description: 'Completa 25 sesiones registradas',
      icon: 'trending-up',
      check: (s) => s.sessions.length >= 25,
    },
    {
      id: 'sessions_50',
      name: 'Medio centenar',
      description: 'Completa 50 sesiones registradas',
      icon: 'award',
      check: (s) => s.sessions.length >= 50,
    },
    {
      id: 'perfect_week',
      name: 'Semana perfecta',
      description: 'Completa las 4 sesiones planificadas en una misma semana',
      icon: 'check-circle',
      check: (s) => weeklyCounts(s.sessions).some((c) => c >= 4),
    },
    {
      id: 'new_pr',
      name: 'Nuevo PR',
      description: 'Supera tu peso máximo previo en un ejercicio clave',
      icon: 'trending-up',
      check: (s) => s.hasNewPR === true,
    },
    {
      id: 'one_month',
      name: 'Un mes dentro',
      description: 'Lleva 30 días o más usando la app',
      icon: 'calendar',
      check: (s) => daysSince(s.profile.startDate) >= 30,
    },
    {
      id: 'full_rotation',
      name: 'Rotación completa',
      description: 'Lleva 4 meses o más entrenando (ciclo completo de fases)',
      icon: 'refresh-cw',
      check: (s) => daysSince(s.profile.startDate) >= 120,
    },
  ];

  function daysSince(isoDate) {
    if (!isoDate) return 0;
    const start = new Date(isoDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  function weekKey(dateStr) {
    const d = new Date(dateStr);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return monday.toISOString().slice(0, 10);
  }

  function weeklyCounts(sessions) {
    const map = {};
    sessions.forEach((s) => {
      const k = weekKey(s.date);
      map[k] = (map[k] || 0) + 1;
    });
    return Object.values(map);
  }

  function detectNewPR(sessions) {
    // returns true if the most recent session contains a top-weight PR vs all prior sessions
    if (sessions.length < 2) return false;
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const latest = sorted[sorted.length - 1];
    const prior = sorted.slice(0, -1);

    return latest.exercises.some((ex) => {
      const latestMax = Math.max(0, ...ex.sets.map((s) => Number(s.weight) || 0));
      if (latestMax <= 0) return false;
      const priorMax = prior.reduce((max, s) => {
        const found = s.exercises.find((e) => e.name === ex.name);
        if (!found) return max;
        const m = Math.max(0, ...found.sets.map((st) => Number(st.weight) || 0));
        return Math.max(max, m);
      }, 0);
      return latestMax > priorMax;
    });
  }

  function evaluate() {
    const sessions = Storage.getSessions();
    const profile = Storage.getProfile();
    const unlocked = Storage.getAchievements();
    const unlockedIds = new Set(unlocked.map((a) => a.id));
    const state = { sessions, profile, hasNewPR: detectNewPR(sessions) };

    const newlyUnlocked = [];
    DEFS.forEach((def) => {
      if (!unlockedIds.has(def.id) && def.check(state)) {
        const record = { id: def.id, unlockedAt: new Date().toISOString() };
        unlocked.push(record);
        newlyUnlocked.push(def);
      }
    });

    if (newlyUnlocked.length) Storage.saveAchievements(unlocked);
    return { unlocked, newlyUnlocked };
  }

  function getAll() {
    const unlocked = Storage.getAchievements();
    const unlockedMap = new Map(unlocked.map((a) => [a.id, a.unlockedAt]));
    return DEFS.map((def) => ({
      ...def,
      isUnlocked: unlockedMap.has(def.id),
      unlockedAt: unlockedMap.get(def.id) || null,
    }));
  }

  return { DEFS, evaluate, getAll, daysSince };
})();
