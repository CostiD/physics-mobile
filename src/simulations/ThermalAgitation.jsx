import { useState, useEffect, useRef } from "react";

// ─── Canvas dimensions ────────────────────────────────────────
const CW = 340, CH = 280;
const O_R = 8, H_R = 5, BOND = 16;
const H_ANG = 52 * Math.PI / 180;
const MAR = 18;
const T_MIN = -273;

// ─── mixed_sl geometry: solid block centered-bottom, liquid on sides ──
const SL_SX0 = CW * 0.26, SL_SX1 = CW * 0.74;
const SL_SY0 = CH * 0.36, SL_SY1 = CH - MAR;
const SL_SURF = SL_SY0 + (SL_SY1 - SL_SY0) * 0.38;  // liquid surface BELOW solid top

// ─── liquid/gas surface (for pure liquid & mixed_lg) ─────────
const LIQ_SURF_Y = CH * 0.35;

// ─── Phase logic ──────────────────────────────────────────────
function getPhase(t) {
  if (t < -0.5)   return 'solid';
  if (t <= 0.5)   return 'mixed_sl';
  if (t < 99.5)   return 'liquid';
  if (t <= 100.5) return 'mixed_lg';
  return 'gas';
}

const PHASE_LABEL = {
  solid:    '❄️  Gheață',
  mixed_sl: '⇌  Gheață + Apă  (0 °C)',
  liquid:   '💧  Apă',
  mixed_lg: '⇌  Apă + Vapori  (100 °C)',
  gas:      '🌫️  Vapori',
};
const PHASE_COLOR = {
  solid:'#93c5fd', mixed_sl:'#67e8f9', liquid:'#38bdf8', mixed_lg:'#6ee7b7', gas:'#fb923c',
};

// ─── Spring ───────────────────────────────────────────────────
function drawSpring(ctx, x1, y1, x2, y2, coils, amp) {
  const dx = x2-x1, dy = y2-y1;
  const len = Math.sqrt(dx*dx+dy*dy);
  if (len < 6) return;
  const nx = dx/len, ny = dy/len, px = -ny, py = nx;
  const lead = 3;
  const sx = x1+nx*lead, sy = y1+ny*lead;
  const ex = x2-nx*lead, ey = y2-ny*lead;
  const steps = coils*2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(sx,sy);
  for (let i=0; i<=steps; i++) {
    const t=i/steps, sign=(i%2===0)?1:-1;
    ctx.lineTo(sx+(ex-sx)*t+px*amp*sign, sy+(ey-sy)*t+py*amp*sign);
  }
  ctx.lineTo(x2,y2); ctx.stroke();
}

// ─── H₂O molecule ─────────────────────────────────────────────
function drawMolecule(ctx, x, y, angle, alpha) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const h1x=x+Math.cos(angle+H_ANG)*BOND, h1y=y+Math.sin(angle+H_ANG)*BOND;
  const h2x=x+Math.cos(angle-H_ANG)*BOND, h2y=y+Math.sin(angle-H_ANG)*BOND;
  ctx.strokeStyle='#ffffff55'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(h1x,h1y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(h2x,h2y); ctx.stroke();
  for (const [hx,hy] of [[h1x,h1y],[h2x,h2y]]) {
    ctx.fillStyle='#bfdbfe'; ctx.strokeStyle='#93c5fd55'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(hx,hy,H_R,0,2*Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#1e3a8a'; ctx.font='bold 6px monospace'; ctx.textAlign='center';
    ctx.fillText('H',hx,hy+2.2);
  }
  const g=ctx.createRadialGradient(x-2,y-2,0.5,x,y,O_R);
  g.addColorStop(0,'#fca5a5'); g.addColorStop(1,'#b91c1c');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,O_R,0,2*Math.PI); ctx.fill();
  ctx.fillStyle='#7f1d1d'; ctx.font='bold 7px monospace'; ctx.textAlign='center';
  ctx.fillText('O',x,y+2.5);
  ctx.restore();
}

