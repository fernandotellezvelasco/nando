/* bodymap.js — front/back muscle-highlight illustration */

const BodyMap = (() => {
  // Each zone path carries data-muscle matching keys used in DAY_MUSCLES (data.js)
  const FRONT_SVG = `
    <ellipse data-muscle="_head" cx="60" cy="18" rx="13" ry="15"/>
    <rect data-muscle="_head" x="53" y="30" width="14" height="10" rx="3"/>
    <path data-muscle="shoulders" d="M30,44 Q30,38 40,38 L52,38 L52,54 L34,58 Q28,56 30,44 Z"/>
    <path data-muscle="shoulders" d="M90,44 Q90,38 80,38 L68,38 L68,54 L86,58 Q92,56 90,44 Z"/>
    <path data-muscle="chest" d="M40,40 L80,40 L80,72 Q60,80 40,72 Z"/>
    <path data-muscle="abs" d="M42,72 Q60,80 78,72 L76,116 Q60,122 44,116 Z"/>
    <path data-muscle="biceps" d="M27,48 Q17,50 15,68 Q13,90 15,110 Q16,120 22,120 Q27,120 27,111 L29,68 Q29,54 33,48 Z"/>
    <path data-muscle="biceps" d="M93,48 Q103,50 105,68 Q107,90 105,110 Q104,120 98,120 Q93,120 93,111 L91,68 Q91,54 87,48 Z"/>
    <path data-muscle="quads" d="M41,122 Q41,119 44,119 L57,119 Q59,119 59,122 L58,172 Q58,176 54,176 L44,176 Q41,176 41,172 Z"/>
    <path data-muscle="quads" d="M79,122 Q79,119 76,119 L63,119 Q61,119 61,122 L62,172 Q62,176 66,176 L76,176 Q79,176 79,172 Z"/>
    <path data-muscle="calves" d="M42,180 Q42,177 45,177 L54,177 Q57,177 56,180 L54,220 Q53,227 48,227 Q43,227 43,220 Z"/>
    <path data-muscle="calves" d="M78,180 Q78,177 75,177 L66,177 Q63,177 64,180 L66,220 Q67,227 72,227 Q77,227 77,220 Z"/>
  `;

  const BACK_SVG = `
    <ellipse data-muscle="_head" cx="60" cy="18" rx="13" ry="15"/>
    <rect data-muscle="_head" x="53" y="30" width="14" height="10" rx="3"/>
    <path data-muscle="rearDelts" d="M30,44 Q30,38 40,38 L52,38 L52,54 L34,58 Q28,56 30,44 Z"/>
    <path data-muscle="rearDelts" d="M90,44 Q90,38 80,38 L68,38 L68,54 L86,58 Q92,56 90,44 Z"/>
    <path data-muscle="upperBack" d="M44,38 L76,38 L80,58 Q60,66 40,58 Z"/>
    <path data-muscle="lats" d="M40,58 Q60,66 80,58 L78,100 Q60,110 42,100 Z"/>
    <path data-muscle="lowerBack" d="M42,100 Q60,110 78,100 L76,118 Q60,124 44,118 Z"/>
    <path data-muscle="triceps" d="M27,48 Q17,50 15,68 Q13,90 15,110 Q16,120 22,120 Q27,120 27,111 L29,68 Q29,54 33,48 Z"/>
    <path data-muscle="triceps" d="M93,48 Q103,50 105,68 Q107,90 105,110 Q104,120 98,120 Q93,120 93,111 L91,68 Q91,54 87,48 Z"/>
    <path data-muscle="glutes" d="M42,120 L78,120 L76,144 Q60,150 44,144 Z"/>
    <path data-muscle="hamstrings" d="M44,146 Q44,145 45,145 L57,145 Q58,145 58,146 L57,175 Q57,176 56,176 L46,176 Q45,176 45,175 Z"/>
    <path data-muscle="hamstrings" d="M76,146 Q76,145 75,145 L63,145 Q62,145 62,146 L63,175 Q63,176 64,176 L74,176 Q75,176 75,175 Z"/>
    <path data-muscle="calves" d="M42,180 Q42,177 45,177 L54,177 Q57,177 56,180 L54,220 Q53,227 48,227 Q43,227 43,220 Z"/>
    <path data-muscle="calves" d="M78,180 Q78,177 75,177 L66,177 Q63,177 64,180 L66,220 Q67,227 72,227 Q77,227 77,220 Z"/>
  `;

  const MUSCLE_LABELS = {
    chest: 'Pecho', shoulders: 'Hombro', abs: 'Core', biceps: 'Bíceps', quads: 'Cuádriceps',
    calves: 'Gemelos', rearDelts: 'Deltoide posterior', upperBack: 'Trapecio', lats: 'Dorsal',
    lowerBack: 'Lumbar', triceps: 'Tríceps', glutes: 'Glúteo', hamstrings: 'Isquios',
  };

  function activate(svgMarkup, muscles) {
    const activeSet = new Set(muscles);
    return svgMarkup.replace(/data-muscle="([^"]+)"/g, (match, key) => {
      const active = key !== '_head' && activeSet.has(key);
      return `${match} class="zone${active ? ' active' : ''}"`;
    });
  }

  function render(muscles) {
    const labels = muscles.map((m) => MUSCLE_LABELS[m]).filter(Boolean);
    return `
      <div class="bodymap">
        <div class="bodymap-figures">
          <div class="bodymap-col">
            <svg viewBox="0 0 120 234" class="bodymap-svg">${activate(FRONT_SVG, muscles)}</svg>
            <span class="bodymap-view-label">Frente</span>
          </div>
          <div class="bodymap-col">
            <svg viewBox="0 0 120 234" class="bodymap-svg">${activate(BACK_SVG, muscles)}</svg>
            <span class="bodymap-view-label">Espalda</span>
          </div>
        </div>
        <div class="bodymap-tags">
          ${labels.map((l) => `<span class="bodymap-tag">${l}</span>`).join('')}
        </div>
      </div>`;
  }

  return { render };
})();
