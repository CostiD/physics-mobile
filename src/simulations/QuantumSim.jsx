import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Physical Constants ─────────────────────────────────── */
const h  = 6.626e-34;
const me = 9.109e-31;
const EV = 1.602e-19;

/* ─── Google Fonts ──────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";
document.head.appendChild(fontLink);

/* ─── Global CSS ────────────────────────────────────────── */
const style = document.createElement("style");
style.textContent = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #030812; --bg2: #080f1e; --bg3: #0c1628;
  --cyan: #00f0ff; --cyan2: #00a8c8;
  --gold: #f5c842; --purple: #a855f7;
  --red: #ff4d6d; --green: #34d399;
  --border: rgba(0,240,255,0.15);
  --text: #c8dff0; --dim: #5a7a9a;
  --font-head: 'Rajdhani', sans-serif;
  --font-mono: 'Space Mono', monospace;
}
input[type=range] {
  -webkit-appearance:none; width:100%; height:4px;
  background:var(--bg3); border-radius:2px; outline:none;
  border:1px solid var(--border);
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance:none; width:18px; height:18px;
  border-radius:50%; background:var(--cyan);
  box-shadow:0 0 10px var(--cyan); cursor:pointer;
}
@keyframes fade-in {
  from{opacity:0;transform:translateY(10px)}
  to{opacity:1;transform:translateY(0)}
}
.fade-in{animation:fade-in 0.45s ease forwards}
.panel{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px}
.formula-box{
  background:var(--bg3);border:1px solid var(--border);
  border-radius:8px;padding:14px 20px;
  font-family:var(--font-mono);color:var(--cyan);font-size:.9rem;
  text-align:center;
}
.tab-btn{transition:all .25s}
.tab-btn:hover{background:rgba(0,240,255,.08)!important}
.tab-btn.active{background:rgba(0,240,255,.15)!important;border-color:var(--cyan)!important;color:var(--cyan)!important}
`;
document.head.appendChild(style);

/* ─── Physics helpers ───────────────────────────────────── */
function physicsFromEV(ev) {
  const E = ev * EV;
  const v = Math.sqrt(2 * E / me);
  const p = me * v;
  const lambda = h / p;
  const lambdaNm = lambda * 1e9;
  return { E, v, p, lambda, lambdaNm };
}

function sciStr(x, sig = 3) {
  if (!x) return "0";
  const exp = Math.floor(Math.log10(Math.abs(x)));
  return `${(x / 10 ** exp).toFixed(sig - 1)} × 10^${exp}`;
}

/* ══════════════════════════════════════════════════════════
   TAB 1 — De Broglie
══════════════════════════════════════════════════════════ */
function DeBroglieTab() {
  const [energy, setEnergy] = useState(50);
  const canvasRef = useRef(null);
  const animRef   = useRef(0);
  const phaseRef  = useRef(0);

  const phys = physicsFromEV(energy);

  const lambdaPx = Math.round(
    220 * Math.pow(18 / 220, (energy - 1) / 499)
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cy = H / 2;

    ctx.fillStyle = "#030812";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(0,240,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const amp = 52;

    const waveGrad = ctx.createLinearGradient(0, cy - amp, 0, cy + amp);
    waveGrad.addColorStop(0,   "rgba(0,240,255,0.95)");
    waveGrad.addColorStop(0.5, "rgba(168,85,247,0.7)");
    waveGrad.addColorStop(1,   "rgba(0,240,255,0.95)");

    ctx.beginPath();
    ctx.strokeStyle = waveGrad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 14;
    for (let x = 0; x <= W; x++) {
      const y = cy + amp * Math.sin(2 * Math.PI * x / lambdaPx - phaseRef.current);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    const envW = W * 0.22;
    const envCx = ((phaseRef.current / (2 * Math.PI)) * lambdaPx) % W;
    const drawEnv = (cx) => {
      const g = ctx.createLinearGradient(cx - envW, 0, cx + envW, 0);
      g.addColorStop(0,   "rgba(0,240,255,0)");
      g.addColorStop(0.5, "rgba(0,240,255,0.14)");
      g.addColorStop(1,   "rgba(0,240,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, envW, amp + 22, 0, 0, 2 * Math.PI);
      ctx.fill();
    };
    drawEnv(envCx);
    if (envCx < envW) drawEnv(envCx + W);
    if (envCx > W - envW) drawEnv(envCx - W);

    const dotX = ((phaseRef.current / (2 * Math.PI)) * lambdaPx % (W + 40) + W + 40) % (W + 40);
    const dotY = cy + amp * Math.sin(2 * Math.PI * dotX / lambdaPx - phaseRef.current);
    ctx.beginPath(); ctx.arc(dotX, dotY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#f5c842";
    ctx.shadowColor = "#f5c842"; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;

    const bx = (dotX + 40) % (W - lambdaPx - 20);
    if (bx > 10 && bx + lambdaPx < W - 10) {
      const by = cy - amp - 20;
      ctx.strokeStyle = "rgba(245,200,66,0.65)"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + lambdaPx, by); ctx.stroke();
      ctx.setLineDash([]);
      [[bx, 1], [bx + lambdaPx, -1]].forEach(([x, dir]) => {
        ctx.beginPath(); ctx.moveTo(x, by);
        ctx.lineTo(x + dir*7, by - 5); ctx.lineTo(x + dir*7, by + 5);
        ctx.closePath(); ctx.fillStyle = "rgba(245,200,66,0.8)"; ctx.fill();
      });
      ctx.fillStyle = "#f5c842"; ctx.font = "bold 13px 'Space Mono'";
      ctx.fillText("λ", bx + lambdaPx/2 - 5, by - 8);
    }

    ctx.fillStyle = "rgba(0,240,255,0.35)"; ctx.font = "11px 'Space Mono'";
    ctx.fillText(`λ_real = ${phys.lambdaNm.toFixed(3)} nm  |  scală logaritmică pentru vizualizare`, 14, H - 12);

    phaseRef.current += 0.038;
    animRef.current = requestAnimationFrame(draw);
  }, [lambdaPx, phys.lambdaNm]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="panel">
        <h3 style={{ fontFamily:"var(--font-head)", color:"var(--cyan)", fontSize:"1.2rem", marginBottom:8 }}>
          〜 Ipoteza de Broglie (1924)
        </h3>
        <p style={{ color:"var(--text)", fontSize:"0.88rem", lineHeight:1.75 }}>
          Louis de Broglie a propus că <strong style={{color:"var(--gold)"}}>orice particulă cu moment cinetic p</strong> are
          asociată o lungime de undă λ. Nu doar fotonii sunt unde —
          și electronii, protonii, chiar atomii au natură ondulată!
        </p>
        <div className="formula-box" style={{marginTop:12}}>
          <span style={{color:"var(--gold)"}}>λ</span>
          {" = "}
          <span style={{color:"var(--cyan)"}}>h</span>
          {" / "}
          <span style={{color:"var(--purple)"}}>p</span>
          {" = "}
          <span style={{color:"var(--cyan)"}}>h</span>
          {" / (m · v)"}
        </div>
        <p style={{ color:"var(--dim)", fontSize:"0.78rem", marginTop:10, lineHeight:1.6 }}>
          ⚠️ <em>λ reală a unui electron (≈ 0.1 nm) e sub limita de rezoluție vizuală.
          Animația folosește <strong style={{color:"var(--cyan)"}}>scară logaritmică</strong> — proporțiile relative sunt corecte.</em>
        </p>
      </div>

      <div className="panel" style={{padding:0, overflow:"hidden", position:"relative"}}>
        <canvas ref={canvasRef} width={680} height={200} style={{width:"100%",height:"auto"}} />
        <div style={{
          position:"absolute", top:10, right:12,
          background:"rgba(3,8,18,0.85)", border:"1px solid var(--border)",
          borderRadius:8, padding:"7px 14px",
          display:"flex", gap:16, fontSize:"0.78rem", fontFamily:"var(--font-mono)"
        }}>
          <span style={{color:"#f5c842"}}>● electron</span>
          <span style={{color:"#a855f7"}}>〜 ψ(x)</span>
        </div>
      </div>

      <div className="panel">
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:10}}>
          <span style={{fontFamily:"var(--font-head)", color:"var(--text)"}}>Energie cinetică</span>
          <span style={{fontFamily:"var(--font-mono)", color:"var(--gold)"}}>{energy} eV</span>
        </div>
        <input type="range" min={1} max={500} value={energy} onChange={e=>setEnergy(+e.target.value)} />
        <div style={{display:"flex", justifyContent:"space-between", marginTop:4, fontSize:"0.72rem", color:"var(--dim)"}}>
          <span>1 eV — undă lungă</span>
          <span>500 eV — undă scurtă</span>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12}}>
        {[
          {label:"λ de Broglie", val:phys.lambdaNm.toFixed(4)+" nm", sub:sciStr(phys.lambda)+" m", c:"var(--cyan)"},
          {label:"Viteză v",     val:(phys.v/3e8*100).toFixed(2)+"% c", sub:sciStr(phys.v,3)+" m/s", c:"var(--purple)"},
          {label:"Moment p",     val:sciStr(phys.p,3), sub:"kg · m/s", c:"var(--gold)"},
        ].map(({label,val,sub,c})=>(
          <div key={label} className="panel" style={{textAlign:"center"}}>
            <div style={{color:"var(--dim)", fontSize:"0.7rem", marginBottom:6, fontFamily:"var(--font-head)"}}>{label}</div>
            <div style={{color:c, fontSize:"0.88rem", fontFamily:"var(--font-mono)", fontWeight:700}}>{val}</div>
            <div style={{color:"var(--dim)", fontSize:"0.68rem", marginTop:4, fontFamily:"var(--font-mono)"}}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{background:"rgba(168,85,247,0.07)", borderColor:"rgba(168,85,247,0.3)"}}>
        <p style={{color:"var(--text)", fontSize:"0.85rem", lineHeight:1.75}}>
          🔍 <strong style={{color:"var(--purple)"}}>Observă:</strong> Mută sliderul de la 1 → 500 eV.
          Unda se comprimă dramatic — λ scade, frecvența crește vizibil.
          La <strong style={{color:"var(--gold)"}}>~150 eV</strong>, λ ≈ 0.1 nm = distanța interatomică în cristale —
          de aceea difracția pe cristale a confirmat ipoteza!
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 2 — Davisson-Germer Diffraction
══════════════════════════════════════════════════════════ */
function DiffractionTab() {
  const [energy, setEnergy] = useState(54);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef(null);
  const timerRef  = useRef(null);
  const dotsRef   = useRef([]);
  const runRef    = useRef(false);
  const [dotCount, setDotCount] = useState(0);

  const { lambdaNm } = physicsFromEV(energy);
  const d = 0.215;

  function rings(R) {
    const out = [];
    for (let n = 1; n <= 4; n++) {
      const sinT = (n * lambdaNm) / (2 * d);
      if (sinT >= 1) break;
      out.push({ n, r: R * Math.sin(Math.asin(sinT)) * 2.7, w: 1 / n });
    }
    return out;
  }

  function addDots() {
    if (!runRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    const R = Math.min(W,H)*0.38;
    const rs = rings(R);
    if (!rs.length) { timerRef.current = setTimeout(addDots, 60); return; }

    const total = rs.reduce((s,r)=>s+r.w, 0);
    const batch = [];
    for (let i = 0; i < 7; i++) {
      let rand = Math.random()*total, chosen = rs[0];
      for (const ring of rs) { if (rand < ring.w){chosen=ring;break;} rand-=ring.w; }
      const angle = Math.random()*2*Math.PI;
      const spread = chosen.r*0.055;
      const r = chosen.r+(Math.random()-.5)*spread*2;
      batch.push({ x:cx+r*Math.cos(angle), y:cy+r*Math.sin(angle), n:chosen.n });
    }
    dotsRef.current = [...dotsRef.current, ...batch].slice(-2400);
    setDotCount(dotsRef.current.length);
    timerRef.current = setTimeout(addDots, 38);
  }

  const toggle = () => {
    runRef.current = !runRef.current; setRunning(runRef.current);
    if (runRef.current) addDots(); else clearTimeout(timerRef.current);
  };
  const reset = () => {
    runRef.current=false; setRunning(false);
    clearTimeout(timerRef.current);
    dotsRef.current=[]; setDotCount(0);
  };
  useEffect(()=>{ reset(); }, [energy]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;
    const R=Math.min(W,H)*0.38;

    ctx.fillStyle="#030812"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(0,240,255,0.04)";
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

    const COLS=["#00f0ff","#a855f7","#f5c842","#34d399"];
    const rs=rings(R);

    rs.forEach(({r,n},i)=>{
      ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI);
      ctx.strokeStyle=COLS[i%COLS.length]+"33"; ctx.lineWidth=1.5;
      ctx.setLineDash([4,6]); ctx.stroke(); ctx.setLineDash([]);
    });

    dotsRef.current.forEach(dot=>{
      const c=COLS[(dot.n-1)%COLS.length];
      ctx.beginPath(); ctx.arc(dot.x,dot.y,1.8,0,2*Math.PI);
      ctx.fillStyle=c+"cc"; ctx.shadowColor=c; ctx.shadowBlur=4; ctx.fill();
    });
    ctx.shadowBlur=0;

    ctx.beginPath(); ctx.arc(cx,cy,5,0,2*Math.PI);
    ctx.fillStyle="#f5c842"; ctx.shadowColor="#f5c842"; ctx.shadowBlur=18; ctx.fill(); ctx.shadowBlur=0;

    rs.forEach(({r,n},i)=>{
      ctx.fillStyle=COLS[i%COLS.length]+"99"; ctx.font="11px 'Space Mono'";
      ctx.fillText(`n=${n}`,cx+r*0.72,cy-r*0.72);
    });

    ctx.fillStyle="rgba(0,240,255,0.4)"; ctx.font="11px 'Space Mono'";
    ctx.fillText(`${dotsRef.current.length} electroni`,14,22);
  }, [dotCount, energy]);

  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="panel">
        <h3 style={{fontFamily:"var(--font-head)",color:"var(--cyan)",fontSize:"1.2rem",marginBottom:8}}>
          ◎ Difracția electronilor — Davisson &amp; Germer (1927)
        </h3>
        <p style={{color:"var(--text)",fontSize:"0.88rem",lineHeight:1.75}}>
          Electronii accelerați cad pe o rețea cristalină de <strong style={{color:"var(--gold)"}}>Nichel</strong> (d = 0.215 nm).
          Ca orice undă, se difractă și formează inele concentrice — exact ca razele X.
          Fiecare punct = un electron individual.
        </p>
        <div className="formula-box" style={{marginTop:12}}>
          Condiția Bragg: &nbsp;
          <span style={{color:"var(--gold)"}}>2d · sin θ = n · λ</span>
        </div>
      </div>

      <div className="panel" style={{padding:0,overflow:"hidden"}}>
        <canvas ref={canvasRef} width={500} height={440} style={{width:"100%",height:"auto"}} />
      </div>

      <div className="panel">
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <button onClick={toggle} style={{
            flex:1,padding:"10px",borderRadius:8,border:"1px solid",cursor:"pointer",
            borderColor:running?"#ff4d6d":"var(--cyan)",
            background:running?"rgba(255,77,109,.15)":"rgba(0,240,255,.12)",
            color:running?"#ff4d6d":"var(--cyan)",
            fontFamily:"var(--font-head)",fontSize:"1rem",fontWeight:700
          }}>{running?"⏸ Pauză":"▶ Lansează electroni"}</button>
          <button onClick={reset} style={{
            padding:"10px 18px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",
            background:"rgba(255,255,255,.04)",color:"var(--dim)",
            fontFamily:"var(--font-head)",fontSize:"1rem",cursor:"pointer"
          }}>↺</button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontFamily:"var(--font-head)",color:"var(--text)"}}>Energie</span>
          <span style={{fontFamily:"var(--font-mono)",color:"var(--gold)"}}>{energy} eV — λ = {lambdaNm.toFixed(3)} nm</span>
        </div>
        <input type="range" min={10} max={300} value={energy} onChange={e=>setEnergy(+e.target.value)} />
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:"0.72rem",color:"var(--dim)"}}>
          <span>10 eV</span>
          <span style={{color:"var(--green)"}}>54 eV ← original Davisson-Germer</span>
          <span>300 eV</span>
        </div>
      </div>

      <div className="panel" style={{background:"rgba(245,200,66,.06)",borderColor:"rgba(245,200,66,.3)"}}>
        <p style={{color:"var(--text)",fontSize:"0.85rem",lineHeight:1.75}}>
          ✨ <strong style={{color:"var(--gold)"}}>Feynman:</strong> <em>"Electronii se comportă exact ca lumina."</em> —
          Fiecare punct e detectat ca particulă, dar distribuția lor urmează exact un model de undă.
          Schimbă energia și observă cum inelele se lărgesc sau se strâng!
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 3 — Double Slit  (Feynman Vol.III Cap.1)

   FIX: Water waves folosesc calcul analitic cu DOUĂ surse
   coerente (principiul Huygens). Fiecare fantă = sursă de unde
   circulare. Interferența e calculată pixel cu pixel:
     val = att1·cos(k·r1 − ωt) + att2·cos(k·r2 − ωt)
   Franjele negre apar natural prin anulare, fără simulare FDTD.
══════════════════════════════════════════════════════════ */
const W_DS = 700, H_DS = 460;
const SRC_X  = 32;
const SLIT_X = 230;
const SCRN_X = 480;
const CURVE_X = 530;
const CURVE_W = 140;
const CY     = H_DS / 2;
const SLIT1  = CY - 38;
const SLIT2  = CY + 38;
const SLIT_H = 16;

// Wave parameters — tuned for 4-6 visible fringes
const WAVE_K     = 0.22;   // wavenumber: λ_px ≈ 28.6 px → spacing ~95px
const WAVE_OMEGA = 0.10;   // angular frequency (smooth, stable animation)

function probBullets(y) {
  const sig2 = 12000;
  const G = yc => { const d = y - yc; return Math.exp(-d*d / sig2); };
  return Math.min(1, (G(SLIT1) + G(SLIT2)) * 0.55);
}

// Two-source time-averaged intensity at screen x=SCRN_X
// with Gaussian diffraction envelope (approximates single-slit sinc²)
function probWaterScreen(y) {
  const dx = SCRN_X - SLIT_X;
  const dy1 = y - SLIT1, dy2 = y - SLIT2;
  const r1 = Math.sqrt(dx*dx + dy1*dy1);
  const r2 = Math.sqrt(dx*dx + dy2*dy2);
  const att1 = Math.min(2.2, 20 / Math.sqrt(Math.max(r1, 1)));
  const att2 = Math.min(2.2, 20 / Math.sqrt(Math.max(r2, 1)));
  // <(h1+h2)²> = att1²/2 + att2²/2 + att1·att2·cos(k·Δr)
  const I = 0.5*(att1*att1 + att2*att2) + att1*att2*Math.cos(WAVE_K*(r1-r2));
  // Gaussian envelope: approximates single-slit diffraction sinc²
  const distFromCenter = y - CY;
  const envelope = Math.exp(-Math.pow(distFromCenter / 155, 2));
  const maxI = 0.5*(att1+att2)*(att1+att2);
  return Math.max(0, Math.min(1, I * envelope / Math.max(maxI, 0.001)));
}

function probInterference(y) {
  return probWaterScreen(y); // electrons use same physics formula
}

function DoubleSlit() {
  const [experiment, setExperiment] = useState("bullets");
  const [watching,   setWatching]   = useState(false);
  const [running,    setRunning]    = useState(false);
  const [dotCount,   setDotCount]   = useState(0);

  const canvasRef    = useRef(null);
  const rafRef       = useRef(null);
  const dotTimerRef  = useRef(null);
  const dotsRef      = useRef([]);
  const runRef       = useRef(false);
  const expRef       = useRef("bullets");
  const watchRef     = useRef(false);
  const frameRef     = useRef(0);

  useEffect(() => { expRef.current  = experiment; }, [experiment]);
  useEffect(() => { watchRef.current = watching;  }, [watching]);

  // Sampling for dots
  function sampleY(fn) {
    for (let tries = 0; tries < 200; tries++) {
      const y = Math.random() * H_DS;
      if (Math.random() < fn(y)) return y;
    }
    return Math.random() * H_DS;
  }

  function emitDots() {
    if (!runRef.current) return;
    const exp   = expRef.current;
    const watch = watchRef.current;
    if (exp === "water") { dotTimerRef.current = setTimeout(emitDots, 50); return; }
    const fn    = (exp === "electrons" && !watch) ? probInterference : probBullets;
    const color = exp === "bullets" ? "#f5c842" : watch ? "#ff4d6d" : "#a855f7";
    const batch = [];
    for (let i = 0; i < 5; i++) {
      batch.push({ x: SCRN_X + (Math.random() - 0.5) * 6, y: sampleY(fn), color });
    }
    dotsRef.current = [...dotsRef.current, ...batch].slice(-3500);
    setDotCount(dotsRef.current.length);
    dotTimerRef.current = setTimeout(emitDots, 28);
  }

  // ══ WATER WAVE: pixel-by-pixel analytic two-source interference ══
  function drawWater(ctx, t) {
    const imgData = ctx.createImageData(W_DS, H_DS);
    const dat = imgData.data;

    // Set all alpha = 255 upfront
    for (let i = 3; i < dat.length; i += 4) dat[i] = 255;

    for (let py = 0; py < H_DS; py++) {
      for (let px = 0; px < W_DS; px++) {
        // Don't paint screen area — drawn as curve after
        if (px >= SCRN_X) continue;

        // Skip barrier zone (drawn as rect later)
        if (px >= SLIT_X - 5 && px <= SLIT_X + 5) continue;

        // Check if pixel is in slit opening (for barrier zone)
        if (px >= SLIT_X - 5 && px <= SLIT_X + 5) {
          const inSlit1 = py >= SLIT1 - SLIT_H/2 && py <= SLIT1 + SLIT_H/2;
          const inSlit2 = py >= SLIT2 - SLIT_H/2 && py <= SLIT2 + SLIT_H/2;
          if (!inSlit1 && !inSlit2) continue;
        }

        const idx4 = (py * W_DS + px) * 4;
        let val = 0;

        if (px < SLIT_X - 5) {
          // ── LEFT of barrier: incoming plane wave from source ──
          const dx = px - SRC_X;
          if (dx > 0) {
            // Quasi-plane wave with subtle cylindrical spread
            const dy = (py - CY) * 0.12;
            const r = Math.sqrt(dx*dx + dy*dy);
            const att = Math.min(1.0, 14 / Math.sqrt(Math.max(r, 1)));
            val = att * Math.cos(WAVE_K * dx - WAVE_OMEGA * t);
          }
        } else {
          // ── RIGHT of barrier: two coherent point sources at slits ──
          const dx = px - SLIT_X;
          const dy1 = py - SLIT1;
          const dy2 = py - SLIT2;
          const r1 = Math.sqrt(dx*dx + dy1*dy1);
          const r2 = Math.sqrt(dx*dx + dy2*dy2);

          const att1 = r1 > 1 ? Math.min(2.2, 20 / Math.sqrt(r1)) : 2.2;
          const att2 = r2 > 1 ? Math.min(2.2, 20 / Math.sqrt(r2)) : 2.2;

          // Gaussian envelope: lateral maxima progressively dimmer
          const env = Math.exp(-Math.pow((py - CY) / 160, 2));

          val = (att1 * Math.cos(WAVE_K * r1 - WAVE_OMEGA * t) +
                 att2 * Math.cos(WAVE_K * r2 - WAVE_OMEGA * t)) * 0.52 * env;
        }

        // ── Color mapping ──────────────────────────────────────────
        // Positive → cyan (crest), Negative → purple (trough), ~0 → black (dark fringe)
        const v = Math.max(-1.0, Math.min(1.0, val));
        const av = Math.abs(v);
        if (av > 0.08) {
          const bright = Math.pow(av, 0.5); // gamma boost for mid-range
          if (v > 0) {
            // Cyan
            dat[idx4]   = Math.round(bright * 18);
            dat[idx4+1] = Math.round(bright * 228);
            dat[idx4+2] = Math.round(bright * 255);
          } else {
            // Purple/magenta
            dat[idx4]   = Math.round(bright * 195);
            dat[idx4+1] = Math.round(bright * 18);
            dat[idx4+2] = Math.round(bright * 240);
          }
        }
        // else: stays black = destructive interference fringe
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // ── Intensity curve on screen area ──────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.rect(SCRN_X, 0, W_DS - SCRN_X, H_DS);
    ctx.clip();
    ctx.beginPath();
    for (let py = 0; py < H_DS; py++) {
      const norm = probWaterScreen(py);
      const cx2 = CURVE_X + norm * CURVE_W;
      py === 0 ? ctx.moveTo(cx2, py) : ctx.lineTo(cx2, py);
    }
    ctx.strokeStyle = "rgba(100,230,255,0.95)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── rAF draw loop ──────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const exp   = expRef.current;
    const watch = watchRef.current;
    const t     = frameRef.current;

    // Background
    ctx.fillStyle = "#030812";
    ctx.fillRect(0, 0, W_DS, H_DS);

    // Grid
    ctx.strokeStyle = "rgba(0,240,255,0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W_DS; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H_DS); ctx.stroke(); }
    for (let y = 0; y < H_DS; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W_DS,y); ctx.stroke(); }

    // ── WATER ─────────────────────────────────────────────────────
    if (exp === "water") {
      drawWater(ctx, t);
      frameRef.current = t + 1;
    }

    // ── BULLETS / ELECTRONS: trajectory lines ─────────────────────
    if (exp !== "water") {
      const srcColor = exp === "bullets" ? "#f5c842" : "#a855f7";
      ctx.strokeStyle = srcColor + "40";
      ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
      [SLIT1, SLIT2].forEach(sy => {
        ctx.beginPath(); ctx.moveTo(SRC_X + 10, CY); ctx.lineTo(SLIT_X - 4, sy); ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // ── BARRIER ───────────────────────────────────────────────────
    [[0, SLIT1 - SLIT_H/2], [SLIT1 + SLIT_H/2, SLIT2 - SLIT_H/2], [SLIT2 + SLIT_H/2, H_DS]]
      .forEach(([y0, y1]) => {
        ctx.fillStyle = "#0d1a2e";
        ctx.strokeStyle = "rgba(0,240,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.fillRect(SLIT_X - 5, y0, 10, y1 - y0);
        ctx.strokeRect(SLIT_X - 5, y0, 10, y1 - y0);
      });
    ctx.fillStyle = "rgba(0,240,255,0.7)";
    ctx.font = "11px 'Space Mono'";
    ctx.fillText("S\u2081", SLIT_X + 9, SLIT1 + 5);
    ctx.fillText("S\u2082", SLIT_X + 9, SLIT2 + 5);

    // ── SCREEN ────────────────────────────────────────────────────
    const scrColor = exp === "bullets" ? "#f5c842" : exp === "water" ? "#00cfff" : (watch ? "#ff4d6d" : "#a855f7");
    const sg = ctx.createLinearGradient(SCRN_X, 0, SCRN_X + 5, 0);
    sg.addColorStop(0, scrColor + "88"); sg.addColorStop(1, scrColor + "11");
    ctx.fillStyle = sg; ctx.fillRect(SCRN_X, 0, 5, H_DS);

    // ── DOTS ──────────────────────────────────────────────────────
    if (exp !== "water") {
      dotsRef.current.forEach(dot => {
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 2, 0, 2*Math.PI);
        ctx.fillStyle = dot.color + "dd";
        ctx.shadowColor = dot.color; ctx.shadowBlur = 5; ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Distribution curve
      const fn2 = (exp === "electrons" && !watch) ? probInterference : probBullets;
      const curveColor = exp === "bullets" ? "#f5c842" : watch ? "#ff4d6d" : "#a855f7";
      ctx.beginPath();
      for (let py = 0; py < H_DS; py++) {
        const cx2 = CURVE_X + fn2(py) * CURVE_W;
        py === 0 ? ctx.moveTo(cx2, py) : ctx.lineTo(cx2, py);
      }
      ctx.strokeStyle = curveColor + "cc";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = curveColor; ctx.shadowBlur = 8;
      ctx.stroke(); ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(0,240,255,0.4)"; ctx.font = "11px 'Space Mono'";
      ctx.fillText(`${dotsRef.current.length}`, 12, 22);
    }

    // ── SOURCE ────────────────────────────────────────────────────
    const srcCol = exp === "bullets" ? "#f5c842" : exp === "water" ? "#40c4ff" : "#a855f7";
    ctx.beginPath(); ctx.arc(SRC_X, CY, 8, 0, 2*Math.PI);
    ctx.fillStyle = srcCol; ctx.shadowColor = srcCol; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "10px 'Space Mono'";
    ctx.fillText(exp === "bullets" ? "GUN" : exp === "water" ? "WAVE" : "GUN", SRC_X - 14, CY + 20);

    // ── DETECTOR glow ─────────────────────────────────────────────
    if (exp === "electrons" && watch) {
      [SLIT1, SLIT2].forEach(sy => {
        const rg = ctx.createRadialGradient(SLIT_X, sy, 0, SLIT_X, sy, 55);
        rg.addColorStop(0, "rgba(255,77,109,0.5)"); rg.addColorStop(1, "rgba(255,77,109,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(SLIT_X, sy, 55, 0, 2*Math.PI); ctx.fill();
      });
      ctx.fillStyle = "#ff4d6d"; ctx.font = "bold 10px 'Space Mono'";
      ctx.fillText("PHOTON DETECTOR", SLIT_X - 60, SLIT1 - 26);
    }

    // Formula label
    ctx.fillStyle = scrColor + "cc"; ctx.font = "bold 11px 'Space Mono'";
    const formula = exp === "bullets" ? "P\u2081\u2082 = P\u2081 + P\u2082"
      : exp === "water" ? "I\u2081\u2082 = |h\u2081 + h\u2082|\u00b2"
      : (watch ? "P'\u2081\u2082 = P'\u2081 + P'\u2082" : "P\u2081\u2082 = |\u03c6\u2081 + \u03c6\u2082|\u00b2");
    ctx.fillText(formula, CURVE_X + 4, H_DS - 10);

    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  const toggle = () => {
    runRef.current = !runRef.current;
    setRunning(runRef.current);
    if (runRef.current) emitDots(); else clearTimeout(dotTimerRef.current);
  };
  const reset = () => {
    runRef.current = false; setRunning(false);
    clearTimeout(dotTimerRef.current);
    dotsRef.current = []; setDotCount(0);
    frameRef.current = 0;
  };
  useEffect(() => { reset(); }, [experiment, watching]);

  const EXPS = [
    { key:"bullets",    label:"\u2460 Gloan\u021be",    color:"var(--gold)"   },
    { key:"water",      label:"\u2461 Unde (ap\u0103)", color:"var(--cyan)"   },
    { key:"electrons",  label:"\u2462 Electroni",       color:"var(--purple)" },
  ];

  const info = {
    bullets: {
      title: "Gloan\u021be \u2014 particul\u0103 clasic\u0103. F\u0103r\u0103 interferen\u021b\u0103.",
      body:  'Feynman (Fig. 1-1): Gloan\u021bele trec printr-o singur\u0103 fant\u0103. Distribu\u021bia final\u0103 P\u2081\u2082 = P\u2081 + P\u2082 \u2014 suma a dou\u0103 bumps gaussiene. Nu exist\u0103 franje. Comportament pur de particul\u0103.',
      color: "var(--gold)",
    },
    water: {
      title: "Unde de ap\u0103 \u2014 interferen\u021b\u0103 clasic\u0103.",
      body:  'Feynman (Fig. 1-2): Undele trec prin AMBELE fante simultan. Fiecare fant\u0103 = surs\u0103 de unde circulare (Huygens). Suprapunerea d\u0103 I\u2081\u2082 = |h\u2081 + h\u2082|\u00b2 \u2014 maxime (cyan/violet) \u015fi franje negre reale. Zonele negre = anulare complet\u0103, nu lips\u0103 de lumin\u0103.',
      color: "var(--cyan)",
    },
    electrons: {
      title: watching
        ? "\u26a0\ufe0f Detector activ \u2014 franjele DISPAR!"
        : "Electroni \u2014 acela\u015fi model ca undele!",
      body: watching
        ? 'Feynman (Fig. 1-4): Ad\u0103ug\u0103m o surs\u0103 de lumin\u0103 la fante. Putem vedea prin care fant\u0103 trece electronul \u2014 dar franjele dispar! P\'\u2081\u2082 = P\'\u2081 + P\'\u2082, ca gloan\u021bele. Actul de observa\u021bie distruge interferen\u021ba. Nu din cauza tehnologiei \u2014 din principiu (Heisenberg).'
        : 'Feynman (Fig. 1-3): Electronii lovesc ecranul unul c\xE2te unul, ca ni\u015fte gloan\u021be \u2014 dar distribu\u021bia P\u2081\u2082 = |\u03c6\u2081 + \u03c6\u2082|\u00b2 arat\u0103 franje, ca undele! Electronul "interfer\u0103 cu sine \xEEnsu\u015fi". Mister pur cuantic.',
      color: watching ? "var(--red)" : "var(--purple)",
    },
  };
  const cur = info[experiment];

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="panel">
        <h3 style={{ fontFamily:"var(--font-head)", color:"var(--cyan)", fontSize:"1.2rem", marginBottom:8 }}>
          &#x27FA; Cele trei experimente ale lui Feynman (Vol. III, Cap. 1)
        </h3>
        <p style={{ color:"var(--text)", fontSize:"0.88rem", lineHeight:1.75 }}>
          Feynman introduce mecanica cuantic&#x103; compar&#xE2;nd trei experimente cu dubla fant&#x103;:
          <strong style={{color:"var(--gold)"}}> gloan&#x21B;e</strong> (particul&#x103; clasic&#x103;),
          <strong style={{color:"var(--cyan)"}}> unde de ap&#x103;</strong> (und&#x103; clasic&#x103;) &#x15F;i
          <strong style={{color:"var(--purple)"}}> electroni</strong> (mister cuantic).
        </p>
      </div>

      <div style={{ display:"flex", gap:8 }}>
        {EXPS.map(({ key, label, color }) => (
          <button key={key}
            className={`tab-btn ${experiment===key?"active":""}`}
            onClick={() => setExperiment(key)}
            style={{
              flex:1, padding:"9px 4px", borderRadius:8, cursor:"pointer",
              border:`1px solid ${experiment===key ? color : "var(--border)"}`,
              background: experiment===key ? `${color}22` : "var(--bg3)",
              color: experiment===key ? color : "var(--dim)",
              fontFamily:"var(--font-head)", fontSize:"0.82rem", fontWeight:600,
            }}>{label}</button>
        ))}
      </div>

      <div className="panel" style={{ padding:0, overflow:"hidden", borderColor: cur.color + "44" }}>
        <canvas ref={canvasRef} width={W_DS} height={H_DS} style={{ width:"100%", height:"auto" }} />
      </div>

      <div className="panel">
        {experiment !== "water" && (
          <div style={{ display:"flex", gap:12, marginBottom: experiment==="electrons" ? 12 : 0 }}>
            <button onClick={toggle} style={{
              flex:1, padding:"10px", borderRadius:8, border:"1px solid", cursor:"pointer",
              borderColor: running ? "#ff4d6d" : "var(--cyan)",
              background: running ? "rgba(255,77,109,.15)" : "rgba(0,240,255,.12)",
              color: running ? "#ff4d6d" : "var(--cyan)",
              fontFamily:"var(--font-head)", fontSize:"1rem", fontWeight:700,
            }}>{running ? "\u23F8 Pauz\u0103" : "\u25B6 Lanseaz\u0103"}</button>
            <button onClick={reset} style={{
              padding:"10px 18px", borderRadius:8, border:"1px solid rgba(255,255,255,.15)",
              background:"rgba(255,255,255,.04)", color:"var(--dim)",
              fontFamily:"var(--font-head)", fontSize:"1rem", cursor:"pointer",
            }}>&#x21BA;</button>
          </div>
        )}
        {experiment === "water" && (
          <p style={{ color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:"0.82rem", textAlign:"center", padding:"6px 0" }}>
            &#x25CE; Animație continuă — crestele <span style={{color:"#00f0ff"}}>cyan</span>, văile <span style={{color:"#c040f0"}}>violet</span>, franjele <strong>negre</strong> = anulare completă
          </p>
        )}
        {experiment === "electrons" && (
          <button onClick={() => setWatching(w => !w)} style={{
            width:"100%", padding:"11px", borderRadius:8, cursor:"pointer",
            border:`1px solid ${watching ? "#ff4d6d" : "rgba(255,77,109,0.45)"}`,
            background: watching ? "rgba(255,77,109,.22)" : "rgba(255,77,109,.07)",
            color: watching ? "#ff4d6d" : "rgba(255,77,109,0.75)",
            fontFamily:"var(--font-head)", fontSize:"1rem", fontWeight:700,
          }}>
            {watching ? "\uD83D\uDD34 Detector ACTIV \u2014 apas\u0103 s\u0103 opre\u015fti" : "\u2B55 Activ. detectorul (prive\u015fte prin care fant\u0103 trece)"}
          </button>
        )}
      </div>

      <div className="panel" style={{ background:`${cur.color}10`, borderColor:`${cur.color}55` }}>
        <h4 style={{ fontFamily:"var(--font-head)", color:cur.color, marginBottom:10, fontSize:"1.05rem" }}>
          {cur.title}
        </h4>
        <p style={{ color:"var(--text)", fontSize:"0.85rem", lineHeight:1.85 }}>{cur.body}</p>
      </div>

      <div className="panel" style={{ background:"rgba(52,211,153,0.06)", borderColor:"rgba(52,211,153,0.3)" }}>
        <h4 style={{ fontFamily:"var(--font-head)", color:"var(--green)", marginBottom:8 }}>
          &#x1F4DA; Feynman, Vol. III, Cap. 1 \u2014 concluzia
        </h4>
        <p style={{ color:"var(--text)", fontSize:"0.85rem", lineHeight:1.85 }}>
          <em style={{color:"var(--green)"}}>"Lucrurile la scar&#x103; mic&#x103; nu se comport&#x103; ca nimic din ce a&#x21B;i v&#x103;zut vreodat&#x103;.
          Nu se comport&#x103; ca undele, nu se comport&#x103; ca particulele."</em>
          <br/><br/>
          Electronul nu este nici und&#x103;, nici particul&#x103; \xEEn sens clasic.
          Dac&#x103; <strong style={{color:"var(--gold)"}}>m&#x103;sori prin care fant&#x103; a trecut</strong>,
          franjele <strong style={{color:"var(--red)"}}>dispar</strong> \u2014 actul de observa&#x21B;ie perturb&#x103; sistemul.
          Principiul incertitudinii Heisenberg <strong style={{color:"var(--cyan)"}}>"protejeaz&#x103;" mecanica cuantic&#x103;</strong>.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState(0);
  const TABS=[
    {label:"〜  De Broglie",  comp:<DeBroglieTab/>},
    {label:"◎  Difracție",    comp:<DiffractionTab/>},
    {label:"⟺  Dubla Fantă", comp:<DoubleSlit/>},
  ];
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",fontFamily:"var(--font-head)",color:"var(--text)",paddingBottom:50}}>
      <div style={{
        background:"linear-gradient(180deg,#0a1628 0%,var(--bg) 100%)",
        borderBottom:"1px solid var(--border)",
        padding:"28px 24px 20px",textAlign:"center",
        position:"relative",overflow:"hidden"
      }}>
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,240,255,0.04) 39px,rgba(0,240,255,0.04) 40px)",pointerEvents:"none"}}/>
        <div style={{fontSize:"0.72rem",fontFamily:"var(--font-mono)",color:"var(--cyan2)",letterSpacing:"0.22em",marginBottom:8}}>
          FIZICĂ CUANTICĂ · SIMULARE INTERACTIVĂ
        </div>
        <h1 style={{
          fontFamily:"var(--font-head)",fontSize:"clamp(1.6rem,5vw,2.5rem)",fontWeight:700,
          background:"linear-gradient(135deg,#00f0ff,#a855f7,#f5c842)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
          marginBottom:6
        }}>Dualismul Undă–Corpuscul</h1>
        <p style={{color:"var(--dim)",fontSize:"0.82rem",fontFamily:"var(--font-mono)"}}>
          de Broglie · Davisson-Germer · Feynman Vol. III Cap. 1
        </p>
      </div>

      <div style={{display:"flex",gap:8,padding:"14px 18px",borderBottom:"1px solid var(--border)",background:"var(--bg2)",position:"sticky",top:0,zIndex:10}}>
        {TABS.map(({label},i)=>(
          <button key={i} className={`tab-btn ${tab===i?"active":""}`} onClick={()=>setTab(i)}
            style={{
              flex:1,padding:"9px 4px",borderRadius:8,cursor:"pointer",
              border:`1px solid ${tab===i?"var(--cyan)":"var(--border)"}`,
              background:tab===i?"rgba(0,240,255,.12)":"var(--bg3)",
              color:tab===i?"var(--cyan)":"var(--dim)",
              fontFamily:"var(--font-head)",fontSize:"0.8rem",fontWeight:600
            }}>{label}</button>
        ))}
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 16px"}}>
        {TABS[tab].comp}
      </div>

      <div style={{textAlign:"center",color:"var(--dim)",fontSize:"0.7rem",fontFamily:"var(--font-mono)"}}>
        h = 6.626×10⁻³⁴ J·s &nbsp;·&nbsp; mₑ = 9.109×10⁻³¹ kg &nbsp;·&nbsp; e = 1.602×10⁻¹⁹ C
      </div>
    </div>
  );
}