// ─── Init molecules ───────────────────────────────────────────
function initMolecules(phase) {
  const mols = [];

  function solidGrid(n, x0, y0, gW, gH) {
    const cols=Math.ceil(Math.sqrt(n)), rows=Math.ceil(n/cols);
    const dx=gW/cols, dy=gH/rows;
    let i=0;
    for (let r=0;r<rows&&i<n;r++)
      for (let c=0;c<cols&&i<n;c++,i++) {
        const hx=x0+dx*(c+0.5), hy=y0+dy*(r+0.5);
        mols.push({x:hx,y:hy,hx,hy,vx:0,vy:0,angle:i*0.53,omega:0,type:'solid',col:c,row:r,cols,rows});
      }
  }

  function randMols(n, x0, y0, bW, bH, spd, type) {
    for (let i=0;i<n;i++) {
      const ang=Math.random()*2*Math.PI, s=spd*(0.7+Math.random()*0.6);
      mols.push({
        x:x0+MAR*0.4+Math.random()*Math.max(1,bW-MAR),
        y:y0+MAR*0.4+Math.random()*Math.max(1,bH-MAR),
        hx:0,hy:0, vx:Math.cos(ang)*s, vy:Math.sin(ang)*s,
        angle:Math.random()*2*Math.PI, omega:(Math.random()-0.5)*0.05, type,
      });
    }
  }

  if (phase==='solid') {
    solidGrid(16, MAR, MAR, CW-2*MAR, CH-2*MAR);

  } else if (phase==='mixed_sl') {
    // Solid block centered-bottom
    solidGrid(12, SL_SX0, SL_SY0, SL_SX1-SL_SX0, SL_SY1-SL_SY0);
    // Liquid: left strip + right strip, below SL_SURF
    const stripW = SL_SX0 - MAR*1.2;
    const stripH = SL_SY1 - SL_SURF;
    randMols(4, MAR, SL_SURF, stripW, stripH, 0.55, 'liquid');
    randMols(4, SL_SX1+MAR*0.4, SL_SURF, stripW, stripH, 0.55, 'liquid');

  } else if (phase==='liquid') {
    randMols(14, 0, LIQ_SURF_Y, CW, CH-LIQ_SURF_Y, 0.75, 'liquid');

  } else if (phase==='mixed_lg') {
    randMols(5, 0, 0, CW, LIQ_SURF_Y, 2.4, 'gas');
    randMols(9, 0, LIQ_SURF_Y, CW, CH-LIQ_SURF_Y, 0.9, 'liquid');

  } else { // gas
    randMols(9, 0, 0, CW, CH, 2.2, 'gas');
  }
  return mols;
}

