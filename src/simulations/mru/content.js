const content = {
  theory: [
    {
      type: 'heading',
      text: 'Ce este MRU?',
    },
    {
      type: 'text',
      text: 'Mișcarea rectilinie uniformă (MRU) este mișcarea unui corp pe o traiectorie dreaptă cu viteză constantă în modul și direcție. Accelerația este nulă pe toată durata mișcării.',
    },
    {
      type: 'heading',
      text: 'Formule fundamentale',
    },
    {
      type: 'formula',
      text: 'x(t) = x₀ + v · t',
      label: 'Ecuația poziției (legea mișcării)',
    },
    {
      type: 'formula',
      text: 'v = Δx / Δt = const.',
      label: 'Viteza medie = viteză instantanee',
    },
    {
      type: 'formula',
      text: 'a = 0',
      label: 'Accelerație nulă',
    },
    {
      type: 'heading',
      text: 'Interpretarea graficelor',
    },
    {
      type: 'list',
      items: [
        'Graficul x(t): dreaptă — panta = viteza v; intercept = x₀',
        'Graficul v(t): dreaptă orizontală la valoarea v',
        'Graficul a(t): coincide cu axa Ot (a = 0 pentru tot t)',
        'Aria de sub graficul v(t) = deplasarea Δx',
      ],
    },
    {
      type: 'heading',
      text: 'Observații practice',
    },
    {
      type: 'text',
      text: 'Dacă v > 0 corpul se mișcă în sensul pozitiv al axei; dacă v < 0 în sens negativ. Distanța parcursă este |Δx| = |v| · t, iar deplasarea poate fi negativă.',
    },
  ],

  problems: [
    {
      id: 'm1',
      text: 'Un tren pleacă din gară cu viteza de 72 km/h. La ce distanță față de gară se află după 15 minute?',
      answer:
        'v = 72 km/h = 20 m/s\n' +
        't = 15 min = 900 s\n' +
        'x = v·t = 20 × 900 = 18 000 m = 18 km',
    },
    {
      id: 'm2',
      text: 'Două mașini pornesc simultan din orașe aflate la 240 km distanță, una spre cealaltă. Prima circulă cu 80 km/h, a doua cu 40 km/h. Peste cât timp se întâlnesc și unde?',
      answer:
        'Viteza de apropiere: v_rel = 80 + 40 = 120 km/h\n' +
        't = d/v_rel = 240/120 = 2 h\n\n' +
        'Mașina 1 parcurge: x₁ = 80×2 = 160 km de la orașul ei\n' +
        'Mașina 2 parcurge: x₂ = 40×2 = 80 km de la orașul ei\n' +
        'Se întâlnesc la 160 km de primul oraș.',
    },
    {
      id: 'm3',
      text: 'Un ciclist are ecuația mișcării x(t) = 5 + 3t [m, s]. Ce înseamnă valorile 5 și 3? La ce moment se află la x = 20 m?',
      answer:
        'x₀ = 5 m — poziția inițială față de origine\n' +
        'v  = 3 m/s — viteza constantă (panta dreptei)\n\n' +
        '20 = 5 + 3t\n' +
        '3t = 15  →  t = 5 s',
    },
  ],
}

export default content
