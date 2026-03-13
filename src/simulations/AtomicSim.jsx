import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
//  CONSTANTE FIZICE (CODATA)
// ═══════════════════════════════════════════════════════════════
const R_H = 1.09737e7; // m⁻¹
const energyEV = (n) => -13.6 / (n * n); // eV
const calcWL = (ni, nf) =>
  ni > nf ? (1e9 / (R_H * (1 / (nf * nf) - 1 / (ni * ni)))).toFixed(1) : null;
const calcDE = (ni, nf) => Math.abs(energyEV(ni) - energyEV(nf));

const wlToRGB = (wl) => {
  const w = parseFloat(wl);
  if (!w || w < 380 || w > 750) return null;
  let r, g, b;
  if (w < 440) { r = (440 - w) / 60; g = 0; b = 1; }
  else if (w < 490) { r = 0; g = (w - 440) / 50; b = 1; }
  else if (w < 510) { r = 0; g = 1; b = (510 - w) / 20; }
  else if (w < 580) { r = (w - 510) / 70; g = 1; b = 0; }
  else if (w < 645) { r = 1; g = (645 - w) / 65; b = 0; }
  else { r = 1; g = 0; b = 0; }
  const f = w < 420 ? 0.3 + 0.7 * (w - 380) / 40 : w > 700 ? 0.3 + 0.7 * (750 - w) / 50 : 1;
  return `rgb(${~~(r * f * 255)},${~~(g * f * 255)},${~~(b * f * 255)})`;
};

const SERIES = [
  { name: "Lyman",    nf: 1, region: "UV",  color: "#c084fc" },
  { name: "Balmer",   nf: 2, region: "VIS", color: "#34d399" },
  { name: "Paschen",  nf: 3, region: "IR",  color: "#fb923c" },
  { name: "Brackett", nf: 4, region: "IR",  color: "#fbbf24" },
  { name: "Pfund",    nf: 5, region: "IR",  color: "#f87171" },
];

const MODELS = [
  {
    id: "thomson", year: 1897, author: "J.J. Thomson",
    name: 'Modelul "budincă cu stafide"',
    desc: "Electronii (sarcini negative) sunt încastrați uniform într-o sferă omogenă de sarcină pozitivă. Modelul nu poate explica rezultatele experimentului Geiger–Marsden (Rutherford, 1909): unele particule alfa erau deviate la unghiuri foarte mari.",
    formula: null,
  },
  {
    id: "rutherford", year: 1911, author: "E. Rutherford",
    name: "Modelul planetar",
    desc: "Un nucleu mic, dens, pozitiv este orbitat de electroni. Problema: electrodinamica clasică prezice că electronul accelerat centripetal emite radiație continuu și spiralizează spre nucleu în ~10⁻¹⁰ s — atomul ar fi instabil.",
    formula: null,
  },
  {
    id: "bohr", year: 1913, author: "N. Bohr",
    name: "Modelul Bohr",
    desc: "Electronii se mișcă pe orbite circulare cuantizate (n = 1, 2, 3…). Pe o orbită stabilă nu emit radiație. Un foton este emis sau absorbit exclusiv la tranziția nᵢ → nf, cu energia egală cu diferența dintre niveluri.",
    formula: "Eₙ = −13.6 / n²  [eV]",
  },
  {
    id: "quantum", year: 1926, author: "E. Schrödinger",
    name: "Modelul cuantic",
    desc: "Electronul este descris de funcția de undă ψ(r,θ,φ). Modulul |ψ|² este densitatea de probabilitate. Orbitele devin orbitali (1s, 2s, 2p, 3d…) descriși de numerele cuantice n, l, m_l, m_s.",
    formula: "Ĥψ = Eψ",
  },
];

