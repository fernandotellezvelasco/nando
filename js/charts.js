/* charts.js — Chart.js rendering helpers, dark tech theme */

const Charts = (() => {
  const instances = {};
  const COLORS = {
    cyan: '#22d3ee',
    violet: '#a78bfa',
    text: '#94a3b8',
    grid: 'rgba(148,163,184,0.12)',
    success: '#34d399',
    warning: '#fbbf24',
  };

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = COLORS.text;

  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function baseGrid() {
    return { color: COLORS.grid, drawTicks: false };
  }

  function getExerciseNames(sessions) {
    const set = new Set();
    sessions.forEach((s) => s.exercises.forEach((e) => set.add(e.name)));
    return Array.from(set).sort();
  }

  function renderLiftChart(canvasId, exerciseName, sessions) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const points = sessions
      .map((s) => {
        const e = s.exercises.find((ex) => ex.name === exerciseName);
        if (!e || !e.sets.length) return null;
        const top = Math.max(...e.sets.map((st) => Number(st.weight) || 0));
        return { x: s.date, y: top };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.x) - new Date(b.x));

    instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: points.map((p) => p.x),
        datasets: [{
          label: exerciseName,
          data: points.map((p) => p.y),
          borderColor: COLORS.cyan,
          backgroundColor: 'rgba(34,211,238,0.12)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: COLORS.cyan,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: baseGrid(), ticks: { maxRotation: 0 } },
          y: { grid: baseGrid(), title: { display: true, text: 'kg', color: COLORS.text } },
        },
      },
    });
  }

  function weekKey(dateStr) {
    const d = new Date(dateStr);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return monday.toISOString().slice(0, 10);
  }

  function renderVolumeChart(canvasId, sessions) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const map = {};
    sessions.forEach((s) => {
      const k = weekKey(s.date);
      map[k] = (map[k] || 0) + (s.totalVolume || 0);
    });
    const weeks = Object.keys(map).sort();

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: weeks.map((w) => `Sem. ${new Date(w).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`),
        datasets: [{
          label: 'Volumen total (kg)',
          data: weeks.map((w) => Math.round(map[w])),
          backgroundColor: 'rgba(167,139,250,0.55)',
          borderRadius: 6,
          maxBarThickness: 36,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: baseGrid() },
        },
      },
    });
  }

  function renderBodyweightChart(canvasId, weightLog) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const sorted = [...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date));

    instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: sorted.map((w) => w.date),
        datasets: [{
          label: 'Peso corporal (kg)',
          data: sorted.map((w) => w.weight),
          borderColor: COLORS.success,
          backgroundColor: 'rgba(52,211,153,0.12)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: COLORS.success,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: baseGrid(), ticks: { maxRotation: 0 } },
          y: { grid: baseGrid() },
        },
      },
    });
  }

  function renderMacroChart(canvasId, macros) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [`Proteína (${macros.protein}g)`, `Grasa (${macros.fat}g)`, `Carbohidratos (${macros.carbs}g)`],
        datasets: [{
          data: [macros.protein * 4, macros.fat * 9, macros.carbs * 4],
          backgroundColor: [COLORS.cyan, COLORS.warning, COLORS.violet],
          borderColor: '#0a0e1a',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, boxWidth: 10 } },
        },
      },
    });
  }

  function renderConsistencyChart(canvasId, sessions) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const weeksBack = 8;
    const now = new Date();
    const labels = [];
    const data = [];
    for (let i = weeksBack - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const k = weekKey(d.toISOString());
      const count = sessions.filter((s) => weekKey(s.date) === k).length;
      labels.push(new Date(k).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
      data.push(count);
    }

    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Sesiones / semana',
          data,
          backgroundColor: data.map((v) => (v >= 4 ? COLORS.success : COLORS.cyan)),
          borderRadius: 6,
          maxBarThickness: 28,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: baseGrid(), suggestedMax: 4, ticks: { stepSize: 1 } },
        },
      },
    });
  }

  return {
    getExerciseNames,
    renderLiftChart,
    renderVolumeChart,
    renderBodyweightChart,
    renderMacroChart,
    renderConsistencyChart,
  };
})();
