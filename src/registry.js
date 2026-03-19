// ═══════════════════════════════════════════════════════════════
//  REGISTRY — sursa unică de adevăr pentru toate simulările
//
//  Pentru a adăuga o simulare nouă:
//    1. Creează src/simulations/<id>/index.jsx
//    2. Creează src/simulations/<id>/content.js
//    3. Adaugă un obiect în REGISTRY de mai jos
//  Atât. App.jsx nu se modifică niciodată.
// ═══════════════════════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'mecanica',          label: 'Mecanică' },
  { id: 'termodinamica',     label: 'Termodinamică' },
  { id: 'atomica',           label: 'Fizică Atomică' },
  { id: 'cuantica',          label: 'Mecanică Cuantică' },
  { id: 'electromagnetism',  label: 'Electromagnetism' },
  { id: 'optica',            label: 'Optică' },
  { id: 'astrofizica',       label: 'Astrofizică' },
]

// grade: clasele pentru care e relevantă simularea
// component / content: dynamic imports — se încarcă DOAR când userul deschide simularea
export const REGISTRY = [
  {
    id:       'mru',
    category: 'mecanica',
    grade:    ['IX', 'X'],
    title:    'Mișcare Rectilinie Uniformă',
    subtitle: 'Cinematică · Grafice x(t) și v(t)',
    icon:     '🚗',
    color:    '#4ade80',
    colorDim: 'rgba(74,222,128,0.10)',
    component: () => import('./simulations/mru/index.jsx'),
    content:   () => import('./simulations/mru/content.js'),
  },
  {
    id:       'thermal',
    category: 'termodinamica',
    grade:    ['X', 'XI'],
    title:    'Agitație Termică',
    subtitle: 'Faze · Molecule H₂O · Temperatură',
    icon:     '🌡️',
    color:    '#fb923c',
    colorDim: 'rgba(251,146,60,0.10)',
    component: () => import('./simulations/thermal/index.jsx'),
    content:   () => import('./simulations/thermal/content.js'),
  },
  {
    id:       'atomic',
    category: 'atomica',
    grade:    ['XI', 'XII'],
    title:    'Modele Atomice',
    subtitle: 'Thomson · Rutherford · Bohr',
    icon:     '⚛️',
    color:    '#818cf8',
    colorDim: 'rgba(129,140,248,0.10)',
    component: () => import('./simulations/atomic/index.jsx'),
    content:   () => import('./simulations/atomic/content.js'),
  },
  {
    id:       'orbitals',
    category: 'atomica',
    grade:    ['XI', 'XII'],
    title:    'Orbitali Atomici',
    subtitle: 'Funcții de undă · s, p, d',
    icon:     '🔮',
    color:    '#f472b6',
    colorDim: 'rgba(244,114,182,0.10)',
    component: () => import('./simulations/orbitals/index.jsx'),
    content:   () => import('./simulations/orbitals/content.js'),
  },
  {
    id:       'quantum',
    category: 'cuantica',
    grade:    ['XII'],
    title:    'Mecanică Cuantică',
    subtitle: 'Dubla fantă · De Broglie · Davisson-Germer',
    icon:     '🌊',
    color:    '#22d3ee',
    colorDim: 'rgba(34,211,238,0.10)',
    component: () => import('./simulations/quantum/index.jsx'),
    content:   () => import('./simulations/quantum/content.js'),
  },
  {
    id:       'central',
    category: 'mecanica',
    grade:    ['XII'],
    title:    'Forțe Centrale',
    subtitle: 'Moment cinetic · Binet · Hohmann',
    icon:     '🪐',
    color:    '#fbbf24',
    colorDim: 'rgba(251,191,36,0.10)',
    component: () => import('./simulations/central/index.jsx'),
    content:   () => import('./simulations/central/content.js'),
  },
]