// ═══════════════════════════════════════════════════════════════
//  COMPONENTA PRINCIPALĂ
// ═══════════════════════════════════════════════════════════════
export default function AtomicSim() {
  const [tab, setTab] = useState(0);
  const tabs = ["◉ Modele", "↯ Tranziții", "≋ Serii", "▬ Spectru"];

  return (
    <div style={{ minHeight: "100vh", background: "#020c1a", color: "#a0c4d8",
      fontFamily: "'JetBrains Mono', 'Courier New', monospace", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.6} }
        @keyframes fadeup { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes photon { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(3)} }
        @keyframes orbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fadeup { animation: fadeup .35s ease both; }
        button { cursor: pointer; }
        input[type=range] { accent-color: #00c0ec; cursor: pointer; }
        select { background: #020c1a; color: #00c0ec; border: 1px solid rgba(0,192,236,.3);
          border-radius: 6px; padding: 4px 8px; font-family: inherit; font-size: 11px; cursor: pointer; }
      `}</style>

      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: ((i * 137.508) % 100) + "%",
            top: ((i * 97.3) % 100) + "%",
            width: 1 + (i % 2),
            height: 1 + (i % 2),
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.05 + (i % 6) * 0.04,
            animation: `twinkle ${2 + i % 5}s ${(i * 0.2) % 4}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, padding: "20px 16px 0" }}>
        <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(15px,4.5vw,24px)",
          fontWeight: 900, color: "#00c0ec", textShadow: "0 0 28px rgba(0,192,236,.5)",
          letterSpacing: ".06em" }}>⚛ FIZICĂ ATOMICĂ</div>
        <div style={{ fontSize: 9, color: "#112233", letterSpacing: ".18em", marginTop: 4 }}>
          SIMULĂRI INTERACTIVE · HIDROGEN · CLASA X–XII
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "14px 16px 0",
        position: "relative", zIndex: 10 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: 1, minWidth: 72,
            background: tab === i ? "rgba(0,192,236,.1)" : "rgba(255,255,255,.02)",
            border: `1px solid ${tab === i ? "rgba(0,192,236,.45)" : "rgba(255,255,255,.06)"}`,
            color: tab === i ? "#00d0f0" : "#2a5568",
            padding: "7px 8px", borderRadius: 7, fontFamily: "inherit",
            fontSize: 10, fontWeight: tab === i ? 600 : 400,
            letterSpacing: ".03em", transition: "all .22s",
          }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 32px", position: "relative", zIndex: 10 }}>
        {tab === 0 && <TabModele />}
        {tab === 1 && <TabTranzitii />}
        {tab === 2 && <TabSerii />}
        {tab === 3 && <TabSpectru />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CARD / PANEL helpers
// ═══════════════════════════════════════════════════════════════
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(2,16,32,.92)",
      border: "1px solid rgba(0,140,200,.18)",
      borderRadius: 11, padding: 14, ...style,
    }}>{children}</div>
  );
}
function Label({ children }) {
  return <div style={{ fontSize: 8, color: "#0d2a3a", letterSpacing: ".16em",
    fontWeight: 700, marginBottom: 7 }}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════
//  TAB 1 — MODELE ATOMICE
// ═══════════════════════════════════════════════════════════════
function TabModele() {
  const [sel, setSel] = useState("bohr");
  const m = MODELS.find((x) => x.id === sel);

  return (
    <div className="fadeup">
      {/* selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {MODELS.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)} style={{
            flex: 1, minWidth: 70,
            background: sel === x.id ? "rgba(0,192,236,.09)" : "rgba(255,255,255,.02)",
            border: `1px solid ${sel === x.id ? "rgba(0,192,236,.4)" : "rgba(255,255,255,.06)"}`,
            color: sel === x.id ? "#00d0f0" : "#2a5568",
            padding: "7px 6px", borderRadius: 7, fontFamily: "inherit",
            fontSize: 9, transition: "all .2s",
          }}>
            <div style={{ color: sel === x.id ? "#005e78" : "#0e2030", fontWeight: 700 }}>{x.year}</div>
            <div style={{ marginTop: 2 }}>{x.author.split(" ").slice(-1)[0]}</div>
          </button>
        ))}
      </div>

      <div key={sel} className="fadeup" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Card style={{ width: 200, flexShrink: 0 }}>
          <Label>VIZUALIZARE</Label>
          <ModelViz id={sel} />
        </Card>

        <div style={{ flex: 1, minWidth: 190, display: "flex", flexDirection: "column", gap: 9 }}>
          <Card>
            <div style={{ fontSize: 8, color: "#0d2a3a", letterSpacing: ".06em" }}>{m.year} · {m.author}</div>
            <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: 12, color: "#00c4ee",
              fontWeight: 700, margin: "6px 0 10px", lineHeight: 1.5 }}>{m.name}</div>
            <p style={{ fontSize: 11, lineHeight: 1.85, color: "#4a7080" }}>{m.desc}</p>
            {m.formula && (
              <div style={{ marginTop: 10, background: "rgba(0,200,100,.04)",
                border: "1px solid rgba(0,200,100,.2)", borderRadius: 7,
                padding: "8px 12px", fontSize: 13, color: "#22e477", letterSpacing: ".04em" }}>
                {m.formula}
              </div>
            )}
          </Card>

          {sel === "bohr" && (
            <Card>
              <Label>NIVELURI ENERGETICE — HIDROGEN (eV)</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} style={{ background: "rgba(0,100,180,.07)",
                    border: "1px solid rgba(0,140,200,.14)", borderRadius: 7,
                    padding: "6px 10px", textAlign: "center", minWidth: 58 }}>
                    <div style={{ fontSize: 8, color: "#0d2a3a" }}>n = {n}</div>
                    <div style={{ fontSize: 14, color: "#00d0f0", fontWeight: 600, marginTop: 2 }}>
                      {energyEV(n).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 8, color: "#0a1c28" }}>eV</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: "#0d2a3a", marginTop: 8 }}>
                E∞ = 0 eV &nbsp;|&nbsp; Energie ionizare = 13.6 eV (n=1)
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelViz({ id }) {
  const [ang, setAng] = useState(0);
  useEffect(() => {
    let raf;
    const loop = () => { setAng((a) => a + 0.027); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const cx = 90, cy = 95;

  if (id === "thomson") {
    const pts = [[-28,-18],[22,-30],[38,8],[-8,34],[-42,10],[6,2],[-18,-40]];
    return (
      <svg width={180} height={190} viewBox="0 0 180 190">
        <defs>
          <radialGradient id="tg">
            <stop offset="0%" stopColor="rgba(255,120,40,.35)" />
            <stop offset="100%" stopColor="rgba(255,40,0,.03)" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={68} fill="url(#tg)" stroke="rgba(255,90,30,.22)" strokeWidth={1.5} />
        {pts.map(([dx, dy], i) => (
          <g key={i}>
            <circle cx={cx+dx} cy={cy+dy} r={5.5} fill="#18aaff" opacity={.88} />
            <text x={cx+dx} y={cy+dy+3.5} textAnchor="middle" fontSize={5} fill="#fff" fontWeight="bold">e⁻</text>
          </g>
        ))}
        <text x={cx} y={cy+3} textAnchor="middle" fontSize={9} fill="rgba(255,110,40,.45)">sarcină +</text>
      </svg>
    );
  }

  if (id === "rutherford") {
    const r = 62;
    return (
      <svg width={180} height={190} viewBox="0 0 180 190">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,140,200,.12)" strokeWidth={1} strokeDasharray="3,5" />
        <circle cx={cx} cy={cy} r={11} fill="rgba(255,180,0,.78)" stroke="#ffaa00" strokeWidth={1.5} />
        <text x={cx} y={cy+3.5} textAnchor="middle" fontSize={8} fill="#fff">+Ze</text>
        <circle cx={cx+r*Math.cos(ang)} cy={cy+r*Math.sin(ang)} r={5.5} fill="#18aaff" />
        <text x={cx} y={182} textAnchor="middle" fontSize={7.5} fill="rgba(255,70,40,.55)">instabil clasic!</text>
      </svg>
    );
  }

  if (id === "bohr") {
    const rs = [0,24,42,58,72];
    return (
      <svg width={180} height={190} viewBox="0 0 180 190">
        {[1,2,3,4].map((n) => (
          <circle key={n} cx={cx} cy={cy} r={rs[n]} fill="none"
            stroke="rgba(0,140,200,.22)" strokeWidth={1} />
        ))}
        {[1,2,3,4].map((n) => (
          <text key={n} x={cx+rs[n]+3} y={cy-3} fontSize={7} fill="rgba(0,160,210,.35)">n={n}</text>
        ))}
        <circle cx={cx} cy={cy} r={9} fill="rgba(255,180,0,.8)" stroke="#ffaa00" strokeWidth={1.5} />
        <text x={cx} y={cy+3.5} textAnchor="middle" fontSize={7} fill="#fff">p⁺</text>
        {/* electron on n=1 */}
        <circle cx={cx+rs[1]*Math.cos(ang*1.6)} cy={cy+rs[1]*Math.sin(ang*1.6)} r={5} fill="#18aaff" />
        {/* electron on n=3 */}
        <circle cx={cx+rs[3]*Math.cos(ang)} cy={cy+rs[3]*Math.sin(ang)} r={5} fill="#18aaff" opacity={.6} />
      </svg>
    );
  }

  if (id === "quantum") {
    const dots = Array.from({ length: 48 }, (_, i) => {
      const a = i * 2.399, r = 8 + (i * 11.9) % 64;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r, op: Math.max(0.05, 0.75 - r / 80) };
    });
    return (
      <svg width={180} height={190} viewBox="0 0 180 190">
        {[8,18,30,44,58,70].map((r,i) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none"
            stroke={`rgba(0,${180-i*12},${255-i*18},${.8-i*.1})`}
            strokeWidth={Math.max(0.5, 6 - i)} />
        ))}
        {dots.map((d,i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.4} fill="#00c4ff" opacity={d.op} />
        ))}
        <circle cx={cx} cy={cy} r={4} fill="#ffc040" />
        <text x={cx} y={185} textAnchor="middle" fontSize={7.5} fill="rgba(0,160,210,.4)">|ψ|² — nor de probabilitate</text>
      </svg>
    );
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  FOTON ȘERPUITOR — wave packet radial
// ═══════════════════════════════════════════════════════════════
function PhotonWave({ cx, cy, angle, photonP, color, rFrom, rTo }) {
  const dist = rFrom + (rTo - rFrom) * photonP;
  const waveLen = 32, amp = 5.5, freq = 3.5, nPts = 30;
  const d = Array.from({ length: nPts }, (_, i) => {
    const t = i / (nPts - 1);
    const x = dist + (t - 0.5) * waveLen;
    const y = amp * Math.sin(t * freq * Math.PI * 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const deg = (angle * 180) / Math.PI;
  return (
    <g transform={`rotate(${deg}, ${cx}, ${cy})`}>
      <g transform={`translate(${cx}, ${cy})`}>
        <path d={d} stroke={color} strokeWidth={8} fill="none" opacity={0.10} strokeLinecap="round" />
        <path d={d} stroke={color} strokeWidth={2.5} fill="none" opacity={0.95}
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={dist} cy={0} r={4} fill={color} opacity={0.88} />
        <circle cx={dist} cy={0} r={7} fill={color} opacity={0.14} />
      </g>
    </g>
  );
}

// Flash de impact — explozie radială de raze la locul absorbției
function ImpactFlash({ cx, cy, angle, r, intensity, color }) {
  if (intensity <= 0) return null;
  // poziția electronului în momentul impactului
  const ex = cx + r * Math.cos(angle);
  const ey = cy + r * Math.sin(angle);
  const maxR   = 22 * intensity;
  const rays   = 10;
  return (
    <g>
      {/* halou exterior */}
      <circle cx={ex} cy={ey} r={maxR} fill={color} opacity={0.08 * intensity} />
      {/* inel */}
      <circle cx={ex} cy={ey} r={maxR * 0.65} fill="none"
        stroke={color} strokeWidth={2.5} opacity={0.35 * intensity} />
      {/* raze */}
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const r1 = 7 * intensity, r2 = maxR * 0.9;
        return (
          <line key={i}
            x1={ex + r1 * Math.cos(a)} y1={ey + r1 * Math.sin(a)}
            x2={ex + r2 * Math.cos(a)} y2={ey + r2 * Math.sin(a)}
            stroke={color} strokeWidth={1.6} opacity={0.55 * intensity}
            strokeLinecap="round" />
        );
      })}
      {/* nucleu stralucitor */}
      <circle cx={ex} cy={ey} r={7 * intensity} fill={color} opacity={0.55 * intensity} />
      <circle cx={ex} cy={ey} r={3.5 * intensity} fill="#fff" opacity={0.7 * intensity} />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 2 — TRANZIȚII BOHR
// ═══════════════════════════════════════════════════════════════
function TabTranzitii() {
  const rs = [0, 26, 46, 63, 78, 91, 102];

  const [ni, setNi] = useState(4);
  const [nf, setNf] = useState(2);

  const angRef = useRef(0);
  const [ang, setAng]           = useState(0);
  const [electronR, setElectronR] = useState(rs[4]);

  // Stare animație separată per etapă
  const [anim, setAnim] = useState(null);
  // { photonP, flashI, electronP, fixAngle }
  const transRaf = useRef(null);

  const emit   = ni > nf;
  const absorb = ni < nf;
  const wl  = calcWL(Math.max(ni, nf), Math.min(ni, nf));
  const dE  = ni !== nf ? calcDE(ni, nf).toFixed(4) : "0";
  const col = wlToRGB(wl) || (emit ? "#c084fc" : "#fb923c");
  const ser = emit ? SERIES.find((s) => s.nf === Math.min(ni, nf)) : null;

  // Loop orbital continuu
  useEffect(() => {
    let raf;
    const loop = () => { angRef.current += 0.022; setAng(angRef.current); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reset la schimbare ni/nf
  useEffect(() => {
    if (transRaf.current) cancelAnimationFrame(transRaf.current);
    setAnim(null);
    setElectronR(rs[Math.min(ni, 6)]);
  }, [ni, nf]); // eslint-disable-line

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn  = (t) => t * t * t;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  // Fade in-out simétric pentru flash: peak la t=0.5
  const flashCurve = (t) => t < 0.5 ? t * 2 : (1 - t) * 2;

  const handleTransition = () => {
    if (anim !== null || ni === nf) return;
    const startR   = rs[Math.min(ni, 6)];
    const endR     = rs[Math.min(nf, 6)];
    const fixAngle = angRef.current;
    const DURATION = 2200;
    const t0 = performance.now();

    const animate = (now) => {
      const raw = Math.min((now - t0) / DURATION, 1);

      let photonP, flashI, curElR;

      if (absorb) {
        // ── ABSORBȚIE ─────────────────────────────────────────
        // [0 → 0.52] fotonul vine dinspre exterior → lovește electronul
        // [0.48 → 0.68] flash de impact (peak la 0.58)
        // [0.62 → 1.0] electronul sare pe orbita superioară
        photonP  = raw < 0.52 ? clamp01(raw / 0.52) : null;          // null = dispare
        const fRaw = clamp01((raw - 0.46) / 0.22);                   // 0→1 pe fereastra [0.46, 0.68]
        flashI   = flashCurve(fRaw) * (raw >= 0.46 && raw <= 0.68 ? 1 : 0);
        const eRaw = clamp01((raw - 0.62) / 0.38);
        curElR   = startR + (endR - startR) * easeOut(eRaw);
      } else {
        // ── EMISIE ────────────────────────────────────────────
        // [0 → 0.38] electronul sare la orbita inferioară
        // [0.30 → 0.50] flash la punctul de plecare (peak la 0.40)
        // [0.44 → 1.0] fotonul pleacă radial spre exterior
        const eRaw = clamp01(raw / 0.38);
        curElR   = startR + (endR - startR) * easeIn(eRaw);
        const fRaw = clamp01((raw - 0.28) / 0.22);
        flashI   = flashCurve(fRaw) * (raw >= 0.28 && raw <= 0.50 ? 1 : 0);
        photonP  = raw >= 0.44 ? clamp01((raw - 0.44) / 0.56) : null;
      }

      setElectronR(curElR);
      setAnim({ photonP, flashI, fixAngle, startR, endR });

      if (raw < 1) {
        transRaf.current = requestAnimationFrame(animate);
      } else {
        setElectronR(endR);
        setAnim(null);
      }
    };
    transRaf.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => { if (transRaf.current) cancelAnimationFrame(transRaf.current); }, []);

  return (
    <div className="fadeup">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

        {/* ── Diagrama Bohr ── */}
        <Card style={{ width: 215, flexShrink: 0 }}>
          <Label>ATOM HIDROGEN — BOHR</Label>
          <svg width={210} height={220} viewBox="0 0 210 220"
            style={{ display: "block", margin: "0 auto", overflow: "visible" }}>

            {/* Orbite */}
            {[1,2,3,4,5,6].map((n) => (
              <g key={n}>
                <circle cx={105} cy={108} r={rs[n]} fill="none"
                  stroke={n === ni || n === nf
                    ? "rgba(0,210,255,.42)" : "rgba(0,140,200,.13)"}
                  strokeWidth={n === ni || n === nf ? 1.6 : 1}
                  strokeDasharray={n === ni || n === nf ? "none" : "none"} />
                <text x={105 + rs[n] + 2} y={106} fontSize={7}
                  fill="rgba(0,155,210,.32)">n={n}</text>
              </g>
            ))}

            {/* Nucleu */}
            <circle cx={105} cy={108} r={9} fill="rgba(255,185,0,.85)" stroke="#ffaa00" strokeWidth={1.5} />
            <text x={105} y={111.5} textAnchor="middle" fontSize={7} fill="#fff">p⁺</text>

            {/* Foton șerpuitor */}
            {anim?.photonP !== null && anim?.photonP !== undefined && ni !== nf && (
              <PhotonWave
                cx={105} cy={108}
                angle={anim.fixAngle}
                photonP={anim.photonP}
                color={col}
                rFrom={absorb ? anim.startR + 30 : anim.endR + 4}
                rTo={absorb   ? anim.startR + 4  : anim.startR + 34}
              />
            )}

            {/* Flash de impact (absorbție) sau de emisie */}
            {anim && anim.flashI > 0.01 && (
              <ImpactFlash
                cx={105} cy={108}
                angle={anim.fixAngle}
                r={absorb ? anim.startR : anim.endR}
                intensity={anim.flashI}
                color={col}
              />
            )}

            {/* Electron — raza animată */}
            <circle
              cx={105 + electronR * Math.cos(ang)}
              cy={108 + electronR * Math.sin(ang)}
              r={5.8} fill="#18aaff"
              style={{ filter: "drop-shadow(0 0 4px #18aaff)" }} />

            {/* Săgeată indicatoare orbit curent vs target (statică, dashed) */}
            {ni !== nf && anim === null && (
              <line
                x1={105 + rs[Math.min(ni,6)] * Math.cos(ang - 0.35)}
                y1={108 + rs[Math.min(ni,6)] * Math.sin(ang - 0.35)}
                x2={105 + rs[Math.min(nf,6)] * Math.cos(ang - 0.35)}
                y2={108 + rs[Math.min(nf,6)] * Math.sin(ang - 0.35)}
                stroke={col} strokeWidth={1.4} strokeDasharray="3,2" opacity={0.55} />
            )}
          </svg>
        </Card>

        {/* ── Controale + rezultate ── */}
        <div style={{ flex: 1, minWidth: 185, display: "flex", flexDirection: "column", gap: 9 }}>
          <Card>
            <Label>SELECTEAZĂ NIVELURI</Label>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {[["Nivel inițial nᵢ", ni, setNi], ["Nivel final nf", nf, setNf]].map(([label, val, setter]) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "#0d2a3a", marginBottom: 4 }}>{label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {[1,2,3,4,5,6].map((n) => (
                      <button key={n} onClick={() => setter(n)} style={{
                        width: 30, height: 28, borderRadius: 5,
                        background: val===n ? "rgba(0,192,236,.18)" : "rgba(255,255,255,.03)",
                        border: `1px solid ${val===n ? "rgba(0,192,236,.5)" : "rgba(255,255,255,.07)"}`,
                        color: val===n ? "#00d0f0" : "#2a5568",
                        fontFamily: "inherit", fontSize: 11, fontWeight: 600, transition: "all .15s",
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleTransition}
              disabled={anim !== null || ni === nf}
              style={{
                width: "100%", padding: "9px", borderRadius: 7,
                background: anim !== null ? "rgba(255,255,255,.03)" : "rgba(0,192,236,.1)",
                border: `1px solid ${anim !== null ? "rgba(255,255,255,.07)" : "rgba(0,192,236,.35)"}`,
                color: anim !== null ? "#2a5568" : "#00d0f0",
                fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                letterSpacing: ".05em", transition: "all .2s",
              }}>
              {anim !== null
                ? (emit ? "⬇ se emit foton…" : "⬆ se absoarbe foton…")
                : emit ? "⬇ EMITE FOTON" : absorb ? "⬆ ABSOARBE FOTON" : "— ACELAȘI NIVEL"}
            </button>
          </Card>

          {/* Rezultate */}
          <Card key={`${ni}-${nf}`} className="fadeup">
            <Label>REZULTATE CALCUL</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <ResultRow label="Tip" value={ni===nf?"—":emit?"Emisie":"Absorbție"}
                color={ni===nf?"#2a5568":emit?"#34d399":"#fb923c"} />
              <ResultRow label="ΔE = |Eₙᵢ − Eₙf|" value={`${dE} eV`} color="#00d0f0" />
              <ResultRow label="λ (lungime de undă)" value={wl ? `${wl} nm` : "UV / IR"} color={col||"#a0a0a0"} />
              <ResultRow label="Seria spectrală"
                value={ser ? ser.name + " (" + ser.region + ")" : "—"}
                color={ser ? ser.color : "#2a5568"} />
              <ResultRow label="Eₙᵢ" value={`${energyEV(ni).toFixed(3)} eV`} color="#7090a0" />
              <ResultRow label="Eₙf" value={`${energyEV(nf).toFixed(3)} eV`} color="#7090a0" />
            </div>
            {wl && (
              <div style={{ marginTop: 10, height: 14, borderRadius: 4, overflow: "hidden",
                background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ width: `${Math.min(100, ((parseFloat(wl)-380)/370)*100)}%`,
                  height: "100%", background: col, opacity: .85 }} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Formula */}
      <Card style={{ marginTop: 10 }}>
        <Label>FORMULA BOHR — LUNGIMEA DE UNDĂ</Label>
        <div style={{ fontSize: 13, color: "#22e477", letterSpacing: ".04em", lineHeight: 2 }}>
          1/λ = R_H · (1/nf² − 1/nᵢ²)
        </div>
        <div style={{ fontSize: 10, color: "#0d3040", marginTop: 4 }}>
          R_H = 1.09737 × 10⁷ m⁻¹ (constanta Rydberg)
        </div>
      </Card>
    </div>
  );
}

function ResultRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
      <span style={{ fontSize: 10, color: "#0d2a3a" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 3 — SERII SPECTRALE
// ═══════════════════════════════════════════════════════════════
function TabSerii() {
  const [selSer, setSelSer] = useState(1); // index in SERIES
  const s = SERIES[selSer];
  const maxNi = 8;
  const lines = Array.from({ length: maxNi - s.nf }, (_, i) => {
    const ni = s.nf + 1 + i;
    const wl = calcWL(ni, s.nf);
    const dE = calcDE(ni, s.nf);
    return { ni, wl: wl ? parseFloat(wl) : null, dE: dE.toFixed(4) };
  });
  const visLines = lines.filter((l) => l.wl && l.wl >= 380 && l.wl <= 750);

  return (
    <div className="fadeup">
      {/* Selector serii */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {SERIES.map((s, i) => (
          <button key={i} onClick={() => setSelSer(i)} style={{
            flex: 1, minWidth: 70, padding: "8px 6px", borderRadius: 7,
            background: selSer===i ? `rgba(${hexToRgbStr(s.color)},.12)` : "rgba(255,255,255,.02)",
            border: `1px solid ${selSer===i ? s.color+"88" : "rgba(255,255,255,.06)"}`,
            color: selSer===i ? s.color : "#2a5568",
            fontFamily: "inherit", fontSize: 10, transition: "all .2s",
          }}>
            <div>{s.name}</div>
            <div style={{ fontSize: 8, marginTop: 2, opacity: .6 }}>nf={s.nf} · {s.region}</div>
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: 10 }}>
        <Label>LINII SPECTRALE — SERIA {s.name.toUpperCase()}</Label>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ color: "#0d2a3a", fontSize: 8, letterSpacing: ".1em" }}>
                {["nᵢ","nf","λ (nm)","ΔE (eV)","Regiune","Culoare"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "4px 8px",
                    borderBottom: "1px solid rgba(255,255,255,.05)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(({ ni, wl, dE }) => {
                const rgb = wlToRGB(wl);
                const region = !wl ? "UV/IR" : wl < 380 ? "UV" : wl > 750 ? "IR" : "VIS";
                return (
                  <tr key={ni} style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                    <td style={{ padding: "5px 8px", color: "#00d0f0" }}>{ni}</td>
                    <td style={{ padding: "5px 8px", color: "#4a7080" }}>{s.nf}</td>
                    <td style={{ padding: "5px 8px", color: "#a0c4d8", fontWeight: 600 }}>
                      {wl ? wl.toFixed(1) : "—"}
                    </td>
                    <td style={{ padding: "5px 8px", color: "#a0c4d8" }}>{dE}</td>
                    <td style={{ padding: "5px 8px", color: RegionColor(region), fontSize: 9 }}>{region}</td>
                    <td style={{ padding: "5px 8px" }}>
                      {rgb ? (
                        <div style={{ width: 30, height: 10, borderRadius: 3, background: rgb }} />
                      ) : (
                        <span style={{ fontSize: 8, color: "#0d2a3a" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Diagrama niveluri energetice */}
      <Card>
        <Label>DIAGRAMA NIVELURI ENERGETICE — SERIA {s.name.toUpperCase()}</Label>
        <EnergyDiagram series={s} lines={lines} />
      </Card>

      {/* Bara vizibila */}
      {visLines.length > 0 && (
        <Card style={{ marginTop: 10 }}>
          <Label>LINII VIZIBILE ({visLines.length} tranziții în 380–750 nm)</Label>
          <SpectrumBar lines={visLines} />
        </Card>
      )}
    </div>
  );
}

function hexToRgbStr(hex) {
  const n = parseInt(hex.replace("#",""), 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}
function RegionColor(r) {
  return r==="UV" ? "#c084fc" : r==="VIS" ? "#34d399" : r==="IR" ? "#fb923c" : "#4a7080";
}

function EnergyDiagram({ series, lines }) {
  const levels = [1,2,3,4,5,6,7,8];
  const Emin = -13.6, Emax = 0;
  const H = 220, W = 280;
  const yScale = (e) => H * 0.95 - (e - Emin) / (Emax - Emin) * H * 0.88;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {levels.map((n) => {
        const E = energyEV(n);
        const y = yScale(E);
        return (
          <g key={n}>
            <line x1={38} y1={y} x2={W-10} y2={y} stroke="rgba(0,140,200,.2)" strokeWidth={1} />
            <text x={4} y={y+3} fontSize={7} fill="#0d2a3a">n={n}</text>
            <text x={34} y={y+3} fontSize={6.5} fill="rgba(0,160,200,.35)" textAnchor="end">
              {E.toFixed(2)}
            </text>
          </g>
        );
      })}
      {lines.map(({ ni, wl }, idx) => {
        if (ni > 8) return null;
        const y1 = yScale(energyEV(ni));
        const y2 = yScale(energyEV(series.nf));
        const x = 60 + idx * 26;
        const rgb = wlToRGB(wl) || series.color;
        return (
          <g key={ni}>
            <line x1={x} y1={y1} x2={x} y2={y2}
              stroke={rgb} strokeWidth={1.5} opacity={.8} />
            <polygon points={`${x},${y2+6} ${x-3},${y2} ${x+3},${y2}`} fill={rgb} opacity={.8} />
            {wl && (
              <text x={x} y={y2+16} textAnchor="middle" fontSize={6}
                fill={rgb} opacity={.7}>{Math.round(wl)}</text>
            )}
          </g>
        );
      })}
      <text x={W/2} y={H-2} textAnchor="middle" fontSize={7} fill="#0d2a3a">λ (nm)</text>
    </svg>
  );
}

function SpectrumBar({ lines }) {
  return (
    <div style={{ position: "relative", height: 36, background: "rgba(255,255,255,.03)",
      borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)" }}>
      {/* gradient curcubeu */}
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(to right,#6600ff,#0000ff,#00ccff,#00ff00,#ffff00,#ff8800,#ff0000)",
        opacity: .18 }} />
      {lines.map(({ wl, ni }) => {
        const pct = ((wl - 380) / 370) * 100;
        const col = wlToRGB(wl);
        return (
          <div key={ni} title={`n=${ni}→, λ=${wl.toFixed(1)} nm`} style={{
            position: "absolute", left: `${pct}%`, top: 0, bottom: 0,
            width: 2.5, background: col, opacity: .9,
            boxShadow: `0 0 6px ${col}`,
          }}>
            <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
              fontSize: 6, color: "#fff", opacity: .7, whiteSpace: "nowrap" }}>{ni}</div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 4 — SPECTRU VIZIBIL
// ═══════════════════════════════════════════════════════════════
function TabSpectru() {
  const [mode, setMode] = useState("emisie");
  const [element, setElement] = useState("H");

  const elements = {
    H: { name: "Hidrogen (H)", lines: [656.3,486.1,434.0,410.2], colors: null },
    He: { name: "Heliu (He)", lines: [667.8,587.6,501.6,447.1,402.6], colors: null },
    Na: { name: "Sodiu (Na)", lines: [589.0,589.6,819.5], colors: null },
    Hg: { name: "Mercur (Hg)", lines: [404.7,435.8,546.1,577.0,579.1], colors: null },
  };

  const el = elements[element];

  return (
    <div className="fadeup">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <Card style={{ flex: 1, minWidth: 140 }}>
          <Label>ELEMENT</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.keys(elements).map((k) => (
              <button key={k} onClick={() => setElement(k)} style={{
                flex: 1, padding: "6px 0", borderRadius: 6, fontFamily: "inherit", fontSize: 11,
                background: element===k ? "rgba(0,192,236,.12)" : "rgba(255,255,255,.03)",
                border: `1px solid ${element===k ? "rgba(0,192,236,.4)" : "rgba(255,255,255,.06)"}`,
                color: element===k ? "#00d0f0" : "#2a5568", fontWeight: element===k ? 700 : 400,
                transition: "all .18s",
              }}>{k}</button>
            ))}
          </div>
        </Card>
        <Card style={{ flex: 1, minWidth: 130 }}>
          <Label>TIP SPECTRU</Label>
          {["emisie","absorbție"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              display: "block", width: "100%", padding: "7px", marginBottom: 5, borderRadius: 6,
              background: mode===m ? "rgba(0,192,236,.1)" : "rgba(255,255,255,.02)",
              border: `1px solid ${mode===m ? "rgba(0,192,236,.38)" : "rgba(255,255,255,.06)"}`,
              color: mode===m ? "#00d0f0" : "#2a5568", fontFamily: "inherit", fontSize: 10,
              transition: "all .18s", textTransform: "capitalize",
            }}>{mode===m ? "◉" : "○"} Spectru de {m}</button>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom: 10 }}>
        <Label>{el.name.toUpperCase()} — SPECTRU DE {mode.toUpperCase()}</Label>
        <FullSpectrumViz lines={el.lines} mode={mode} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8,
          color: "#0d2a3a", marginTop: 4 }}>
          <span>380 nm (UV)</span><span>VIS</span><span>750 nm (IR)</span>
        </div>
      </Card>

      {/* Tabel linii */}
      <Card>
        <Label>LUNGIMI DE UNDĂ ({el.name})</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {el.lines.map((wl) => {
            const col = wlToRGB(wl);
            const vis = wl >= 380 && wl <= 750;
            return (
              <div key={wl} style={{ background: "rgba(255,255,255,.03)",
                border: `1px solid ${col && vis ? col+"44" : "rgba(255,255,255,.06)"}`,
                borderRadius: 7, padding: "6px 10px", textAlign: "center", minWidth: 68 }}>
                <div style={{ width: 36, height: 8, borderRadius: 3, margin: "0 auto 4px",
                  background: col && vis ? col : "rgba(255,255,255,.07)" }} />
                <div style={{ fontSize: 11, color: col && vis ? col : "#4a7080", fontWeight: 600 }}>
                  {wl.toFixed(1)}
                </div>
                <div style={{ fontSize: 8, color: "#0d2a3a", marginTop: 1 }}>nm</div>
                <div style={{ fontSize: 7, color: RegionColor(wl<380?"UV":wl>750?"IR":"VIS"), marginTop: 2 }}>
                  {wl < 380 ? "UV" : wl > 750 ? "IR" : "VIS"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Explicatie pedagogica */}
      <Card style={{ marginTop: 10 }}>
        <Label>CE ESTE UN SPECTRU?</Label>
        <p style={{ fontSize: 11, lineHeight: 1.85, color: "#4a7080" }}>
          <span style={{ color: "#34d399" }}>Spectrul de emisie</span> apare când atomii excitați (prin căldură sau
          descărcare electrică) emit fotoni la tranziția electronilor de pe niveluri superioare pe niveluri inferioare.
          Fiecare element are un set unic de linii — un fel de „amprentă spectrală".
        </p>
        <p style={{ fontSize: 11, lineHeight: 1.85, color: "#4a7080", marginTop: 6 }}>
          <span style={{ color: "#fb923c" }}>Spectrul de absorbție</span> apare când lumina albă trece printr-un gaz rece.
          Atomii absorb exact fotonii cu energii corespunzătoare tranzițiilor posibile — apar linii întunecate pe
          fond continuu (spectrul Fraunhofer al Soarelui).
        </p>
      </Card>
    </div>
  );
}

function FullSpectrumViz({ lines, mode }) {
  const W = 320, H = 56;
  const toX = (wl) => ((wl - 380) / 370) * W;

  // gradient curcubeu
  const gradId = "rgbgrad";
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", borderRadius: 5, overflow: "hidden" }}>
      <defs>
        <linearGradient id={gradId} x1="0%" x2="100%">
          {[
            [0,"#6600ff"],[.1,"#5500ff"],[.18,"#0000ff"],[.28,"#0099ff"],
            [.4,"#00ffcc"],[.52,"#00ff00"],[.65,"#ffff00"],[.77,"#ff8800"],[.9,"#ff3300"],[1,"#cc0000"],
          ].map(([o,c]) => <stop key={o} offset={`${o*100}%`} stopColor={c} />)}
        </linearGradient>
      </defs>

      {mode === "emisie" ? (
        <>
          {/* sfondo nero */}
          <rect width={W} height={H} fill="#030810" />
          {lines.filter(wl => wl>=380 && wl<=750).map((wl) => {
            const x = toX(wl);
            const col = wlToRGB(wl);
            return (
              <g key={wl}>
                <line x1={x} y1={0} x2={x} y2={H} stroke={col} strokeWidth={2} opacity={.9} />
                <line x1={x} y1={0} x2={x} y2={H} stroke={col} strokeWidth={8} opacity={.15} />
                <text x={x} y={H-3} textAnchor="middle" fontSize={7} fill={col} opacity={.8}>
                  {wl.toFixed(0)}
                </text>
              </g>
            );
          })}
        </>
      ) : (
        <>
          {/* sfondo spectru continuu */}
          <rect width={W} height={H} fill={`url(#${gradId})`} opacity={.7} />
          {lines.filter(wl => wl>=380 && wl<=750).map((wl) => {
            const x = toX(wl);
            return (
              <g key={wl}>
                <line x1={x} y1={0} x2={x} y2={H} stroke="#010810" strokeWidth={2.5} opacity={.92} />
                <text x={x} y={H-3} textAnchor="middle" fontSize={7} fill="rgba(0,0,0,.6)">
                  {wl.toFixed(0)}
                </text>
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}
