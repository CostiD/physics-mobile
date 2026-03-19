const content = {
  theory: [
    {
      type: 'heading',
      text: 'Dualismul undă-corpuscul',
    },
    {
      type: 'text',
      text: 'Lumina se comportă ca undă (interferență, difracție) dar și ca particulă (efectul fotoelectric). De Broglie (1924) a propus că și materia are natură ondulatorie: orice particulă cu impuls p are asociată o lungime de undă λ = h/p.',
    },
    {
      type: 'formula',
      text: 'λ = h / p = h / (mv)',
      label: 'Lungimea de undă de Broglie',
    },
    {
      type: 'heading',
      text: 'Experimentul Davisson-Germer (1927)',
    },
    {
      type: 'text',
      text: 'Electroni accelerați la 54 V au fost difractați pe un cristal de nichel, producând un maxim la 50° — exact predicția de undă. Prima confirmare experimentală a undelor de materie.',
    },
    {
      type: 'heading',
      text: 'Experimentul dublei fante (Feynman)',
    },
    {
      type: 'text',
      text: 'Electroni trimiși unul câte unul prin două fante produc o figură de interferență pe ecran — dar numai dacă nu „privim" prin care fantă trece. Observația perturbă sistemul și distruge interferența. Aceasta ilustrează principiul complementarității.',
    },
    {
      type: 'heading',
      text: 'Particula în cutie 1D',
    },
    {
      type: 'formula',
      text: 'Eₙ = n²π²ℏ² / (2mL²)',
      label: 'Nivelurile de energie cuantizate (n = 1, 2, 3, ...)',
    },
    {
      type: 'formula',
      text: 'ψₙ(x) = √(2/L) · sin(nπx/L)',
      label: 'Funcția de undă stațională',
    },
    {
      type: 'heading',
      text: 'Principiul incertitudinii Heisenberg',
    },
    {
      type: 'formula',
      text: 'Δx · Δp ≥ ℏ/2',
      label: 'Nu putem cunoaște simultan poziția și impulsul cu precizie arbitrară',
    },
  ],

  problems: [
    {
      id: 'q1',
      text: 'Un electron este accelerat printr-o diferență de potențial de 100 V. Calculați lungimea de undă de Broglie asociată.',
      answer:
        'Energia cinetică: Ec = eU = 1.6×10⁻¹⁹ × 100 = 1.6×10⁻¹⁷ J\n' +
        'p = √(2mEc) = √(2 × 9.1×10⁻³¹ × 1.6×10⁻¹⁷)\n' +
        'p ≈ 5.40×10⁻²⁴ kg·m/s\n\n' +
        'λ = h/p = 6.626×10⁻³⁴ / 5.40×10⁻²⁴\n' +
        'λ ≈ 1.23 Å = 0.123 nm',
    },
    {
      id: 'q2',
      text: 'Un electron este confinat într-o cutie de lungime L = 1 nm. Calculați energia stării fundamentale (n=1) și a primei stări excitate (n=2).',
      answer:
        'E₁ = π²ℏ² / (2mL²)\n' +
        '   = (3.14²×(1.055×10⁻³⁴)²) / (2×9.1×10⁻³¹×(10⁻⁹)²)\n' +
        '   ≈ 0.376 eV\n\n' +
        'E₂ = 4·E₁ = 1.504 eV\n\n' +
        'ΔE = E₂ − E₁ = 1.128 eV  (foton UV)',
    },
    {
      id: 'q3',
      text: 'Un proton și un electron au aceeași viteză v = 10⁶ m/s. Care are lungimea de undă de Broglie mai mare și de câte ori?',
      answer:
        'λ = h/(mv)\n' +
        'λₑ = h/(mₑv),  λₚ = h/(mₚv)\n\n' +
        'λₑ/λₚ = mₚ/mₑ = 1.67×10⁻²⁷ / 9.1×10⁻³¹ ≈ 1836\n\n' +
        'Electronul are λ de ~1836 ori mai mare.\n' +
        'λₑ ≈ 7.27×10⁻¹⁰ m = 0.727 nm',
    },
  ],
}

export default content
