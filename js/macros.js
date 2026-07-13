/* macros.js — TDEE and macro calculations for body recomposition */

const Macros = (() => {
  const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentario (poco o nada de ejercicio)' },
    { value: 1.375, label: 'Ligero (1-3 días/semana)' },
    { value: 1.55, label: 'Moderado (entrena 4-5 días/semana)' },
    { value: 1.725, label: 'Activo (entrena 5-6 días + deporte)' },
    { value: 1.9, label: 'Muy activo (entreno intenso diario)' },
  ];

  const GOAL_TYPES = [
    { value: 'deficit', label: 'Déficit moderado (-15%) — priorizar pérdida de grasa', factor: 0.85 },
    { value: 'maintenance', label: 'Mantenimiento — recomposición clásica', factor: 1.0 },
    { value: 'surplus', label: 'Superávit leve (+10%) — priorizar ganancia muscular', factor: 1.10 },
  ];

  function bmr({ weight, height, age, sex }) {
    // Mifflin-St Jeor
    const base = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'female' ? base - 161 : base + 5;
  }

  function tdee(profile) {
    return bmr(profile) * profile.activityLevel;
  }

  function macrosFor(profile) {
    const maintenance = tdee(profile);
    const goal = GOAL_TYPES.find((g) => g.value === profile.goalType) || GOAL_TYPES[1];
    const kcal = maintenance * goal.factor;

    const proteinG = profile.weight * 2.2;
    const fatG = (kcal * 0.27) / 9;
    const proteinKcal = proteinG * 4;
    const fatKcal = fatG * 9;
    const carbKcal = Math.max(kcal - proteinKcal - fatKcal, 0);
    const carbG = carbKcal / 4;

    return {
      maintenanceKcal: Math.round(maintenance),
      targetKcal: Math.round(kcal),
      protein: Math.round(proteinG),
      fat: Math.round(fatG),
      carbs: Math.round(carbG),
      goalLabel: goal.label,
    };
  }

  return { ACTIVITY_LEVELS, GOAL_TYPES, bmr, tdee, macrosFor };
})();
