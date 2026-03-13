// ─────────────────────────────────────────────────────────────
//  CONȚINUT LECȚII — editează secțiunile marcate cu TODO
// ─────────────────────────────────────────────────────────────

export const LESSONS = [
  {
    id: 'atomic',
    icon: '⚛️',
    title: 'Modele Atomice',
    subtitle: 'Thomson · Rutherford · Bohr',
    color: '#818cf8',   // accent color for this card
    colorDim: 'rgba(129,140,248,0.12)',

    // ── TEORIE ───────────────────────────────────────────────
    // Fiecare element poate fi: { type: 'heading' | 'text' | 'formula' | 'list' }
    theory: [
      {
        type: 'heading',
        text: 'Evoluția modelului atomic',
      },
      {
        type: 'text',
        text: 'TODO: Adaugă o introducere despre cum s-a dezvoltat modelul atomic de-a lungul timpului.',
      },
      {
        type: 'heading',
        text: 'Modelul Bohr — formule cheie',
      },
      {
        type: 'formula',
        text: 'Eₙ = −13.6 / n²  [eV]',
        label: 'Energia nivelului n',
      },
      {
        type: 'formula',
        text: 'ΔE = hf = Eᵢ − E_f',
        label: 'Energia fotonului emis/absorbit',
      },
      {
        type: 'text',
        text: 'TODO: Completează cu explicații despre seriile spectrale (Lyman, Balmer, Paschen).',
      },
    ],

    // ── PROBLEME ──────────────────────────────────────────────
    problems: [
      {
        id: 'a1',
        text: 'TODO: Enunț problemă 1 — ex: Calculați energia fotonului emis la tranziția n=3 → n=2.',
        answer: 'TODO: Răspuns + rezolvare pas cu pas.',
      },
      {
        id: 'a2',
        text: 'TODO: Enunț problemă 2.',
        answer: 'TODO: Răspuns.',
      },
      {
        id: 'a3',
        text: 'TODO: Enunț problemă 3.',
        answer: 'TODO: Răspuns.',
      },
    ],
  },

  {
    id: 'quantum',
    icon: '🌊',
    title: 'Mecanică Cuantică',
    subtitle: 'Dubla fantă · Particula în cutie',
    color: '#22d3ee',
    colorDim: 'rgba(34,211,238,0.12)',

    theory: [
      {
        type: 'heading',
        text: 'Dualismul undă-corpuscul',
      },
      {
        type: 'text',
        text: 'TODO: Explică experimentul dublei fante și interpretarea cuantică.',
      },
      {
        type: 'heading',
        text: 'Particula în cutie 1D',
      },
      {
        type: 'formula',
        text: 'Eₙ = n²π²ℏ² / (2mL²)',
        label: 'Nivelurile de energie cuantizate',
      },
      {
        type: 'formula',
        text: 'λ = h / p  (de Broglie)',
        label: 'Lungimea de undă de Broglie',
      },
      {
        type: 'text',
        text: 'TODO: Completează cu principiul incertitudinii Heisenberg.',
      },
    ],

    problems: [
      {
        id: 'q1',
        text: 'TODO: Enunț problemă 1 — ex: Un electron este confinat într-o cutie de L=1nm. Calculați energia stării fundamentale.',
        answer: 'TODO: Răspuns + rezolvare.',
      },
      {
        id: 'q2',
        text: 'TODO: Enunț problemă 2.',
        answer: 'TODO: Răspuns.',
      },
      {
        id: 'q3',
        text: 'TODO: Enunț problemă 3.',
        answer: 'TODO: Răspuns.',
      },
    ],
  },

  {
    id: 'mru',
    icon: '🚗',
    title: 'Mișcare Rectilinie Uniformă',
    subtitle: 'Cinematică · Grafice x(t) și v(t)',
    color: '#4ade80',
    colorDim: 'rgba(74,222,128,0.12)',

    theory: [
      {
        type: 'heading',
        text: 'Ce este MRU?',
      },
      {
        type: 'text',
        text: 'Mișcarea rectilinie uniformă (MRU) este mișcarea unui corp pe o traiectorie dreaptă cu viteză constantă (accelerație nulă).',
      },
      {
        type: 'heading',
        text: 'Formule fundamentale',
      },
      {
        type: 'formula',
        text: 'x(t) = x₀ + v · t',
        label: 'Ecuația poziției',
      },
      {
        type: 'formula',
        text: 'v = Δx / Δt = const.',
        label: 'Viteza medie = viteză instantanee',
      },
      {
        type: 'list',
        items: [
          'Graficul x(t) este o dreaptă — panta = viteza',
          'Graficul v(t) este o dreaptă orizontală',
          'Graficul a(t) este suprapus pe axa Ot (a = 0)',
        ],
      },
      {
        type: 'text',
        text: 'TODO: Completează cu exemple și observații suplimentare.',
      },
    ],

    problems: [
      {
        id: 'm1',
        text: 'Un tren pleacă din gară cu viteza de 72 km/h. La ce distanță față de gară se află după 15 minute?',
        answer: 'v = 72 km/h = 20 m/s\nt = 15 min = 900 s\nx = v·t = 20 × 900 = 18 000 m = 18 km',
      },
      {
        id: 'm2',
        text: 'TODO: Enunț problemă 2.',
        answer: 'TODO: Răspuns.',
      },
      {
        id: 'm3',
        text: 'TODO: Enunț problemă 3.',
        answer: 'TODO: Răspuns.',
      },
    ],
  },

  {
    id: 'thermal',
    icon: '🌡️',
    title: 'Agitație Termică',
    subtitle: 'Faze · Molecule H₂O · Temperatură',
    color: '#fb923c',
    colorDim: 'rgba(251,146,60,0.12)',

    theory: [
      {
        type: 'heading',
        text: 'Agitația termică',
      },
      {
        type: 'text',
        text: 'Particulele oricărui corp (atomi, molecule) se află în permanentă mișcare dezordonată, numită agitație termică. Intensitatea acestei mișcări crește cu temperatura.',
      },
      {
        type: 'heading',
        text: 'Stările de agregare ale apei',
      },
      {
        type: 'list',
        items: [
          'Solid (gheață): sub 0°C — molecule fixe, vibrații mici',
          'Lichid (apă): 0°C – 100°C — molecule mobile, legături slabe',
          'Gaz (vapori): peste 100°C — molecule libere, fără ordine',
        ],
      },
      {
        type: 'formula',
        text: 'Ec = ½mv² ∝ T',
        label: 'Energia cinetică medie ∝ temperatura absolută',
      },
      {
        type: 'text',
        text: 'TODO: Completează cu căldura latentă și graficul de încălzire.',
      },
    ],

    problems: [
      {
        id: 't1',
        text: 'TODO: Enunț problemă 1 — ex: Ce cantitate de căldură este necesară pentru a topi 200g de gheață la 0°C?',
        answer: 'TODO: Răspuns + rezolvare.',
      },
      {
        id: 't2',
        text: 'TODO: Enunț problemă 2.',
        answer: 'TODO: Răspuns.',
      },
      {
        id: 't3',
        text: 'TODO: Enunț problemă 3.',
        answer: 'TODO: Răspuns.',
      },
    ],
  },

  {
    id: 'orbitals',
    icon: '🔮',
    title: 'Orbitali Atomici',
    subtitle: 'Funcții de undă · s, p, d',
    color: '#f472b6',
    colorDim: 'rgba(244,114,182,0.12)',

    theory: [
      {
        type: 'heading',
        text: 'Ce sunt orbitalii atomici?',
      },
      {
        type: 'text',
        text: 'TODO: Adaugă explicații despre orbitali — zone din jurul nucleului unde probabilitatea de a găsi electronul este semnificativă.',
      },
      {
        type: 'heading',
        text: 'Numerele cuantice',
      },
      {
        type: 'list',
        items: [
          'n — numărul cuantic principal (nivelul de energie)',
          'l — numărul cuantic orbital (forma: 0=s, 1=p, 2=d)',
          'm — numărul cuantic magnetic (orientarea)',
        ],
      },
      {
        type: 'formula',
        text: 'ψₙₗₘ(r, θ, φ)',
        label: 'Funcția de undă hidrogenoidă',
      },
      {
        type: 'formula',
        text: 'P(r) = |ψ|² · 4πr²',
        label: 'Densitatea de probabilitate radială',
      },
      {
        type: 'text',
        text: 'TODO: Completează cu descrierea formelor orbitalilor s, p, d și regulile de umplere.',
      },
    ],

    problems: [
      {
        id: 'o1',
        text: 'TODO: Enunț problemă 1 — ex: Ce valori poate lua m pentru l=2?',
        answer: 'TODO: Răspuns + rezolvare.',
      },
      {
        id: 'o2',
        text: 'TODO: Enunț problemă 2.',
        answer: 'TODO: Răspuns.',
      },
      {
        id: 'o3',
        text: 'TODO: Enunț problemă 3.',
        answer: 'TODO: Răspuns.',
      },
    ],
  },
]
