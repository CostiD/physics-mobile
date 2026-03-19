const content = {
  theory: [
    {
      type: 'heading',
      text: 'Evoluția modelului atomic',
    },
    {
      type: 'text',
      text: 'Înțelegerea structurii atomului a evoluat dramatic în câteva decenii. Modelul lui Thomson (1904) propunea un atom neutru format dintr-o sferă pozitivă în care electronii erau înglobați — modelul „budincă cu stafide". Experimentul Geiger-Marsden (1909) a răsturnat această imagine: particulele α deviate la unghiuri mari puteau fi explicate doar printr-un nucleu minuscul, extrem de dens.',
    },
    {
      type: 'heading',
      text: 'Modelul Rutherford',
    },
    {
      type: 'text',
      text: 'Rutherford propune în 1911 atomul planetar: electroni care orbitează un nucleu pozitiv mic. Modelul a explicat împrăștierea, dar contrazicea electrodinamica clasică — un electron în mișcare circulară radiază energie și ar trebui să cadă pe nucleu în ~10⁻⁸ s.',
    },
    {
      type: 'heading',
      text: 'Modelul Bohr — postulate și formule',
    },
    {
      type: 'text',
      text: 'Bohr (1913) introduce două postulate revoluționare: electronii pot exista doar pe orbite stabile (cuantificate) fără să radieze; radiația este emisă/absorbită doar la tranziții între orbite.',
    },
    {
      type: 'formula',
      text: 'Eₙ = −13.6 / n²  [eV]',
      label: 'Energia nivelului n (n = 1, 2, 3, ...)',
    },
    {
      type: 'formula',
      text: 'ΔE = hf = Eᵢ − E_f',
      label: 'Energia fotonului emis/absorbit la tranziție',
    },
    {
      type: 'formula',
      text: 'rₙ = n² · a₀,  a₀ = 0.529 Å',
      label: 'Raza orbitei Bohr (a₀ = raza Bohr)',
    },
    {
      type: 'heading',
      text: 'Serii spectrale ale hidrogenului',
    },
    {
      type: 'list',
      items: [
        'Lyman (UV): tranziții spre n=1',
        'Balmer (vizibil): tranziții spre n=2  — liniile roșie (Hα, 656 nm), albastră etc.',
        'Paschen (IR): tranziții spre n=3',
        'Brackett, Pfund: tranziții spre n=4, 5 (IR îndepărtat)',
      ],
    },
  ],

  problems: [
    {
      id: 'a1',
      text: 'Calculați energia fotonului emis la tranziția n=3 → n=2 în atomul de hidrogen. Ce culoare are această radiație?',
      answer:
        'E₃ = −13.6/9 = −1.511 eV\n' +
        'E₂ = −13.6/4 = −3.400 eV\n' +
        'ΔE = E₃ − E₂ = 1.889 eV\n\n' +
        'λ = hc/ΔE = (6.626×10⁻³⁴ × 3×10⁸) / (1.889 × 1.6×10⁻¹⁹)\n' +
        'λ ≈ 656 nm  →  roșu (linia Hα, seria Balmer)',
    },
    {
      id: 'a2',
      text: 'Un electron din atomul de hidrogen se află pe nivelul n=4. Câte tranziții posibile există spre niveluri inferioare? Care dau radiație vizibilă?',
      answer:
        'Tranziții posibile: 4→3, 4→2, 4→1, 3→2, 3→1, 2→1  →  6 tranziții\n\n' +
        'Vizibil (400–700 nm) → seria Balmer (tranziții spre n=2):\n' +
        '  4→2: λ = 486 nm (albastru-verde, Hβ)\n' +
        '  3→2: λ = 656 nm (roșu, Hα)\n\n' +
        'Celelalte sunt UV (→n=1) sau IR (→n=3).',
    },
    {
      id: 'a3',
      text: 'Care este raza orbitei Bohr pentru n=3? De câte ori este mai mare decât raza stării fundamentale?',
      answer:
        'rₙ = n² · a₀\n' +
        'r₃ = 9 · 0.529 Å = 4.76 Å = 0.476 nm\n\n' +
        'r₃/r₁ = 9  →  de 9 ori mai mare.',
    },
  ],
}

export default content
