import React, { useState, useEffect, useRef, useCallback } from "react";

const PI = Math.PI, SQRT2 = Math.SQRT2;
const CW = 440, CH = 390, N_PTS = 9000;

// ═══════════════════════════════════════════════════════════════
// MATH — Portat din Rust (evanescence)
// ═══════════════════════════════════════════════════════════════

function binom(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return Math.round(r);
}

function laguerre(x, n, a) {
  const coeffs = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    let c = (i % 2 === 0 ? 1 : -1) * binom(n + a, n - i);
    for (let j = 1; j <= i; j++) c /= j;
    coeffs[i] = c;
  }
  let result = coeffs[n];
  for (let i = n - 1; i >= 0; i--) result = result * x + coeffs[i];
  return result;
}

function radialNorm(n, l) {
  let prod = 1;
  for (let k = n - l; k <= n + l; k++) prod *= k;
  return 2.0 / Math.sqrt(prod) / (n * n);
}

function radial(r, n, l, norm) {
  if (r < 1e-12) return (l === 0) ? norm : 0;
  const rho = 2 * r / n;
  return norm * Math.exp(-rho / 2) * Math.pow(rho, l) * laguerre(rho, n - l - 1, 2 * l + 1);
}

function legendre(l, m, x) {
  if (m > l) return 0;
  const mf = m;
  let p_mm = 1;
  if (m !== 0) {
    const omxsq = (1 - x) * (1 + x);
    let dff = 1;
    for (let i = 0; i < m; i++) {
      p_mm *= omxsq * dff / (dff + 1);
      dff += 2;
    }
  }
  p_mm = Math.sqrt((2 * mf + 1) * p_mm / (4 * PI));
  if (l === m) return p_mm;
  const sqrt_2mp3 = Math.sqrt(2 * mf + 3);
  let p_m_mp1 = x * sqrt_2mp3 * p_mm;
  if (l === m + 1) return p_m_mp1;
  let p_ll = p_m_mp1, old_factor = sqrt_2mp3;
  for (let ls = m + 2; ls <= l; ls++) {
    const lf = ls;
    const factor = Math.sqrt((4 * lf * lf - 1) / (lf * lf - mf * mf));
    p_ll = (x * p_m_mp1 - p_mm / old_factor) * factor;
    old_factor = factor;
    [p_mm, p_m_mp1] = [p_m_mp1, p_ll];
  }
  return p_ll;
}

function Ylm_real(l, m, cosTheta, phi) {
  const mAbs = Math.abs(m);
  const P = legendre(l, mAbs, cosTheta);
  if (m > 0) return P * SQRT2 * Math.cos(m * phi);
  if (m < 0) return P * SQRT2 * Math.sin(mAbs * phi);
  return P;
}

function psi(x, y, z, n, l, m, norm) {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-12) return (l === 0) ? radial(0, n, l, norm) * Ylm_real(l, m, 1, 0) : 0;
  const cosTheta = z / r;
  const phi = Math.atan2(y, x);
  return radial(r, n, l, norm) * Ylm_real(l, m, cosTheta, phi);
}

function computeBound(n, l, norm) {
  const PROB_TARGET = 0.998, STEP = 0.08;
  let r = 0, prob = 0;
  for (let iter = 0; iter < 8000 && prob < PROB_TARGET; iter++) {
    const r0 = r, r1 = r + STEP / 2, r2 = r + STEP;
    const f = (rr) => { const v = radial(rr, n, l, norm); return rr * rr * v * v; };
    prob += (STEP / 6) * (f(r0) + 4 * f(r1) + f(r2));
    r = r2;
  }
  return r + n * n * 0.5;
}

// ═══════════════════════════════════════════════════════════════
// CATALOGUE & SAMPLING
// ═══════════════════════════════════════════════════════════════

function makeOrb(n, l, m, id, lbl, cP, cN) {
  const norm = radialNorm(n, l);
  return { n, l, m, id, lbl, cP, cN, norm, grp: n, sub: l === 0 ? 's' : l === 1 ? 'p' : 'd' };
}