// ─── Physics ──────────────────────────────────────────────────
function stepMolecules(mols, phase, tempC) {
  const ct      = Math.max(tempC, T_MIN);
  const frozen  = ct <= T_MIN;
  // vibration amplitude: zero at 0K, scales linearly
  const vibAmp  = frozen ? 0 : Math.max(0, (ct - T_MIN) * 0.014);
  // liquid speed: strong scaling so difference between 5°C and 90°C is visible
  const liqSpd  = Math.max(0.05, 0.1 + ct * 0.014);
  // brownian kick: also scales with temp
  const brownK  = Math.max(0.01, 0.04 + ct * 0.004);
  const gasSpd  = 1.5 + Math.max(0, ct-100)*0.01;

  for (const m of mols) {
    if (m.type==='solid') {
      if (frozen) {
        m.x = m.hx; m.y = m.hy; // completely still
      } else {
        m.x = m.hx + (Math.random()-0.5)*vibAmp*2;
        m.y = m.hy + (Math.random()-0.5)*vibAmp*2;
        m.angle += (Math.random()-0.5)*0.015;
      }

    } else if (m.type==='liquid') {
      m.vx += (Math.random()-0.5)*brownK*2;
      m.vy += (Math.random()-0.5)*brownK*2;
      const spd=Math.sqrt(m.vx*m.vx+m.vy*m.vy);
      if (spd>liqSpd) { m.vx=m.vx/spd*liqSpd; m.vy=m.vy/spd*liqSpd; }
      m.x+=m.vx; m.y+=m.vy; m.angle+=m.omega*(0.5+ct*0.015);

      // Mixed_sl: liquid confined to strips beside solid block, below SL_SURF
      if (phase==='mixed_sl') {
        // clamp above SL_SURF surface
        if (m.y < SL_SURF + MAR*0.5) { m.y=SL_SURF+MAR*0.5; m.vy=Math.abs(m.vy); }
        if (m.y > SL_SY1-MAR*0.3)   { m.y=SL_SY1-MAR*0.3;  m.vy=-Math.abs(m.vy); }
        // keep in left or right strip (find which side it started on)
        if (m.x < SL_SX0 - MAR*0.3) {
          // left strip
          if (m.x < MAR)          { m.x=MAR;          m.vx=Math.abs(m.vx); }
          if (m.x > SL_SX0-MAR*0.5){ m.x=SL_SX0-MAR*0.5; m.vx=-Math.abs(m.vx); }
        } else {
          // right strip
          if (m.x < SL_SX1+MAR*0.5){ m.x=SL_SX1+MAR*0.5; m.vx=Math.abs(m.vx); }
          if (m.x > CW-MAR)        { m.x=CW-MAR;          m.vx=-Math.abs(m.vx); }
        }
      } else {
        // pure liquid / mixed_lg
        if (m.x < MAR)       { m.x=MAR;       m.vx=Math.abs(m.vx); }
        if (m.x > CW-MAR)    { m.x=CW-MAR;    m.vx=-Math.abs(m.vx); }
        if (m.y > CH-MAR)    { m.y=CH-MAR;    m.vy=-Math.abs(m.vy); }
        if (m.y < LIQ_SURF_Y+MAR*0.5) { m.y=LIQ_SURF_Y+MAR*0.5; m.vy=Math.abs(m.vy); }
        if (phase==='mixed_lg' && m.y < LIQ_SURF_Y+MAR*0.6) {
          m.y=LIQ_SURF_Y+MAR*0.6; m.vy=Math.abs(m.vy);
        }
      }

    } else { // gas
      const cs=Math.sqrt(m.vx*m.vx+m.vy*m.vy);
      if (cs>0.1) { m.vx=m.vx/cs*gasSpd; m.vy=m.vy/cs*gasSpd; }
      m.x+=m.vx; m.y+=m.vy; m.angle+=m.omega;
      if (m.x<MAR)    { m.x=MAR;    m.vx=Math.abs(m.vx); }
      if (m.x>CW-MAR) { m.x=CW-MAR; m.vx=-Math.abs(m.vx); }
      if (m.y<MAR)    { m.y=MAR;    m.vy=Math.abs(m.vy); }
      if (m.y>CH-MAR) { m.y=CH-MAR; m.vy=-Math.abs(m.vy); }
      if (phase==='mixed_lg' && m.y>LIQ_SURF_Y-MAR) {
        m.y=LIQ_SURF_Y-MAR; m.vy=-Math.abs(m.vy);
      }
    }
  }
}

