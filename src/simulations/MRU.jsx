import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, ReferenceLine, ResponsiveContainer
} from "recharts";

// ─── Constants ────────────────────────────────────────────────
const PPU       = 80;   // pixels per meter (world → screen)
const GHOST_DT  = 2;    // seconds between ghost checkpoints
const N_GHOSTS  = 8;
const SIM_MAX   = 20;   // max simulation time (s)
const GRAPH_MS  = 75;   // graph throttle (ms)

// ─── Nice axis helpers ────────────────────────────────────────
function niceStep(range, targetTicks = 6) {
  const raw = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step;
  if (norm <= 1.5) step = 1;
  else if (norm <= 3)   step = 2;
  else if (norm <= 7.5) step = 5;
  else step = 10;
  return step * mag;
}

function niceDomain(lo, hi, pad = 0.05) {
  const range = hi - lo || 1;
  const step  = niceStep(range * (1 + 2 * pad));
  const dLo   = Math.floor((lo - range * pad) / step) * step;
  const dHi   = Math.ceil( (hi + range * pad) / step) * step;
  const ticks = [];
  for (let v = dLo; v <= dHi + step * 0.01; v = parseFloat((v + step).toFixed(10)))
    ticks.push(parseFloat(v.toFixed(8)));
  return { domain: [dLo, dHi], ticks };
}

function computeDomains(x0, t0, vel) {
  const tMax  = SIM_MAX;
  const xFinal = vel >= 0
    ? x0 + vel * (SIM_MAX - t0)
    : x0 + vel * (SIM_MAX - t0);   // works for both signs
  const xLo   = Math.min(x0, xFinal);
  const xHi   = Math.max(x0, xFinal);
  const tDom  = niceDomain(0, tMax);
  const xDom  = niceDomain(xLo, xHi);
  const vLo   = Math.min(0, vel);
  const vHi   = Math.max(0, vel);
  const vDom  = niceDomain(vLo, vHi);
  return { tDom, xDom, vDom };
}

// ─── Canvas helpers ───────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}

