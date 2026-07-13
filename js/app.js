/* app.js — main controller: view routing, rendering, forms, notifications */

let currentView = 'dashboard';
let regState = null;
let reminderTimer = null;

/* ---------- helpers ---------- */

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDateShort(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function repsMetaLabel(reps) {
  const str = String(reps);
  return /\d$/.test(str) ? `<b>${str}</b> reps` : `<b>${str}</b>`;
}

function repsAverage(rangeStr) {
  const match = String(rangeStr).match(/(\d+)(?:-(\d+))?/);
  if (!match) return '';
  const lo = Number(match[1]);
  const hi = match[2] ? Number(match[2]) : lo;
  return Math.round((lo + hi) / 2);
}

function refreshIcons() {
  if (window.feather) feather.replace();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 320);
  }, 2800);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/* ---------- view routing ---------- */

function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.dataset.viewName === viewName));
  document.querySelectorAll('.nav-item, .bnav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  renderView(viewName);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderView(viewName) {
  switch (viewName) {
    case 'dashboard': renderDashboard(); break;
    case 'rutina': renderRutina(); break;
    case 'registro': renderRegistro(); break;
    case 'progreso': renderProgreso(); break;
    case 'macros': renderMacros(); break;
    case 'logros': renderLogros(); break;
    case 'historial': renderHistorial(); break;
    case 'ajustes': renderAjustes(); break;
    default: break;
  }
  refreshIcons();
}

/* ---------- dashboard ---------- */