const ORBS = [
  makeOrb(1,0, 0,'1s',   '1s',     '#93c5fd','#d8b4fe'),
  makeOrb(2,0, 0,'2s',   '2s',     '#818cf8','#f9a8d4'),
  makeOrb(2,1, 0,'2pz',  '2p\u2082','#2dd4bf','#fca5a5'),
  makeOrb(2,1, 1,'2px',  '2p\u1d6a','#2dd4bf','#fca5a5'),
  makeOrb(2,1,-1,'2py',  '2p\u1d67','#2dd4bf','#fca5a5'),
  makeOrb(3,0, 0,'3s',   '3s',     '#c4b5fd','#fdba74'),
  makeOrb(3,1, 0,'3pz',  '3p\u2082','#34d399','#fca5a5'),
  makeOrb(3,1, 1,'3px',  '3p\u1d6a','#34d399','#fca5a5'),
  makeOrb(3,1,-1,'3py',  '3p\u1d67','#34d399','#fca5a5'),
  makeOrb(3,2, 0,'3dz2', '3d\u1d69²','#fbbf24','#a5b4fc'),
  makeOrb(3,2, 1,'3dxz', '3d\u1d6a\u1d69','#fbbf24','#a5b4fc'),
  makeOrb(3,2,-1,'3dyz', '3d\u1d67\u1d69','#fbbf24','#a5b4fc'),
  makeOrb(3,2, 2,'3dx2y2','3dx²−y²','#fbbf24','#a5b4fc'),
  makeOrb(3,2,-2,'3dxy', '3d\u1d6a\u1d67','#fbbf24','#a5b4fc'),
];

function sampleOrbital(orb) {
  const { n, l, m, norm } = orb;
  const bound = computeBound(n, l, norm);
  function sampleBall() {
    const r = bound * Math.cbrt(Math.random());
    const cosT = 2 * Math.random() - 1;
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
    const phi = 2 * PI * Math.random();
    return [r * sinT * Math.cos(phi), r * sinT * Math.sin(phi), r * cosT];
  }
  let maxP = 1e-30;
  const rPeak = Math.max(0.1, n * n - n * l * 0.5);
  for (let i = 0; i < 40000; i++) {
    let [x, y, z] = (i < 20000) ? sampleBall() : (() => {
      const r = rPeak * (0.2 + Math.random() * 2.0);
      const cosT = 2 * Math.random() - 1;
      const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
      const phi = 2 * PI * Math.random();
      return [r * sinT * Math.cos(phi), r * sinT * Math.sin(phi), r * cosT];
    })();
    const v = psi(x, y, z, n, l, m, norm);
    const p = v * v;
    if (p > maxP) maxP = p;
  }
  maxP *= 1.6;
  const pts = [];
  let att = 0;
  while (pts.length < N_PTS && att < N_PTS * 120) {
    att++;
    const [x, y, z] = sampleBall();
    const v = psi(x, y, z, n, l, m, norm);
    const p = v * v;
    if (Math.random() < p / maxP) pts.push({ x, y, z, p, s: v >= 0 ? 1 : -1 });
  }
  return { pts, bound };
}