// ─── Render ───────────────────────────────────────────────────
function renderScene(ctx, mols, phase, tempC) {
  const W=CW, H=CH;
  const now=Date.now()/1000;
  ctx.clearRect(0,0,W,H);

  const bgMap={ solid:'#03101e', mixed_sl:'#051520', liquid:'#02100d', mixed_lg:'#041410', gas:'#110704' };
  ctx.fillStyle=bgMap[phase]||'#050a15'; ctx.fillRect(0,0,W,H);

  // ── liquid fill area ─────────────────────────────────────────
  if (phase==='liquid'||phase==='mixed_lg') {
    const lg=ctx.createLinearGradient(0,LIQ_SURF_Y,0,H);
    lg.addColorStop(0,'#0ea5e910'); lg.addColorStop(1,'#0ea5e922');
    ctx.fillStyle=lg; ctx.fillRect(0,LIQ_SURF_Y,W,H-LIQ_SURF_Y);
  }
  if (phase==='mixed_sl') {
    // left and right strips
    const lg2=ctx.createLinearGradient(0,SL_SURF,0,H);
    lg2.addColorStop(0,'#0ea5e912'); lg2.addColorStop(1,'#0ea5e924');
    ctx.fillStyle=lg2;
    ctx.fillRect(MAR*0.3, SL_SURF, SL_SX0-MAR*0.8, SL_SY1-SL_SURF);
    ctx.fillRect(SL_SX1+MAR*0.3, SL_SURF, SL_SX0-MAR*0.8, SL_SY1-SL_SURF);
  }

  // ── free surface wavy line ────────────────────────────────────
  function drawSurface(surfY, x0, x1, label) {
    ctx.save();
    ctx.strokeStyle='#7dd3fcdd'; ctx.lineWidth=2;
    ctx.shadowColor='#38bdf8'; ctx.shadowBlur=7;
    ctx.beginPath();
    for (let px=x0; px<=x1; px+=2) {
      const wy=surfY+Math.sin(px*0.044+now*1.7)*2.6+Math.sin(px*0.091+now*1.0)*1.2;
      px===x0 ? ctx.moveTo(px,wy) : ctx.lineTo(px,wy);
    }
    ctx.stroke(); ctx.shadowBlur=0;
    if (label) {
      ctx.fillStyle='#38bdf877'; ctx.font='8px monospace'; ctx.textAlign='right';
      ctx.fillText(label, x1-4, surfY-5);
    }
    ctx.restore();
  }

  if (phase==='liquid'||phase==='mixed_lg') drawSurface(LIQ_SURF_Y,0,W,'suprafață liberă ▾');
  if (phase==='mixed_sl') {
    drawSurface(SL_SURF, MAR*0.3, SL_SX0-MAR*0.4, null);
    drawSurface(SL_SURF, SL_SX1+MAR*0.4, W-MAR*0.3, 'suprafață ▾');
  }

  // ── mixed_lg label ────────────────────────────────────────────
  if (phase==='mixed_lg') {
    ctx.fillStyle='#fb923c55'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText('VAPORI', W/2, LIQ_SURF_Y-8);
    ctx.fillStyle='#38bdf855';
    ctx.fillText('LICHID', W/2, H-7);
  }

  // ── springs ───────────────────────────────────────────────────
  // Solid: connect grid neighbors (H + V) by index
  const solidMols = mols.filter(m=>m.type==='solid');
  // For solid, use stored grid coords to find true neighbors
  for (let i=0; i<solidMols.length; i++) {
    for (let j=i+1; j<solidMols.length; j++) {
      const a=solidMols[i], b=solidMols[j];
      const dc=Math.abs(a.col-b.col), dr=Math.abs(a.row-b.row);
      // only direct horizontal (dc=1,dr=0) or vertical (dc=0,dr=1) neighbors
      if ((dc===1&&dr===0)||(dc===0&&dr===1)) {
        ctx.strokeStyle='#e0f2feee'; ctx.lineWidth=1.5;
        drawSpring(ctx,a.x,a.y,b.x,b.y,4,4);
      }
    }
  }

  // Liquid: distance-based
  const liqMols=mols.filter(m=>m.type==='liquid');
  for (let i=0;i<liqMols.length;i++) {
    for (let j=i+1;j<liqMols.length;j++) {
      const a=liqMols[i],b=liqMols[j];
      const dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy);
      if (dist<55) {
        ctx.strokeStyle='#34d399cc'; ctx.lineWidth=1.2;
        drawSpring(ctx,a.x,a.y,b.x,b.y,3,2.8);
      }
    }
  }

  // ── molecules ─────────────────────────────────────────────────
  for (const m of mols)
    drawMolecule(ctx, m.x, m.y, m.angle, m.type==='gas'?0.78:1);

  // ── border ────────────────────────────────────────────────────
  const col=PHASE_COLOR[phase];
  ctx.strokeStyle=col+'66'; ctx.lineWidth=2; ctx.strokeRect(1,1,W-2,H-2);
  ctx.strokeStyle=col+'1a'; ctx.lineWidth=7; ctx.strokeRect(3,3,W-6,H-6);
}

