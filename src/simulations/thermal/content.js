const content = {
  theory: [
    {
      type: 'heading',
      text: 'Agitația termică',
    },
    {
      type: 'text',
      text: 'Particulele oricărui corp (atomi, molecule) se află în permanentă mișcare dezordonată, numită agitație termică. Intensitatea acestei mișcări crește cu temperatura absolută T — legătură ce stă la baza interpretării microscopice a temperaturii.',
    },
    {
      type: 'formula',
      text: 'Ec_med = ½m⟨v²⟩ = (3/2)k_B T',
      label: 'Energia cinetică medie de translație per moleculă',
    },
    {
      type: 'heading',
      text: 'Stările de agregare ale apei',
    },
    {
      type: 'list',
      items: [
        'Solid (gheață): sub 0°C — molecule fixe în rețea, vibrații mici în jurul pozițiilor de echilibru',
        'Lichid (apă): 0°C – 100°C — molecule mobile, legături de H instabile, difuzie semnificativă',
        'Gaz (vapori): peste 100°C — molecule complet libere, distanțe mari, fără ordine',
      ],
    },
    {
      type: 'heading',
      text: 'Căldura latentă',
    },
    {
      type: 'text',
      text: 'La schimbarea stării de agregare temperatura rămâne constantă, deși corpul primește/cedează căldură. Energia este folosită pentru ruperea legăturilor intermoleculare, nu pentru creșterea agitației termice.',
    },
    {
      type: 'formula',
      text: 'Q = m · L',
      label: 'L = căldura latentă specifică [J/kg]; topire: L_top = 334 kJ/kg; vaporizare: L_vap = 2260 kJ/kg (apă)',
    },
    {
      type: 'formula',
      text: 'Q = m · c · ΔT',
      label: 'Căldura sensibilă (fără schimbare de stare); c = capacitatea termică specifică',
    },
  ],

  problems: [
    {
      id: 't1',
      text: 'Ce cantitate de căldură este necesară pentru a topi 200 g de gheață la 0°C și a încălzi apa rezultată la 50°C? (c_apă = 4200 J/kg·K, L = 334 000 J/kg)',
      answer:
        'Q₁ = m·L = 0.200 × 334 000 = 66 800 J  (topire)\n' +
        'Q₂ = m·c·ΔT = 0.200 × 4200 × 50 = 42 000 J  (încălzire)\n' +
        'Q_total = 66 800 + 42 000 = 108 800 J ≈ 109 kJ',
    },
    {
      id: 't2',
      text: 'Un gaz ideal este conținut într-un recipient. Dacă temperatura absolută crește de 4 ori, de câte ori crește viteza pătratică medie a moleculelor?',
      answer:
        '½m⟨v²⟩ = (3/2)k_B T  →  ⟨v²⟩ ∝ T\n' +
        'v_rms = √⟨v²⟩ ∝ √T\n\n' +
        'T′ = 4T  →  v′_rms / v_rms = √(T′/T) = √4 = 2\n\n' +
        'Viteza pătratică medie crește de 2 ori.',
    },
    {
      id: 't3',
      text: 'Un corp de 500 g din aluminiu (c = 900 J/kg·K) la 80°C este introdus în 1 kg de apă la 20°C. Care este temperatura de echilibru? (neglijăm pierderile)',
      answer:
        'Q_cedat = Q_primit\n' +
        'm_Al · c_Al · (T_Al − T_f) = m_apă · c_apă · (T_f − T_apă)\n' +
        '0.5 × 900 × (80 − T_f) = 1 × 4200 × (T_f − 20)\n' +
        '450(80 − T_f) = 4200(T_f − 20)\n' +
        '36 000 − 450T_f = 4200T_f − 84 000\n' +
        '120 000 = 4650T_f\n' +
        'T_f ≈ 25.8°C',
    },
  ],
}

export default content