function proj(x, y, z, rx, ry, cx, cy, sc) {
  const x1 =  x * Math.cos(ry) + z * Math.sin(ry);
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
  const y1 =  y;
  const y2 =  y1 * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 =  y1 * Math.sin(rx) + z1 * Math.cos(rx);
  const x2 =  x1;
  const d = 24, fov = 2.0;
  const k = fov * d / Math.max(d + z2, 2);
  return [cx + x2 * sc * k, cy - y2 * sc * k, z2];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
const DESC = {
  s: 'Orbital s — sferic. Noduri sferice (n−1 noduri radiale).',
  p: 'Orbital p — doi lobi opuși separați de un nod planar.',
  d: 'Orbital d — structură lobată complexă. Relevant în chimia metalelor.',
};

export default function Orbitals() {
  const [orbId, setOrbId] = useState('1s');
  const [loading, setLoading] = useState(false);
  const [view2D, setView2D] = useState(false);
  
  const canvasRef = useRef(null);
  const rotRef    = useRef({ rx: -0.3, ry: 0.4 });
  const dragRef   = useRef(null);
  const ptsRef    = useRef([]);
  const boundRef  = useRef(12);
  // BUG FIX #2: autoRef starts true and is reset after drag ends
  const autoRef   = useRef(true);
  const zoomRef   = useRef(1.0);
  // For pinch-to-zoom on mobile
  const pinchRef  = useRef(null);

  const orb = ORBS.find(o => o.id === orbId) || ORBS[0];

  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => {
      const res = sampleOrbital(orb);
      ptsRef.current = res.pts;
      boundRef.current = res.bound;
      setLoading(false);
    }, 20);
    return () => clearTimeout(id);
  }, [orbId]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = CW / 2, cy = CH / 2;
    const bound = boundRef.current;
    const zoom = zoomRef.current;

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#020710';
    ctx.fillRect(0, 0, CW, CH);

    if (view2D) {
      const sc2 = (Math.min(CW, CH) / 2 * 0.82) / bound * zoom;
      const { n, l, m, norm, cP, cN } = orb;

      const hexToRgb = (hex) => {
        const h = hex.replace('#','');
        return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
      };
      const [rP, gP, bP] = hexToRgb(cP);
      const [rN, gN, bN] = hexToRgb(cN);

      // Single pass: compute all P=|ψ|² values and signs
      const vals = new Float32Array(CW * CH);
      const signs = new Int8Array(CW * CH);
      for (let py = 0; py < CH; py++) {
        for (let px = 0; px < CW; px++) {
          const wx = (px - cx) / sc2;
          const wz = -(py - cy) / sc2;
          const v = psi(wx, 0, wz, n, l, m, norm);
          const idx = py * CW + px;
          vals[idx] = v * v;
          signs[idx] = v >= 0 ? 1 : -1;
        }
      }

      // vmax = 99.9th percentile (like reference) — prevents bright central peak from crushing contrast
      const sorted = Float32Array.from(vals).sort();
      const vmax = sorted[Math.floor(sorted.length * 0.999)] || 1e-30;

      // PowerNorm: brightness = (P/vmax)^gamma  — same as reference's PowerNorm
      // gamma=0.5 (like exposure=1.0 in reference) lifts low-probability regions so nodes stay visible
      const GAMMA = 0.45;

      const imageData = ctx.createImageData(CW, CH);
      const data = imageData.data;
      for (let i = 0; i < CW * CH; i++) {
        const brightness = Math.min(1, Math.pow(vals[i] / vmax, GAMMA));
        const px4 = i * 4;
        if (signs[i] >= 0) {
          data[px4]   = rP * brightness;
          data[px4+1] = gP * brightness;
          data[px4+2] = bP * brightness;
        } else {
          data[px4]   = rN * brightness;
          data[px4+1] = gN * brightness;
          data[px4+2] = bN * brightness;
        }
        data[px4+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);

      // Axes
      ctx.strokeStyle = '#ffffff20'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(CW, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, CH); ctx.stroke();

      // Scale bar
      const barBohr = Math.max(1, Math.round(bound * 0.35));
      const barPx = barBohr * sc2;
      const bx = 14, by = CH - 16;
      ctx.strokeStyle = '#ffffff66'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + barPx, by); ctx.stroke();
      ctx.fillStyle = '#ffffffaa'; ctx.font = '10px monospace';
      ctx.fillText(`${barBohr} a₀`, bx, by - 5);

      // Legend
      ctx.fillStyle = cP; ctx.fillRect(CW - 68, 10, 10, 10);
      ctx.fillStyle = '#ffffffaa'; ctx.font = '10px monospace';
      ctx.fillText('ψ > 0', CW - 54, 19);
      ctx.fillStyle = cN; ctx.fillRect(CW - 68, 26, 10, 10);
      ctx.fillStyle = '#ffffffaa';
      ctx.fillText('ψ < 0', CW - 54, 35);

    } else {
      const { rx, ry } = rotRef.current;
      const sc = (CW / 2 * 0.78) / bound * zoom;
      const pts = ptsRef.current;
      if (pts.length === 0) return;

      const projected = pts.map(p => {
        const [sx, sy, sz] = proj(p.x, p.y, p.z, rx, ry, cx, cy, sc);
        return { ...p, sx, sy, sz };
      }).sort((a, b) => a.sz - b.sz);

      // BUG FIX #1: use reduce instead of Math.max(...array) to avoid stack overflow
      const maxP = pts.reduce((acc, p) => p.p > acc ? p.p : acc, 1e-30);
      for (const { sx, sy, sz, p, s } of projected) {
        const col = s > 0 ? orb.cP : orb.cN;
        const depth = (sz / (bound * zoom) + 1) / 2;
        const alpha = Math.min(0.9, 0.3 + depth * 0.5);
        ctx.fillStyle = col + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, 2 * PI); ctx.fill();
      }
    }
    // Nucleus
    ctx.fillStyle = '#fde68a';
    ctx.shadowColor = '#fde68a';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(CW/2, CH/2, 4, 0, 2 * PI); ctx.fill();
    ctx.shadowBlur = 0;
  }, [orb, view2D]);

  useEffect(() => {
    let frame;
    const tick = () => {
      if (autoRef.current && !dragRef.current && !view2D) rotRef.current.ry += 0.005;
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draw, view2D]);

  // ── Mouse handlers ──────────────────────────────────────────
  const onMouseDown = (e) => {
    autoRef.current = false;
    const r = canvasRef.current.getBoundingClientRect();
    dragRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, ...rotRef.current };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    rotRef.current.ry = dragRef.current.ry + (e.clientX - r.left - dragRef.current.x) * 0.01;
    rotRef.current.rx = dragRef.current.rx + (e.clientY - r.top - dragRef.current.y) * 0.01;
  };
  const onMouseUp = () => {
    dragRef.current = null;
    // BUG FIX #2: resume auto-rotation after drag ends
    autoRef.current = true;
  };

  // BUG FIX #4: Wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    zoomRef.current = Math.max(0.3, Math.min(4, zoomRef.current * (e.deltaY < 0 ? 1.1 : 0.9)));
  };

  // BUG FIX #3: Touch handlers for mobile
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      autoRef.current = false;
      const t = e.touches[0];
      const r = canvasRef.current.getBoundingClientRect();
      dragRef.current = { x: t.clientX - r.left, y: t.clientY - r.top, ...rotRef.current };
      pinchRef.current = null;
    } else if (e.touches.length === 2) {
      dragRef.current = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.sqrt(dx*dx + dy*dy), zoom: zoomRef.current };
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      const r = canvasRef.current.getBoundingClientRect();
      rotRef.current.ry = dragRef.current.ry + (t.clientX - r.left - dragRef.current.x) * 0.01;
      rotRef.current.rx = dragRef.current.rx + (t.clientY - r.top - dragRef.current.y) * 0.01;
    } else if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      zoomRef.current = Math.max(0.3, Math.min(4, pinchRef.current.zoom * (dist / pinchRef.current.dist)));
    }
  };
  const onTouchEnd = () => {
    dragRef.current = null;
    pinchRef.current = null;
    // BUG FIX #2: resume auto-rotation after touch ends
    autoRef.current = true;
  };

  return (
    <div style={{ background: '#020710', minHeight: '100vh', color: '#e0e8f0', fontFamily: 'monospace', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: 10, textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: orb.cP }}>{orb.lbl} Orbital</h2>
        <div style={{ fontSize: 10, opacity: 0.5 }}>n={orb.n}, l={orb.l}, m={orb.m}</div>
      </div>

      <div style={{ position: 'relative', border: `1px solid ${orb.cP}33`, borderRadius: 12, overflow: 'hidden' }}>
        <canvas 
          ref={canvasRef} width={CW} height={CH}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: 'grab', touchAction: 'none', display: 'block' }}
        />
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020710aa', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${orb.cP}44`, borderTop: `3px solid ${orb.cP}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Calculare...</span>
          </div>
        )}
        
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView2D(!view2D)}
            style={{ background: '#ffffff11', border: '1px solid #ffffff22', color: 'white', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
          >
            {view2D ? 'Mod 3D' : 'Mod 2D'}
          </button>
          <button
            onClick={() => { zoomRef.current = 1; rotRef.current = { rx: -0.3, ry: 0.4 }; autoRef.current = true; }}
            style={{ background: '#ffffff11', border: '1px solid #ffffff22', color: 'white', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
          >
            Reset
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10, opacity: 0.35 }}>
          🖱 drag · scroll zoom · 📱 swipe · pinch zoom
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
        {ORBS.map(o => (
          <button key={o.id} onClick={() => setOrbId(o.id)} style={{
            background: o.id === orbId ? o.cP : '#060e1e',
            color: o.id === orbId ? '#000' : '#fff',
            border: `1px solid ${o.id === orbId ? o.cP : '#ffffff22'}`,
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 13
          }}>{o.lbl}</button>
        ))}
      </div>

      <p style={{ maxWidth: 400, textAlign: 'center', fontSize: 12, opacity: 0.7, marginTop: 20 }}>
        {DESC[orb.sub]} <br/>
        <small>Bazat pe ecuația Schrödinger, eșantionat prin metoda Monte Carlo.</small>
      </p>
    </div>
  );
}