function drawCar(ctx, cx, cy, col, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  // body
  ctx.fillStyle = col; rr(ctx, cx - 38, cy - 13, 76, 24, 6); ctx.fill();
  // cabin
  ctx.globalAlpha *= 0.78;
  ctx.fillStyle = col; rr(ctx, cx - 22, cy - 29, 44, 18, 5); ctx.fill();
  // window tint
  ctx.globalAlpha *= 0.5;
  ctx.fillStyle = "#aee8ff"; rr(ctx, cx - 18, cy - 26, 36, 11, 3); ctx.fill();
  ctx.restore();
  // wheels
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const wx of [cx - 24, cx + 24]) {
    ctx.fillStyle = "#0f0f0f";
    ctx.beginPath(); ctx.arc(wx, cy + 14, 12, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath(); ctx.arc(wx, cy + 14, 6.5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#999";
    ctx.beginPath(); ctx.arc(wx, cy + 14, 2.5, 0, 2 * Math.PI); ctx.fill();
  }
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────
export default function MRU() {
  const [x0,  setX0]  = useState(0);
  const [t0,  setT0]  = useState(2);
  const [vel, setVel] = useState(3);

  const [displayT, setDisplayT] = useState(0);
  const [xData,    setXData]    = useState([{ t: 0, x: 0 }]);
  const [vData,    setVData]    = useState([{ t: 0, v: 0 }]);
  const [ghosts,   setGhosts]   = useState(Array(N_GHOSTS).fill(false));
  const [playing,  setPlaying]  = useState(false);

  // ─ pre-calculated fixed axes (recomputed when params change)
  const { tDom, xDom, vDom } = computeDomains(x0, t0, vel);

  // ─ animation refs
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);
  const playRef   = useRef(false);
  const lastReal  = useRef(null);
  const lastGraph = useRef(0);
  const ghostsRef = useRef(Array(N_GHOSTS).fill(false));
  const stepDone  = useRef(false);

  // ─ param refs (always current — safe inside RAF callbacks)
  const X0 = useRef(x0);
  const T0 = useRef(t0);
  const V  = useRef(vel);
  useEffect(() => { X0.current = x0; }, [x0]);
  useEffect(() => { T0.current = t0; }, [t0]);
  useEffect(() => { V.current  = vel; }, [vel]);

  // ─── Draw canvas ─────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const t = tRef.current;
    const x0v = X0.current, t0v = T0.current, vv = V.current;
    const posAt = (tt) => tt < t0v ? x0v : x0v + vv * (tt - t0v);
    const carX  = posAt(t);
    const w2s   = (wx) => W / 2 + (wx - carX) * PPU;

    const roadTop = H * 0.38;
    const roadBot = H * 0.72;
    const roadH   = roadBot - roadTop;
    const carCY   = roadTop + roadH * 0.42;

    ctx.clearRect(0, 0, W, H);

    // ── sky
    const sg = ctx.createLinearGradient(0, 0, 0, roadTop);
    sg.addColorStop(0, "#04080f"); sg.addColorStop(1, "#0a1a30");
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, roadTop);

    // subtle stars
    ctx.fillStyle = "#ffffff18";
    for (let s = 0; s < 40; s++) {
      const sx = ((s * 137 + W * 0.3) % W);
      const sy = ((s * 97) % (roadTop * 0.9));
      ctx.fillRect(sx, sy, s % 3 === 0 ? 1.5 : 1, s % 3 === 0 ? 1.5 : 1);
    }

    // ── ground
    const gg = ctx.createLinearGradient(0, roadBot, 0, H);
    gg.addColorStop(0, "#142808"); gg.addColorStop(1, "#090f05");
    ctx.fillStyle = gg; ctx.fillRect(0, roadBot, W, H - roadBot);

    // ── road surface
    ctx.fillStyle = "#181818"; ctx.fillRect(0, roadTop, W, roadH);

    // road texture lines (subtle)
    for (let ry = roadTop + 6; ry < roadBot; ry += 14) {
      ctx.strokeStyle = "#ffffff05"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke();
    }

    // road edges
    ctx.strokeStyle = "#ddddddaa"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, roadTop + 2); ctx.lineTo(W, roadTop + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, roadBot - 2); ctx.lineTo(W, roadBot - 2); ctx.stroke();

    // center dashes
    ctx.strokeStyle = "#e8b83066"; ctx.lineWidth = 2.5; ctx.setLineDash([24, 16]);
    ctx.beginPath(); ctx.moveTo(0, roadTop + roadH / 2); ctx.lineTo(W, roadTop + roadH / 2); ctx.stroke();
    ctx.setLineDash([]);

    // ── meter ticks + labels
    const mS = Math.floor(carX - W / (2 * PPU)) - 1;
    const mE = Math.ceil( carX + W / (2 * PPU)) + 1;
    for (let m = mS; m <= mE; m++) {
      const sx = w2s(m);
      ctx.strokeStyle = "#ffffff22"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, roadBot + 3); ctx.lineTo(sx, roadBot + 11); ctx.stroke();
      ctx.fillStyle = m === 0 ? "#ffffffaa" : "#ffffff55";
      ctx.font = `${m === 0 ? "bold " : ""}11px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${m}`, sx, roadBot + 23);
    }
    // "m" unit label at right edge
    ctx.fillStyle = "#ffffff33"; ctx.font = "10px monospace"; ctx.textAlign = "left";
    ctx.fillText("m", W - 6, roadBot + 23);

    // ── origin marker
    const osx = w2s(0);
    ctx.save();
    ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 2.5; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(osx, roadTop - 6); ctx.lineTo(osx, roadBot + 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = "#ffffffcc";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("O", osx, roadTop - 12);

    // ── +x arrow (fixed on screen, top-right)
    ctx.save();
    const ax = W - 120, ay = 20;
    ctx.strokeStyle = "#e8b830"; ctx.fillStyle = "#e8b830"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 56, ay); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax + 48, ay - 7); ctx.lineTo(ax + 60, ay); ctx.lineTo(ax + 48, ay + 7);
    ctx.fill();
    ctx.font = "bold 13px 'Courier New', monospace"; ctx.textAlign = "left";
    ctx.fillText("+x", ax + 65, ay + 5);
    ctx.restore();

    // ── ghost checkpoints
    for (let i = 0; i < N_GHOSTS; i++) {
      if (!ghostsRef.current[i]) continue;
      const gt  = t0v + (i + 1) * GHOST_DT;
      const gsx = w2s(posAt(gt));
      drawCar(ctx, gsx, carCY, "#38bdf8", 0.28);
      // vertical ghost line
      ctx.save();
      ctx.strokeStyle = "#38bdf830"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(gsx, carCY + 16); ctx.lineTo(gsx, roadBot - 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // time label
      ctx.save();
      ctx.fillStyle = "#38bdf899"; ctx.font = "10px monospace"; ctx.textAlign = "center";
      ctx.fillText(`t=${gt.toFixed(0)}s`, gsx, carCY - 54);
      ctx.restore();
    }

    // ── main car
    drawCar(ctx, W / 2, carCY, "#ef4444");

    // glow under car
    ctx.save();
    const glow = ctx.createRadialGradient(W / 2, carCY + 28, 2, W / 2, carCY + 28, 40);
    glow.addColorStop(0, "#ef444422"); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(W / 2, carCY + 28, 40, 10, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();

    // position label (above car)
    ctx.save();
    ctx.fillStyle = "#ffffffee"; ctx.font = "bold 13px 'Courier New', monospace"; ctx.textAlign = "center";
    ctx.fillText(`x = ${carX.toFixed(2)} m`, W / 2, carCY - 54);
    ctx.restore();

  }, []);

  // ─── Animation frame ─────────────────────────────────────────
  const frame = useCallback((ts) => {
    if (!playRef.current) return;
    if (!lastReal.current) lastReal.current = ts;
    const dt = (ts - lastReal.current) / 1000;
    lastReal.current = ts;

    tRef.current = Math.min(tRef.current + dt, SIM_MAX);
    const t   = tRef.current;
    const x0v = X0.current, t0v = T0.current, vv = V.current;
    const posAt = (tt) => tt < t0v ? x0v : x0v + vv * (tt - t0v);
    const velAt = (tt) => tt < t0v ? 0 : vv;

    draw();
    setDisplayT(t);

    // ghost reveal
    const ng = [...ghostsRef.current]; let gc = false;
    for (let i = 0; i < N_GHOSTS; i++) {
      if (!ng[i] && t >= t0v + (i + 1) * GHOST_DT) { ng[i] = true; gc = true; }
    }
    if (gc) { ghostsRef.current = ng; setGhosts([...ng]); }

    // graph update (throttled)
    if (ts - lastGraph.current > GRAPH_MS) {
      lastGraph.current = ts;
      const tf = parseFloat(t.toFixed(2));
      const xv = parseFloat(posAt(t).toFixed(3));
      const vf = parseFloat(velAt(t).toFixed(3));

      setXData(p => [...p, { t: tf, x: xv }]);

      setVData(p => {
        const arr = [...p];
        // inject the idealized step at t0
        if (!stepDone.current && t >= t0v) {
          stepDone.current = true;
          arr.push({ t: parseFloat(t0v.toFixed(3)), v: 0 });
          arr.push({ t: parseFloat((t0v + 0.0005).toFixed(4)), v: vv });
        }
        arr.push({ t: tf, v: vf });
        return arr;
      });
    }

    if (t < SIM_MAX) {
      rafRef.current = requestAnimationFrame(frame);
    } else {
      playRef.current = false;
      setPlaying(false);
    }
  }, [draw]);

  // ─── Reset logic ─────────────────────────────────────────────
  const doReset = useCallback(() => {
    playRef.current = false;
    setPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    tRef.current    = 0;
    lastReal.current  = null;
    lastGraph.current = 0;
    stepDone.current  = false;
    ghostsRef.current = Array(N_GHOSTS).fill(false);
    setDisplayT(0);
    setGhosts(Array(N_GHOSTS).fill(false));
    setXData([{ t: 0, x: X0.current }]);
    setVData([{ t: 0, v: 0 }]);
    setTimeout(() => draw(), 0);
  }, [draw]);

  // reset when params change
  useEffect(() => {
    X0.current = x0; T0.current = t0; V.current = vel;
    doReset();
  }, [x0, t0, vel]); // eslint-disable-line

  const toggle = () => {
    if (playing) {
      playRef.current = false; setPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      playRef.current = true; setPlaying(true);
      lastReal.current = null;
      rafRef.current = requestAnimationFrame(frame);
    }
  };

  // ─── Formatting ──────────────────────────────────────────────
  const fmt = (t) =>
    `${String(Math.floor(t)).padStart(3, "0")}.${Math.floor((t % 1) * 10)}`;

  // ─── Slider config ───────────────────────────────────────────
  const sliders = [
    { lbl: "x₀", unit: "m",   v: x0,  s: setX0,  lo: -12, hi: 12, st: 1   },
    { lbl: "t₀", unit: "s",   v: t0,  s: setT0,  lo: 0,   hi: 8,  st: 0.5 },
    { lbl: "v",  unit: "m/s", v: vel, s: setVel, lo: -8,  hi: 8,  st: 0.5 },
  ];

  return (
    <div style={{
      background: "#070b12",
      minHeight: "100vh",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#e0e8f0",
      padding: "12px 14px",
      userSelect: "none",
    }}>
      <style>{`
        input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          background: #1e3050;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #e8b830;
          box-shadow: 0 0 6px #e8b83088;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #e8b830;
          border: none;
          cursor: pointer;
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#4a6a8a", letterSpacing: 3, textTransform: "uppercase" }}>
          Simulare · Mișcare Rectilinie Uniformă
        </div>
        <div style={{ fontSize: 10, color: "#2a4a6a" }}>x = x₀ + v·(t − t₀)</div>
      </div>

      {/* ── Cronometru ────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <div style={{
          background: "#030507",
          border: "2px solid #e8b83066",
          borderRadius: 8,
          padding: "4px 26px 4px 26px",
          fontSize: 54,
          fontWeight: "bold",
          color: "#e8b830",
          letterSpacing: 6,
          fontVariantNumeric: "tabular-nums",
          boxShadow: "0 0 28px #e8b83022, inset 0 0 20px #00000088",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* scanline overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #00000018 2px, #00000018 4px)",
            pointerEvents: "none",
          }} />
          {fmt(displayT)}
          <span style={{ fontSize: 22, marginLeft: 3, opacity: 0.6, fontWeight: "normal" }}>s</span>
        </div>
      </div>

      {/* ── Canvas / Pistă ────────────────────────────────────── */}
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #1a2a3a", marginBottom: 10 }}>
        <canvas
          ref={canvasRef}
          width={880}
          height={180}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* ── Butoane + Parametri ───────────────────────────────── */}
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap",
        alignItems: "center", justifyContent: "center",
        marginBottom: 12,
      }}>
        {/* Play/Pause */}
        <button onClick={toggle} style={{
          background: playing
            ? "linear-gradient(135deg,#7f1d1d,#991b1b)"
            : "linear-gradient(135deg,#14532d,#166534)",
          border: playing ? "1px solid #ef444488" : "1px solid #22c55e88",
          borderRadius: 7, padding: "9px 26px",
          color: "#fff", fontWeight: "bold", fontSize: 16,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: playing ? "0 0 12px #ef444422" : "0 0 12px #22c55e22",
          transition: "all 0.15s",
          letterSpacing: 1,
        }}>
          {playing ? "⏸  PAUZĂ" : "▶  PLAY"}
        </button>

        {/* Reset */}
        <button onClick={doReset} style={{
          background: "linear-gradient(135deg,#1a2535,#243045)",
          border: "1px solid #344a6a",
          borderRadius: 7, padding: "9px 20px",
          color: "#8aaccc", fontWeight: "bold", fontSize: 16,
          cursor: "pointer", fontFamily: "inherit", letterSpacing: 1,
        }}>
          ↺  RESET
        </button>

        {/* Sliders */}
        {sliders.map(({ lbl, unit, v, s, lo, hi, st }) => (
          <div key={lbl} style={{
            background: "#0c1520",
            border: "1px solid #1e3050",
            borderRadius: 8, padding: "6px 12px",
            textAlign: "center", minWidth: 130,
          }}>
            <div style={{ fontSize: 11, color: "#5a8aaa", marginBottom: 4, letterSpacing: 1 }}>
              {lbl} <span style={{ color: "#3a6a8a" }}>({unit})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range" min={lo} max={hi} step={st} value={v}
                onChange={e => s(parseFloat(e.target.value))}
                style={{ width: 90 }}
              />
              <span style={{
                color: "#e8b830", fontWeight: "bold",
                fontSize: 17, minWidth: 38, textAlign: "right"
              }}>{v}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grafice ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <GraphPanel
          title="x(t)" subtitle="Poziție"
          color="#3b82f6" data={xData} dataKey="x"
          yLabel="x (m)" t0={t0}
          lineType="linear"
          tDomain={tDom.domain} tTicks={tDom.ticks}
          yDomain={xDom.domain} yTicks={xDom.ticks}
        />
        <GraphPanel
          title="v(t)" subtitle="Viteză"
          color="#22c55e" data={vData} dataKey="v"
          yLabel="v (m/s)" t0={t0}
          lineType="linear"
          tDomain={tDom.domain} tTicks={tDom.ticks}
          yDomain={vDom.domain} yTicks={vDom.ticks}
        />
      </div>

      {/* ── Footer formula ────────────────────────────────────── */}
      <div style={{
        marginTop: 10, textAlign: "center",
        fontSize: 11, color: "#2a4060", letterSpacing: 2
      }}>
        MRU · v = const · Δx = v · Δt · GHOST INTERVAL = {GHOST_DT}s
      </div>
    </div>
  );
}

// ─── Graph Panel ─────────────────────────────────────────────
function GraphPanel({ title, subtitle, color, data, dataKey, yLabel, t0, lineType, tDomain, tTicks, yDomain, yTicks }) {
  return (
    <div style={{
      flex: 1, minWidth: 240,
      background: "#04080f",
      borderRadius: 10,
      padding: "10px 4px 6px",
      border: `1px solid ${color}33`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* scanlines */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg,transparent,transparent 3px,#00000014 3px,#00000014 6px)",
        pointerEvents: "none", zIndex: 1,
      }} />
      {/* corner label */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "0 10px", marginBottom: 6, position: "relative", zIndex: 2,
      }}>
        <span style={{ fontWeight: "bold", color, fontSize: 15, letterSpacing: 1 }}>
          {title}
        </span>
        <span style={{ color: "#3a5a7a", fontSize: 11, alignSelf: "center" }}>
          {subtitle}
        </span>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <ResponsiveContainer width="100%" height={185}>
          <LineChart data={data} margin={{ top: 4, right: 14, left: -18, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0d1f35" />
            <XAxis
              dataKey="t" stroke="#1e3050" type="number"
              domain={tDomain} ticks={tTicks}
              tick={{ fill: "#4a7a9a", fontSize: 10, fontFamily: "monospace" }}
              label={{ value: "t (s)", position: "insideBottomRight", offset: -4, fill: "#3a6a8a", fontSize: 10 }}
            />
            <YAxis
              stroke="#1e3050" type="number"
              domain={yDomain} ticks={yTicks}
              tick={{ fill: "#4a7a9a", fontSize: 10, fontFamily: "monospace" }}
              label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#3a6a8a", fontSize: 10 }}
            />
            <ReferenceLine
              x={t0}
              stroke="#e8b83055"
              strokeDasharray="5 3"
              label={{ value: "t₀", fill: "#e8b830", fontSize: 10, fontFamily: "monospace" }}
            />
            <ReferenceLine y={0} stroke="#ffffff0a" />
            <Line
              type={lineType}
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
