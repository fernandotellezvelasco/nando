/* Storage.js — namespaced localStorage wrapper */
const Storage = (() => {
  const PREFIX = 'nfit_';
  const KEYS = {
    profile: PREFIX + 'profile',
    sessions: PREFIX + 'sessions',
    weightLog: PREFIX + 'weightlog',
    achievements: PREFIX + 'achievements',
    settings: PREFIX + 'settings',
    meta: PREFIX + 'meta',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage read error', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write error', key, e);
    }
  }

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const defaultProfile = () => ({
    name: '',
    height: 185,
    weight: 90,
    age: 28,
    sex: 'male',
    activityLevel: 1.725,
    goalType: 'maintenance',
    startDate: todayISO(),
    onboardingComplete: false,
  });

  const defaultSettings = () => ({
    notificationsEnabled: false,
    reminderHour: 18,
  });

  const defaultMeta = () => ({
    seeded: false,
    lastPhaseSeen: null,
  });

  return {
    KEYS,

    getProfile() { return read(KEYS.profile, defaultProfile()); },
    saveProfile(p) { write(KEYS.profile, p); },

    getSessions() { return read(KEYS.sessions, []); },
    saveSessions(arr) { write(KEYS.sessions, arr); },
    addSession(s) {
      const sessions = this.getSessions();
      sessions.push(s);
      sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
      this.saveSessions(sessions);
      return sessions;
    },
    deleteSession(id) {
      const sessions = this.getSessions().filter((s) => s.id !== id);
      this.saveSessions(sessions);
      return sessions;
    },

    getWeightLog() { return read(KEYS.weightLog, []); },
    saveWeightLog(arr) { write(KEYS.weightLog, arr); },
    addWeightEntry(entry) {
      const log = this.getWeightLog();
      log.push(entry);
      log.sort((a, b) => new Date(a.date) - new Date(b.date));
      this.saveWeightLog(log);
      return log;
    },

    getAchievements() { return read(KEYS.achievements, []); },
    saveAchievements(arr) { write(KEYS.achievements, arr); },

    getSettings() { return read(KEYS.settings, defaultSettings()); },
    saveSettings(s) { write(KEYS.settings, s); },

    getMeta() { return read(KEYS.meta, defaultMeta()); },
    saveMeta(m) { write(KEYS.meta, m); },

    todayISO,
  };
})();
