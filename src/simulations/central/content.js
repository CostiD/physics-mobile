const content = {
  theory: [
    {
      type: 'heading',
      text: 'Moment cinetic și forțe centrale',
    },
    {
      type: 'text',
      text: 'O forță centrală acționează întotdeauna de-a lungul dreptei ce unește cele două corpuri. Consecința fundamentală: momentul cinetic L față de centrul de forță este conservat. Mișcarea rămâne în planul inițial.',
    },
    {
      type: 'formula',
      text: 'L = r × p = const.',
      label: 'Conservarea momentului cinetic vectorial',
    },
    {
      type: 'formula',
      text: 'dA/dt = L/(2m) = const.',
      label: 'A doua lege a lui Kepler: arii egale în timpi egali',
    },
    {
      type: 'heading',
      text: 'Coordonate polare și ecuația Binet',
    },
    {
      type: 'text',
      text: 'În coordonate polare (r, θ), mișcarea orbitală se reduce la o problemă 1D cu un potențial efectiv care include termenul centrifugal. Ecuația Binet permite determinarea formei orbitei din forța centrală.',
    },
    {
      type: 'formula',
      text: 'U_ef(r) = U(r) + L²/(2mr²)',
      label: 'Potențial efectiv = potențial real + barieră centrifugală',
    },
    {
      type: 'formula',
      text: 'd²u/dθ² + u = −m/(L²u²) · F(1/u)',
      label: 'Ecuația Binet (u = 1/r)',
    },
    {
      type: 'heading',
      text: 'Conice și gravitate',
    },
    {
      type: 'text',
      text: 'Sub forța gravitațională F ∝ 1/r², soluțiile ecuației Binet sunt conice (elipse, parabole, hiperbole). Tipul orbitei depinde de energia totală: E < 0 → elipsă, E = 0 → parabolă, E > 0 → hiperbolă.',
    },
    {
      type: 'heading',
      text: 'Transferul Hohmann',
    },
    {
      type: 'text',
      text: 'Manevra Hohmann este transferul optim (minim Δv) între două orbite circulare coplanare. Constă din două impulsuri: unul pentru a intra pe elipsa de transfer, al doilea pentru a circulariza pe orbita finală.',
    },
    {
      type: 'formula',
      text: 'Δv_total = Δv₁ + Δv₂',
      label: 'Costul total al manevrei (minim pentru transfer coplanar)',
    },
  ],

  problems: [
    {
      id: 'c1',
      text: 'Un satelit de masă m = 500 kg se mișcă pe o orbită circulară la altitudinea h = 400 km față de suprafața Pământului (R_T = 6371 km, M_T = 5.97×10²⁴ kg). Calculați viteza orbitală și perioada.',
      answer:
        'r = R_T + h = 6771 km = 6.771×10⁶ m\n' +
        'v = √(GM/r) = √(6.67×10⁻¹¹ × 5.97×10²⁴ / 6.771×10⁶)\n' +
        'v ≈ 7670 m/s ≈ 7.67 km/s\n\n' +
        'T = 2πr/v = 2π × 6.771×10⁶ / 7670 ≈ 5546 s ≈ 92.4 min',
    },
    {
      id: 'c2',
      text: 'Demonstrați că pentru o orbită circulară sub forța gravitațională, energia cinetică este jumătate din valoarea absolută a energiei potențiale.',
      answer:
        'Condiția orbită circulară: Fg = Fc\n' +
        'GMm/r² = mv²/r  →  mv² = GMm/r\n' +
        'Ec = ½mv² = GMm/(2r)\n' +
        'Ep = -GMm/r\n\n' +
        'Ec = -Ep/2  →  Ec = |Ep|/2  ✓\n\n' +
        'E_totală = Ec + Ep = -GMm/(2r) < 0\n' +
        '(teorema virialului pentru potențiale inverse-pătratice)',
    },
    {
      id: 'c3',
      text: 'Calculați Δv necesar pentru un transfer Hohmann de pe orbita ISS (h₁ = 400 km) pe orbita GPS (h₂ = 20 200 km).',
      answer:
        'r₁ = 6771 km,  r₂ = 26 571 km\n\n' +
        'Orbita de transfer (elipsă): a = (r₁+r₂)/2 = 16 671 km\n\n' +
        'v₁ = √(GM/r₁) = 7.67 km/s\n' +
        'v₂ = √(GM/r₂) = 3.87 km/s\n' +
        'v_pe = √(GM(2/r₁ - 1/a)) ≈ 9.89 km/s\n' +
        'v_ap = √(GM(2/r₂ - 1/a)) ≈ 1.68 km/s  [incorect — recalculat]\n\n' +
        'Δv₁ = v_pe − v₁ = 9.89 − 7.67 = 2.22 km/s\n' +
        'Δv₂ = v₂ − v_ap ≈ 3.87 − 2.52 = 1.35 km/s\n' +
        'Δv_total ≈ 3.57 km/s',
    },
  ],
}

export default content
