const content = {
  theory: [
    {
      type: 'heading',
      text: 'Ce sunt orbitalii atomici?',
    },
    {
      type: 'text',
      text: 'Spre deosebire de orbitele bine definite ale lui Bohr, mecanica cuantică descrie electronul printr-o funcție de undă ψ(r,θ,φ). Modulul pătrat |ψ|² dă densitatea de probabilitate de a găsi electronul în acel punct. Orbitalul este zona din spațiu unde această probabilitate este semnificativă (convențional ≥90%).',
    },
    {
      type: 'heading',
      text: 'Numerele cuantice',
    },
    {
      type: 'list',
      items: [
        'n — principal: determină energia și distanța medie față de nucleu (n = 1, 2, 3, ...)',
        'l — orbital (forma): 0 = s (sferică), 1 = p (bilobată), 2 = d (complex) — l ∈ {0, ..., n-1}',
        'm_l — magnetic (orientarea): m_l ∈ {-l, ..., 0, ..., l}  →  2l+1 orientări',
        'm_s — spin: ±½ — nu influențează forma spațială, dar completează descrierea electronului',
      ],
    },
    {
      type: 'formula',
      text: 'ψₙₗₘ(r, θ, φ) = Rₙₗ(r) · Yₗᵐ(θ, φ)',
      label: 'Funcția de undă hidrogenoidă = parte radială × armonică sferică',
    },
    {
      type: 'formula',
      text: 'P(r) = |Rₙₗ(r)|² · r²',
      label: 'Densitatea de probabilitate radială',
    },
    {
      type: 'heading',
      text: 'Formele orbitalilor',
    },
    {
      type: 'list',
      items: [
        '1s, 2s, 3s: sferici, cu n-1 noduri radiale',
        '2p, 3p: bilobați de-a lungul axelor x, y, z (3 orientări)',
        '3d: forme mai complexe, 4 lobi pentru d_{xy}, d_{xz}, d_{yz}, d_{x²-y²}; formă diferită pentru d_{z²}',
      ],
    },
  ],

  problems: [
    {
      id: 'o1',
      text: 'Ce valori poate lua numărul cuantic magnetic m_l pentru l = 2 (orbital d)? Câți orbitali d există?',
      answer:
        'm_l ∈ {-2, -1, 0, +1, +2}  →  5 valori\n' +
        'Există 5 orbitali d per nivel n (cu n ≥ 3).\n' +
        'Fiecare poate conține 2 electroni → subcochilia d poate găzdui 10 electroni.',
    },
    {
      id: 'o2',
      text: 'Câți electroni pot exista pe nivelul n = 3? Justificați sistematic.',
      answer:
        'n = 3  →  l ∈ {0, 1, 2}\n\n' +
        'l=0 (3s): m_l = 0  → 1 orbital × 2 spin = 2 e⁻\n' +
        'l=1 (3p): m_l ∈ {-1,0,1} → 3 orbitali × 2 = 6 e⁻\n' +
        'l=2 (3d): m_l ∈ {-2,...,2} → 5 orbitali × 2 = 10 e⁻\n\n' +
        'Total nivel n=3: 2 + 6 + 10 = 18 electroni\n' +
        '(formulă generală: 2n² → 2×9 = 18 ✓)',
    },
    {
      id: 'o3',
      text: 'Unde se află maximul densității de probabilitate radiale P(r) pentru orbitalul 1s al hidrogenului?',
      answer:
        'R₁₀(r) = 2(1/a₀)^(3/2) · e^(-r/a₀)\n' +
        'P(r) = |R₁₀|² r² ∝ r² · e^(-2r/a₀)\n\n' +
        'dP/dr = 0  →  2r·e^(-2r/a₀) − 2r²/a₀·e^(-2r/a₀) = 0\n' +
        '2r(1 − r/a₀) = 0  →  r_max = a₀ = 0.529 Å\n\n' +
        'Maximul coincide cu raza Bohr — confirmare frumoasă a conexiunii dintre cele două modele.',
    },
  ],
}

export default content