// ─── Panel ────────────────────────────────────────────────────
function Panel({ defaultTemp }) {
  const [tempC, setTempC]=useState(defaultTemp);
  const canvasRef=useRef(null);
  const molsRef  =useRef([]);
  const tempCRef =useRef(tempC);
  const phaseRef =useRef(null);

  const phase=getPhase(tempC);
  phaseRef.current=phase;
  tempCRef.current=tempC;

  useEffect(()=>{ molsRef.current=initMolecules(phase); },[phase]); // eslint-disable-line

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext('2d');
    let running=true;
    const tick=()=>{
      if(!running)return;
      stepMolecules(molsRef.current,phaseRef.current,tempCRef.current);
      renderScene(ctx,molsRef.current,phaseRef.current,tempCRef.current);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return ()=>{ running=false; };
  },[]);

  // Temperature display
  const isAbsZero = tempC <= T_MIN;
  const kVal      = isAbsZero ? '0.00' : (tempC+273.15).toFixed(2);
  const color     = PHASE_COLOR[phase];
  const tempStr   = tempC>0 ? `+${tempC}` : `${tempC}`;

  const range  = 300-T_MIN;  // 573
  const pct0   = ((0  -T_MIN)/range*100).toFixed(2);
  const pct100 = ((100-T_MIN)/range*100).toFixed(2);

  return (
    <div style={{
      display:'flex',flexDirection:'column',alignItems:'center',
      background:'#020b14',borderRadius:16,padding:'12px 16px 16px',
      border:`1px solid ${color}44`,
      boxShadow:`0 0 32px ${color}0d`,
      width:'100%',maxWidth:420,margin:'0 auto',
    }}>
      <style>{`
        .therm-slider{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;width:100%;}
        .therm-slider::-webkit-slider-thumb{
          -webkit-appearance:none;width:21px;height:21px;border-radius:50%;cursor:pointer;
          background:radial-gradient(circle at 34% 32%,#ffffff,${color});
          box-shadow:0 0 10px ${color}bb,0 2px 5px #000b;
          border:1.5px solid ${color}99;
          transition:box-shadow 0.2s;
        }
        .therm-slider::-moz-range-thumb{
          width:21px;height:21px;border-radius:50%;border:1.5px solid ${color}99;cursor:pointer;
          background:radial-gradient(circle at 34% 32%,#ffffff,${color});
          box-shadow:0 0 10px ${color}bb;
        }
      `}</style>

      <canvas ref={canvasRef} width={CW} height={CH}
        style={{width:'100%',borderRadius:8,display:'block'}} />

      {/* Phase label */}
      <div style={{color,fontFamily:'monospace',fontSize:13,fontWeight:'bold',
        letterSpacing:1,textAlign:'center',marginTop:10,minHeight:20}}>
        {PHASE_LABEL[phase]}
      </div>

      {/* Temp readout */}
      <div style={{display:'flex',gap:14,marginTop:6,fontFamily:'monospace',alignItems:'baseline'}}>
        <span style={{color:'#e8b830',fontWeight:'bold',fontSize:22}}>{tempStr} °C</span>
        <span style={{color:'#334155',fontSize:12}}>▸</span>
        <span style={{color:'#64748b',fontSize:16}}>{kVal} K</span>
        {isAbsZero && (
          <span style={{color:'#f87171',fontSize:10,border:'1px solid #f8717155',
            borderRadius:4,padding:'1px 6px',animation:'pulse 1.4s infinite'}}>⚠ imposibil!</span>
        )}
      </div>

      {/* Shortcut buttons */}
      <div style={{display:'flex',gap:10,marginTop:10}}>
        {[
          {label:'0 °C',  val:0,   col:'#67e8f9'},
          {label:'100 °C',val:100, col:'#6ee7b7'},
        ].map(({label,val,col:bc})=>(
          <button key={val} onClick={()=>setTempC(val)} style={{
            background: tempC===val ? `${bc}22` : '#0a1520',
            border:`1px solid ${bc}66`,
            color: bc, fontFamily:'monospace', fontSize:12,
            borderRadius:7, padding:'5px 16px', cursor:'pointer',
            boxShadow: tempC===val ? `0 0 8px ${bc}44` : 'none',
            transition:'all 0.15s',fontWeight:'bold',
          }}>{label}</button>
        ))}
      </div>

      {/* Slider */}
      <div style={{width:'100%',marginTop:10,position:'relative'}}>
        <input className="therm-slider" type="range"
          min={T_MIN} max={300} step={1} value={tempC}
          onChange={e=>setTempC(+e.target.value)}
          style={{
            background:`linear-gradient(90deg,
              #0d0618 0%,
              #162248 ${pct0}%,
              #0c3d5a ${pct100}%,
              #7c2d12 100%)`
          }}
        />

        {/* Notch markers */}
        <div style={{position:'relative',height:12}}>
          <div style={{position:'absolute',left:`${pct0}%`,transform:'translateX(-50%)',
            top:0,width:1,height:7,background:'#7dd3fc99'}} />
          <div style={{position:'absolute',left:`${pct100}%`,transform:'translateX(-50%)',
            top:0,width:1,height:7,background:'#fb923c99'}} />
        </div>

        {/* Labels */}
        <div style={{display:'flex',justifyContent:'space-between',
          fontSize:9,fontFamily:'monospace',color:'#1e3050',userSelect:'none'}}>
          <span style={{color:'#f8717166',lineHeight:1.4}}>0 K<br/>−273°C</span>
          <span style={{color:'#7dd3fc77'}}>0°C</span>
          <span style={{color:'#fb923c77'}}>100°C</span>
          <span>300°C</span>
        </div>

        {/* Phase zone bar */}
        <div style={{display:'flex',width:'100%',height:3,borderRadius:2,overflow:'hidden',marginTop:5}}>
          <div style={{flex:273,background:'linear-gradient(90deg,#7dd3fc0d,#7dd3fc44)'}} />
          <div style={{width:2,background:'#ffffff33'}} />
          <div style={{flex:100,background:'linear-gradient(90deg,#38bdf844,#38bdf822)'}} />
          <div style={{width:2,background:'#ffffff33'}} />
          <div style={{flex:200,background:'linear-gradient(90deg,#fb923c22,#fb923c55)'}} />
        </div>
        <div style={{display:'flex',justifyContent:'space-around',
          fontSize:8,fontFamily:'monospace',marginTop:2}}>
          <span style={{color:'#7dd3fc44'}}>Solid</span>
          <span style={{color:'#38bdf833'}}>Lichid</span>
          <span style={{color:'#fb923c44'}}>Gaz</span>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function ThermalAgitation() {
  return (
    <div style={{background:'#020710',minHeight:'100vh',
      padding:'16px 14px 24px',fontFamily:"'Courier New',monospace",color:'#e0e8f0'}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>

      <div style={{textAlign:'center',marginBottom:16}}>
        <div style={{fontSize:12,color:'#2a4a6a',letterSpacing:4,
          textTransform:'uppercase',marginBottom:6}}>
          Agitație Termică · Molecule H₂O
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:16,
          fontSize:10,color:'#1a3050',flexWrap:'wrap'}}>
          <span><span style={{color:'#ef4444'}}>●</span> O — Oxigen</span>
          <span><span style={{color:'#93c5fd'}}>●</span> H — Hidrogen</span>
          <span style={{color:'#e0f2feaa'}}>⌇⌇⌇ leg. solid</span>
          <span style={{color:'#34d399aa'}}>⌇⌇⌇ leg. lichid</span>
        </div>
      </div>

      <Panel defaultTemp={10} />

      <div style={{marginTop:14,textAlign:'center',fontSize:10,color:'#0f2035',letterSpacing:2}}>
        Solidele vibrează · Lichidele se mișcă sub suprafața liberă · Gazele umplu tot vasul
      </div>
    </div>
  );
}