function computeStreak(sessions) {
  const loggedDates = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  const todayKey = Routines.dayKeyForDate(cursor);
  if (!(TRAINING_DAYS.includes(todayKey) && loggedDates.has(Storage.todayISO()))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  for (let i = 0; i < 90; i += 1) {
    const dayKey = Routines.dayKeyForDate(cursor);
    if (TRAINING_DAYS.includes(dayKey)) {
      const iso = cursor.toISOString().slice(0, 10);
      if (loggedDates.has(iso)) {
        streak += 1;
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function weekRangeContaining(date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return [monday, sunday];
}

function sessionsThisWeek(sessions) {
  const [monday, sunday] = weekRangeContaining(new Date());
  return sessions.filter((s) => {
    const d = new Date(`${s.date}T12:00:00`);
    return d >= monday && d <= sunday;
  });
}

function renderDashboard() {
  const profile = Storage.getProfile();
  const sessions = Storage.getSessions();
  const phase = Routines.getCurrentPhase();

  document.getElementById('dash-greeting').textContent = `Hola, ${profile.name || 'atleta'}`;
  document.getElementById('dash-date').textContent = capitalize(new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));

  // reminder banner
  const todayWorkout = Routines.getTodayWorkout();
  const loggedToday = sessions.some((s) => s.date === Storage.todayISO());
  const banner = document.getElementById('dash-reminder-banner');
  if (todayWorkout && !loggedToday) {
    banner.classList.remove('hidden');
    banner.innerHTML = `
      <span class="banner-icon"><i data-feather="bell"></i></span>
      <p>Hoy toca <strong>${escapeHtml(todayWorkout.title)}</strong> — aún no has registrado esta sesión.</p>`;
  } else {
    banner.classList.add('hidden');
  }

  // stats
  const weekSessions = sessionsThisWeek(sessions);
  const weekVolume = weekSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  const streak = computeStreak(sessions);
  const next = Routines.getNextSession(sessions);

  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon cyan"><i data-feather="check-circle"></i></div>
      <div class="stat-value">${weekSessions.length}/4</div>
      <div class="stat-label">Sesiones esta semana</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon success"><i data-feather="zap"></i></div>
      <div class="stat-value">${streak}</div>
      <div class="stat-label">Racha de sesiones</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon violet"><i data-feather="bar-chart-2"></i></div>
      <div class="stat-value">${Math.round(weekVolume).toLocaleString('es-ES')}</div>
      <div class="stat-label">Volumen semanal (kg)</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon warning"><i data-feather="calendar"></i></div>
      <div class="stat-value">${next ? (next.isToday ? 'Hoy' : `${next.daysUntil}d`) : '—'}</div>
      <div class="stat-label">${next ? escapeHtml(next.title) : 'Próxima sesión'}</div>
    </div>`;

  // today card
  const todayCard = document.getElementById('dash-today-card');
  if (todayWorkout) {
    const preview = todayWorkout.blocks.flat().slice(0, 3);
    todayCard.innerHTML = `
      <div class="today-card-head">
        <span class="today-badge training">Entrenamiento</span>
        ${loggedToday ? '<span class="today-badge training" style="background:var(--success-soft);color:var(--success)">Registrada</span>' : ''}
      </div>
      <div class="today-title">${escapeHtml(todayWorkout.title)}</div>
      <p class="today-focus">${escapeHtml(todayWorkout.focus)} · ${escapeHtml(phase.name)}</p>
      <div class="today-exercise-preview">
        ${preview.map((exo) => `
          <div class="today-exercise-row">
            <span>${escapeHtml(exo.name)}</span>
            <span>${exo.sets}x${exo.reps} · RPE ${exo.rpe}</span>
          </div>`).join('')}
      </div>
      <div class="reg-actions" style="margin-top:16px">
        <button class="btn btn-primary" onclick="goToRegistroToday()"><i data-feather="edit-3"></i> Ir a registrar</button>
        <button class="btn btn-ghost" onclick="switchView('rutina')"><i data-feather="activity"></i> Ver rutina completa</button>
      </div>`;
  } else {
    const dayKey = Routines.dayKeyForDate(new Date());
    const isWednesday = dayKey === 'wednesday';
    todayCard.innerHTML = `
      <div class="today-card-head"><span class="today-badge rest">Descanso</span></div>
      <div class="today-title">${isWednesday ? 'Día de recuperación' : 'Fin de semana libre'}</div>
      <p class="today-focus">${isWednesday ? 'Aprovecha para descansar, dormir bien y llegar fresco a Upper B.' : 'Disfruta el fútbol — la próxima sesión te espera el lunes.'}</p>`;
  }

  // week strip
  const weekPlan = Routines.getWeekPlan();
  const loggedDates = new Set(sessions.map((s) => s.date));
  document.getElementById('dash-week-strip').innerHTML = weekPlan.map((day) => {
    const iso = day.date.toISOString().slice(0, 10);
    const classes = ['week-chip'];
    if (day.isTraining) classes.push('training');
    else classes.push('rest');
    if (day.isToday) classes.push('today');
    if (loggedDates.has(iso)) classes.push('logged');
    return `
      <div class="${classes.join(' ')}">
        <div class="week-chip-day">${DAY_LABELS_SHORT[day.dayKey]}</div>
        <div class="week-chip-dot"></div>
        <div class="week-chip-label">${escapeHtml(day.title.split(' — ')[0])}</div>
      </div>`;
  }).join('');

  // achievements strip
  const { newlyUnlocked } = Achievements.evaluate();
  if (newlyUnlocked.length) showAchievementUnlocked(newlyUnlocked);
  const unlocked = Achievements.getAll().filter((a) => a.isUnlocked).sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
  const achvStrip = document.getElementById('dash-achv-strip');
  if (unlocked.length) {
    achvStrip.innerHTML = unlocked.slice(0, 5).map(achvCardHtml).join('');
  } else {
    achvStrip.innerHTML = `<div class="empty-state" style="width:100%"><i data-feather="award"></i><p>Todavía no has desbloqueado logros. ¡Registra tu primera sesión!</p></div>`;
  }

  updateSidebarProfile();
}

function goToRegistroToday() {
  regState = null;
  switchView('registro');
}

/* ---------- rutina ---------- */

let rutinaActiveDay = null;

function renderRutina() {
  const phase = Routines.getCurrentPhase();
  const todayKey = Routines.dayKeyForDate(new Date());
  if (!rutinaActiveDay || !TRAINING_DAYS.includes(rutinaActiveDay)) {
    rutinaActiveDay = TRAINING_DAYS.includes(todayKey) ? todayKey : 'monday';
  }

  document.getElementById('rutina-phase-card').innerHTML = `
    <div class="phase-name">${escapeHtml(phase.name)}</div>
    <p class="phase-tagline">${escapeHtml(phase.tagline)}</p>
    <div class="phase-meta">
      <span class="phase-badge">${capitalize(Routines.getPhaseMonthLabel())}</span>
      <span class="phase-badge">Reps ${phase.repRange}</span>
      <span class="phase-badge">RPE ${phase.rpeRange}</span>
      ${phase.techniques.map((t) => `<span class="phase-badge">${escapeHtml(t)}</span>`).join('')}
    </div>`;

  document.getElementById('rutina-day-tabs').innerHTML = TRAINING_DAYS.map((dayKey) => `
    <button class="tab-btn ${dayKey === rutinaActiveDay ? 'active' : ''}" data-day="${dayKey}">
      ${DAY_LABELS[dayKey]}
    </button>`).join('');

  document.querySelectorAll('#rutina-day-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      rutinaActiveDay = btn.dataset.day;
      renderRutina();
    });
  });

  renderDayContent(phase, rutinaActiveDay);
  refreshIcons();
}

function supersetLabel(phase) {
  if (phase.techniques.includes('Biseries')) return 'BISERIE';
  if (phase.techniques.includes('Superseries')) return 'SUPERSERIE';
  return 'PAREJA';
}

function progressionTagHtml(exerciseName) {
  const suggestion = Routines.getProgressionSuggestion(exerciseName);
  if (!suggestion) return '';
  const iconMap = { up: 'trending-up', 'up-small': 'arrow-up-right', hold: 'minus', down: 'trending-down' };
  const cls = suggestion.level === 'down' ? 'down' : suggestion.level === 'hold' ? 'hold' : '';
  return `<div class="progression-tag ${cls}"><i data-feather="${iconMap[suggestion.level]}"></i><span>${escapeHtml(suggestion.message)}</span></div>`;
}

function renderDayContent(phase, dayKey) {
  const day = phase.days[dayKey];
  const container = document.getElementById('rutina-day-content');
  const label = supersetLabel(phase);

  container.innerHTML = `
    <div class="card">
      <h3>${escapeHtml(day.title)}</h3>
      <p style="margin-bottom:16px">${escapeHtml(day.focus)}</p>
      ${day.blocks.map((block) => `
        <div class="day-block">
          ${block.length === 2 ? `<div class="block-label">${label}</div>` : ''}
          ${block.map((exo, i) => `
            ${i === 1 ? `<div class="superset-connector">+</div>` : ''}
            <div class="exercise-card">
              <div class="exercise-card-head">
                <span class="exercise-name">${escapeHtml(exo.name)}</span>
              </div>
              <div class="exercise-meta">
                <span><b>${exo.sets}</b> series</span>
                <span>${repsMetaLabel(escapeHtml(exo.reps))}</span>
                <span>RPE <b>${exo.rpe}</b></span>
              </div>
              ${exo.technique ? `<span class="technique-tag">${escapeHtml(exo.technique)}</span>` : ''}
              ${progressionTagHtml(exo.name)}
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
  refreshIcons();
}

/* ---------- registro ---------- */

function initRegState() {
  const todayKey = Routines.dayKeyForDate(new Date());
  const templateKey = TRAINING_DAYS.includes(todayKey) ? todayKey : 'monday';
  regState = {
    date: Storage.todayISO(),
    templateKey,
    exercises: buildExercisesFromTemplate(templateKey),
  };
}

function buildExercisesFromTemplate(templateKey) {
  if (templateKey === 'free') return [];
  const phase = Routines.getCurrentPhase();
  const day = phase.days[templateKey];
  return day.blocks.flat().map((exo) => ({
    name: exo.name,
    sets: Array.from({ length: exo.sets }, () => ({ reps: repsAverage(exo.reps), weight: '', rpe: exo.rpe })),
  }));
}

function populateTemplateSelect() {
  const select = document.getElementById('reg-template');
  const phase = Routines.getCurrentPhase();
  select.innerHTML = TRAINING_DAYS.map((dayKey) => `<option value="${dayKey}">${DAY_LABELS[dayKey]} — ${escapeHtml(phase.days[dayKey].title)}</option>`).join('')
    + '<option value="free">Sesión libre</option>';
}

function renderRegistro() {
  populateTemplateSelect();
  if (!regState) initRegState();
  document.getElementById('reg-date').value = regState.date;
  document.getElementById('reg-template').value = regState.templateKey;
  renderRegForm();
}

function renderRegForm() {
  const form = document.getElementById('reg-form');
  if (!regState.exercises.length) {
    form.innerHTML = `<div class="empty-state card"><i data-feather="inbox"></i><p>Añade ejercicios para empezar a registrar esta sesión.</p></div>`;
    refreshIcons();
    return;
  }

  form.innerHTML = regState.exercises.map((exo, ei) => `
    <div class="reg-exercise-card">
      <div class="reg-exercise-head">
        <input type="text" class="reg-exercise-title-input" data-field="name" data-ex="${ei}" value="${escapeHtml(exo.name)}" placeholder="Nombre del ejercicio">
        <button type="button" class="remove-exercise-btn" data-action="remove-exercise" data-ex="${ei}"><i data-feather="trash-2"></i></button>
      </div>
      <div class="set-labels"><span>#</span><span>Reps</span><span>Kg</span><span>RPE</span><span></span></div>
      ${exo.sets.map((set, si) => `
        <div class="set-row">
          <span class="set-row-index">${si + 1}</span>
          <input type="number" data-field="reps" data-ex="${ei}" data-set="${si}" value="${set.reps}" min="0">
          <input type="number" step="0.5" data-field="weight" data-ex="${ei}" data-set="${si}" value="${set.weight}" min="0">
          <input type="number" step="0.5" data-field="rpe" data-ex="${ei}" data-set="${si}" value="${set.rpe}" min="1" max="10">
          <button type="button" class="set-remove-btn" data-action="remove-set" data-ex="${ei}" data-set="${si}"><i data-feather="x"></i></button>
        </div>`).join('')}
      <button type="button" class="add-set-btn" data-action="add-set" data-ex="${ei}">+ Añadir serie</button>
    </div>`).join('');

  refreshIcons();
}

function wireRegistroForm() {
  const form = document.getElementById('reg-form');

  form.addEventListener('input', (e) => {
    const { field, ex: exIdx, set: setIdx } = e.target.dataset;
    if (field === undefined) return;
    const exo = regState.exercises[Number(exIdx)];
    if (!exo) return;
    if (field === 'name') {
      exo.name = e.target.value;
    } else if (setIdx !== undefined) {
      exo.sets[Number(setIdx)][field] = e.target.value;
    }
  });

  form.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, ex: exIdx, set: setIdx } = btn.dataset;
    const exo = regState.exercises[Number(exIdx)];
    if (action === 'remove-exercise') {
      regState.exercises.splice(Number(exIdx), 1);
    } else if (action === 'add-set' && exo) {
      const last = exo.sets[exo.sets.length - 1];
      exo.sets.push({ reps: last ? last.reps : '', weight: last ? last.weight : '', rpe: last ? last.rpe : '' });
    } else if (action === 'remove-set' && exo) {
      exo.sets.splice(Number(setIdx), 1);
      if (!exo.sets.length) regState.exercises.splice(Number(exIdx), 1);
    }
    renderRegForm();
  });

  document.getElementById('reg-template').addEventListener('change', (e) => {
    regState.templateKey = e.target.value;
    regState.exercises = buildExercisesFromTemplate(regState.templateKey);
    renderRegForm();
  });

  document.getElementById('reg-date').addEventListener('change', (e) => {
    regState.date = e.target.value;
  });

  document.getElementById('reg-add-exercise').addEventListener('click', () => {
    if (!regState) initRegState();
    regState.exercises.push({ name: '', sets: [{ reps: '', weight: '', rpe: '' }] });
    renderRegForm();
  });

  document.getElementById('reg-save-btn').addEventListener('click', saveRegistro);
}

function saveRegistro() {
  if (!regState) return;
  const exercises = regState.exercises
    .filter((exo) => exo.name.trim())
    .map((exo) => ({
      name: exo.name.trim(),
      sets: exo.sets
        .map((s) => ({ reps: Number(s.reps) || 0, weight: Number(s.weight) || 0, rpe: Number(s.rpe) || 0 }))
        .filter((s) => s.reps > 0 || s.weight > 0),
    }))
    .filter((exo) => exo.sets.length);

  if (!exercises.length) {
    showToast('Añade al menos un ejercicio con datos válidos', 'error');
    return;
  }

  const totalVolume = exercises.reduce((sum, exo) => sum + exo.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0);
  const rpeValues = exercises.flatMap((exo) => exo.sets.map((s) => s.rpe)).filter(Boolean);
  const avgRpe = rpeValues.length ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : 0;
  const phase = Routines.getCurrentPhase();
  const template = regState.templateKey !== 'free' ? phase.days[regState.templateKey] : null;

  const session = {
    id: `s-${Date.now()}`,
    date: regState.date || Storage.todayISO(),
    dayKey: regState.templateKey !== 'free' ? regState.templateKey : null,
    title: template ? template.title : 'Sesión libre',
    phaseId: phase.id,
    exercises,
    totalVolume: Math.round(totalVolume),
    avgRpe: Number(avgRpe.toFixed(1)),
    durationMin: null,
    notes: '',
  };

  Storage.addSession(session);
  regState = null;
  const { newlyUnlocked } = Achievements.evaluate();
  if (newlyUnlocked.length) {
    showAchievementUnlocked(newlyUnlocked);
  } else {
    showToast('Sesión guardada correctamente');
  }
  renderRegistro();
}

/* ---------- progreso ---------- */

function renderProgreso() {
  const sessions = Storage.getSessions();
  const weightLog = Storage.getWeightLog();

  const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  const rpeValues = sessions.flatMap((s) => s.exercises.flatMap((e) => e.sets.map((st) => st.rpe))).filter(Boolean);
  const avgRpe = rpeValues.length ? (rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length).toFixed(1) : '—';
  const currentWeight = weightLog.length ? weightLog[weightLog.length - 1].weight : Storage.getProfile().weight;

  document.getElementById('progreso-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon cyan"><i data-feather="database"></i></div>
      <div class="stat-value">${sessions.length}</div>
      <div class="stat-label">Sesiones totales</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon violet"><i data-feather="bar-chart-2"></i></div>
      <div class="stat-value">${Math.round(totalVolume / 1000).toLocaleString('es-ES')}t</div>
      <div class="stat-label">Volumen acumulado</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon warning"><i data-feather="activity"></i></div>
      <div class="stat-value">${avgRpe}</div>
      <div class="stat-label">RPE medio</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon success"><i data-feather="user"></i></div>
      <div class="stat-value">${currentWeight}kg</div>
      <div class="stat-label">Peso actual</div>
    </div>`;

  const exerciseNames = Charts.getExerciseNames(sessions);
  const select = document.getElementById('progreso-exercise-select');
  const preferred = exerciseNames.includes('Sentadilla trasera') ? 'Sentadilla trasera' : exerciseNames[0];
  const current = exerciseNames.includes(select.value) ? select.value : preferred;
  select.innerHTML = exerciseNames.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  if (current) select.value = current;

  if (current) Charts.renderLiftChart('chart-lift', current, sessions);
  Charts.renderVolumeChart('chart-volume', sessions);
  Charts.renderConsistencyChart('chart-consistency', sessions);
  Charts.renderBodyweightChart('chart-bodyweight', weightLog);
}

/* ---------- macros ---------- */

function populateStaticSelects() {
  const activityHtml = Macros.ACTIVITY_LEVELS.map((a) => `<option value="${a.value}">${escapeHtml(a.label)}</option>`).join('');
  const goalHtml = Macros.GOAL_TYPES.map((g) => `<option value="${g.value}">${escapeHtml(g.label)}</option>`).join('');
  document.getElementById('ob-activity').innerHTML = activityHtml;
  document.getElementById('ob-goal').innerHTML = goalHtml;
  document.getElementById('macros-activity').innerHTML = activityHtml;
  document.getElementById('macros-goal').innerHTML = goalHtml;
  document.getElementById('ob-activity').value = '1.725';
  document.getElementById('ob-goal').value = 'maintenance';
}

function renderMacros() {
  const profile = Storage.getProfile();
  document.getElementById('macros-age').value = profile.age;
  document.getElementById('macros-sex').value = profile.sex;
  document.getElementById('macros-height').value = profile.height;
  document.getElementById('macros-weight').value = profile.weight;
  document.getElementById('macros-activity').value = profile.activityLevel;
  document.getElementById('macros-goal').value = profile.goalType;

  renderMacroResults(profile);
}

function renderMacroResults(profile) {
  const macros = Macros.macrosFor(profile);
  document.getElementById('macros-results').innerHTML = `
    <div class="macro-result-card">
      <div class="macro-result-value">${macros.maintenanceKcal.toLocaleString('es-ES')} kcal</div>
      <div class="macro-result-label">Mantenimiento estimado (TDEE)</div>
    </div>
    <div class="macro-result-card">
      <div class="macro-result-value">${macros.targetKcal.toLocaleString('es-ES')} kcal</div>
      <div class="macro-result-label">${escapeHtml(macros.goalLabel)}</div>
      <div class="macro-grid-mini">
        <div class="macro-mini"><div class="macro-mini-value">${macros.protein}g</div><div class="macro-mini-label">Proteína</div></div>
        <div class="macro-mini"><div class="macro-mini-value">${macros.fat}g</div><div class="macro-mini-label">Grasa</div></div>
        <div class="macro-mini"><div class="macro-mini-value">${macros.carbs}g</div><div class="macro-mini-label">Carbos</div></div>
      </div>
    </div>`;
  Charts.renderMacroChart('chart-macros', macros);
}

function wireMacrosForm() {
  document.getElementById('macros-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = Storage.getProfile();
    profile.age = Number(document.getElementById('macros-age').value) || profile.age;
    profile.sex = document.getElementById('macros-sex').value;
    profile.height = Number(document.getElementById('macros-height').value) || profile.height;
    profile.weight = Number(document.getElementById('macros-weight').value) || profile.weight;
    profile.activityLevel = Number(document.getElementById('macros-activity').value);
    profile.goalType = document.getElementById('macros-goal').value;
    Storage.saveProfile(profile);
    renderMacroResults(profile);
    showToast('Macros actualizados');
    updateSidebarProfile();
  });
}

/* ---------- logros ---------- */

function achvCardHtml(a) {
  return `
    <div class="achv-card ${a.isUnlocked ? '' : 'locked'}">
      <div class="achv-icon"><i data-feather="${a.icon}"></i></div>
      <div class="achv-name">${escapeHtml(a.name)}</div>
      <div class="achv-desc">${escapeHtml(a.description)}</div>
      ${a.isUnlocked ? `<div class="achv-date">Desbloqueado ${formatDateShort(a.unlockedAt.slice(0, 10))}</div>` : ''}
    </div>`;
}

function renderLogros() {
  const all = Achievements.getAll();
  document.getElementById('logros-grid').innerHTML = all.map(achvCardHtml).join('');
}

function showAchievementUnlocked(defs) {
  const content = document.getElementById('achievement-modal-content');
  content.innerHTML = `
    <div class="achv-icon"><i data-feather="award"></i></div>
    <h2>¡Logro desbloqueado!</h2>
    ${defs.map((d) => `<p style="margin-top:10px"><strong style="color:var(--text-primary)">${escapeHtml(d.name)}</strong><br>${escapeHtml(d.description)}</p>`).join('')}
    <button class="btn btn-primary field-wide" style="margin-top:20px" data-close-modal="achievement-overlay">Genial</button>`;
  openModal('achievement-overlay');
  refreshIcons();
}

/* ---------- historial ---------- */

function historyItemHtml(session) {
  return `
    <div class="history-item" data-id="${session.id}">
      <div class="history-item-head">
        <div>
          <div class="history-item-title">${escapeHtml(session.title)}</div>
          <div class="history-item-date">${capitalize(formatDateLong(session.date))}</div>
        </div>
        <i data-feather="chevron-down"></i>
      </div>
      <div class="history-item-meta">
        <span>${session.exercises.length} ejercicios</span>
        <span>${Math.round(session.totalVolume).toLocaleString('es-ES')} kg vol.</span>
        <span>RPE ${session.avgRpe}</span>
      </div>
      <div class="history-detail">
        ${session.exercises.map((exo) => `
          <div class="history-detail-row">
            <span><b>${escapeHtml(exo.name)}</b></span>
            <span>${exo.sets.map((s) => `${s.reps}x${s.weight}kg@${s.rpe}`).join(', ')}</span>
          </div>`).join('')}
        <button class="history-delete-btn" data-delete-id="${session.id}"><i data-feather="trash-2"></i> Eliminar sesión</button>
      </div>
    </div>`;
}

function renderHistorial() {
  const sessions = [...Storage.getSessions()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const container = document.getElementById('historial-list');
  if (!sessions.length) {
    container.innerHTML = `<div class="empty-state card"><i data-feather="clock"></i><p>Aún no hay sesiones registradas.</p></div>`;
    refreshIcons();
    return;
  }
  container.innerHTML = sessions.map(historyItemHtml).join('');
  refreshIcons();

  container.querySelectorAll('.history-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.history-delete-btn')) return;
      item.classList.toggle('expanded');
    });
  });

  container.querySelectorAll('.history-delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm('¿Eliminar esta sesión del historial?')) return;
      Storage.deleteSession(btn.dataset.deleteId);
      showToast('Sesión eliminada');
      renderHistorial();
    });
  });
}

/* ---------- ajustes ---------- */

function renderAjustes() {
  const profile = Storage.getProfile();
  const settings = Storage.getSettings();
  document.getElementById('profile-name').value = profile.name;
  document.getElementById('profile-height').value = profile.height;
  document.getElementById('profile-weight').value = profile.weight;
  document.getElementById('settings-notifications').checked = settings.notificationsEnabled;
  document.getElementById('settings-reminder-hour').value = settings.reminderHour;
  document.getElementById('reminder-hour-value').textContent = `${String(settings.reminderHour).padStart(2, '0')}:00`;
}

function wireAjustes() {
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = Storage.getProfile();
    profile.name = document.getElementById('profile-name').value.trim();
    profile.height = Number(document.getElementById('profile-height').value) || profile.height;
    profile.weight = Number(document.getElementById('profile-weight').value) || profile.weight;
    Storage.saveProfile(profile);
    updateSidebarProfile();
    showToast('Perfil actualizado');
  });

  document.getElementById('settings-notifications').addEventListener('change', (e) => {
    const settings = Storage.getSettings();
    if (e.target.checked && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        settings.notificationsEnabled = perm === 'granted';
        e.target.checked = settings.notificationsEnabled;
        Storage.saveSettings(settings);
        if (!settings.notificationsEnabled) showToast('Permiso de notificaciones denegado', 'error');
      });
    } else {
      settings.notificationsEnabled = false;
      Storage.saveSettings(settings);
    }
  });

  document.getElementById('settings-reminder-hour').addEventListener('input', (e) => {
    document.getElementById('reminder-hour-value').textContent = `${String(e.target.value).padStart(2, '0')}:00`;
  });
  document.getElementById('settings-reminder-hour').addEventListener('change', (e) => {
    const settings = Storage.getSettings();
    settings.reminderHour = Number(e.target.value);
    Storage.saveSettings(settings);
  });

  document.getElementById('reset-data-btn').addEventListener('click', () => {
    if (!confirm('Esto borrará todo tu perfil, historial y progreso guardado. ¿Continuar?')) return;
    localStorage.clear();
    location.reload();
  });
}

/* ---------- weight modal ---------- */

function wireWeightModal() {
  document.getElementById('progreso-add-weight-btn').addEventListener('click', () => {
    document.getElementById('weight-date').value = Storage.todayISO();
    document.getElementById('weight-value').value = Storage.getProfile().weight;
    openModal('weight-modal-overlay');
  });

  document.getElementById('weight-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('weight-date').value;
    const weight = Number(document.getElementById('weight-value').value);
    if (!date || !weight) return;
    Storage.addWeightEntry({ date, weight });
    const profile = Storage.getProfile();
    profile.weight = weight;
    Storage.saveProfile(profile);
    closeModal('weight-modal-overlay');
    showToast('Peso registrado');
    if (currentView === 'progreso') renderProgreso();
  });
}

/* ---------- sidebar profile ---------- */

function updateSidebarProfile() {
  const profile = Storage.getProfile();
  const phase = Routines.getCurrentPhase();
  document.getElementById('sidebar-name').textContent = profile.name || 'Atleta';
  document.getElementById('sidebar-phase').textContent = `Fase ${phase.id} · ${capitalize(Routines.getPhaseMonthLabel())}`;
}

/* ---------- onboarding ---------- */

function wireOnboarding() {
  document.getElementById('onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = Storage.getProfile();
    profile.name = document.getElementById('ob-name').value.trim();
    profile.height = Number(document.getElementById('ob-height').value);
    profile.weight = Number(document.getElementById('ob-weight').value);
    profile.age = Number(document.getElementById('ob-age').value);
    profile.sex = document.getElementById('ob-sex').value;
    profile.activityLevel = Number(document.getElementById('ob-activity').value);
    profile.goalType = document.getElementById('ob-goal').value;
    profile.onboardingComplete = true;
    profile.startDate = Storage.todayISO();
    Storage.saveProfile(profile);
    closeModal('onboarding-overlay');
    Seed.run();
    boot();
  });
}

/* ---------- reminders ---------- */

function checkReminder() {
  const settings = Storage.getSettings();
  if (!settings.notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  if (now.getHours() !== settings.reminderHour) return;

  const workout = Routines.getTodayWorkout();
  if (!workout) return;

  const sessions = Storage.getSessions();
  if (sessions.some((s) => s.date === Storage.todayISO())) return;

  const meta = Storage.getMeta();
  if (meta.lastNotifiedDate === Storage.todayISO()) return;

  new Notification('GYMstar', { body: `Hoy toca: ${workout.title}. No rompas tu racha.` });
  Storage.saveMeta({ ...meta, lastNotifiedDate: Storage.todayISO() });
}

/* ---------- global wiring ---------- */

function wireNav() {
  document.querySelectorAll('.nav-item, .bnav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  document.getElementById('topbar-settings-btn').addEventListener('click', () => switchView('ajustes'));
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-close-modal]');
    if (btn) closeModal(btn.dataset.closeModal);
  });
}

/* ---------- boot ---------- */

function boot() {
  updateSidebarProfile();
  switchView('dashboard');
  refreshIcons();
  if (reminderTimer) clearInterval(reminderTimer);
  reminderTimer = setInterval(checkReminder, 60000);
  checkReminder();
}

const SPLASH_MIN_MS = 1400;
const splashStart = performance.now();

function hideSplash() {
  const splash = document.getElementById('app-splash');
  if (!splash) return;
  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - splashStart));
  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 450);
  }, wait);
}

document.addEventListener('DOMContentLoaded', () => {
  refreshIcons();
  populateStaticSelects();
  wireNav();
  wireOnboarding();
  wireRegistroForm();
  wireMacrosForm();
  wireAjustes();
  wireWeightModal();

  const profile = Storage.getProfile();
  if (!profile.onboardingComplete) {
    openModal('onboarding-overlay');
    refreshIcons();
  } else {
    Seed.run();
    boot();
  }
  hideSplash();
});
