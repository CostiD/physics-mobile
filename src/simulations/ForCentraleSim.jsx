import { useState, useEffect, useRef, useCallback } from "react";

// ── palette ──
const C = {
  blue:   "#378ADD", purple: "#7F77DD", green:  "#1D9E75",
  red:    "#E24B4A", amber:  "#EF9F27", gray:   "#888780",
  bg:     "#f8f7f3", bgDark: "#1a1a18",
};

const TABS = [
  { id: "e0", label: "E0 · L vectorial" },
  { id: "e1", label: "E1 · Forță centrală" },
  { id: "e2", label: "E2 · Coord. polare" },
  { id: "e3", label: "E3 · U efectiv" },
  { id: "e4", label: "E4 · Binet / conice" },
  { id: "e5", label: "E5 · Hohmann" },
  { id: "e6", label: "E6 · 2 corpuri" },
];

// ─────────────────────────────────────────────────────
//  Shared canvas hook
// ─────────────────────────────────────────────────────
function useCanvas(drawFn, deps) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  const loop = useCallback(() => {
    if (!pausedRef.current) {
      const cv = ref.current;
      if (cv) {
        const ctx = cv.getContext("2d");
        drawFn(ctx, cv.width, cv.height);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [drawFn]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  const pause  = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; rafRef.current = requestAnimationFrame(loop); };
  const toggle = () => pausedRef.current ? resume() : pause();
  return { ref, toggle, isPaused: () => pausedRef.current };
}

function ValBox({ label, value, color }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "3px 10px", fontSize: 12 }}>
      <span style={{ color: "var(--color-text-secondary)" }}>{label} </span>
      <b style={{ color: color || "var(--color-text-primary)" }}>{value}</b>
    </div>
  );
}

function Btn({ children, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, padding: "4px 11px", borderRadius: 6,
      border: active ? "1.5px solid var(--color-border-primary)" : "0.5px solid var(--color-border-secondary)",
      background: active ? "var(--color-background-secondary)" : "transparent",
      color: "var(--color-text-primary)", cursor: "pointer", ...style,
    }}>{children}</button>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────
//  E0 — Momentul cinetic vectorial
// ─────────────────────────────────────────────────────
function E0() {
  const [mode, setMode] = useState("linear");
  const [speed, setSpeed] = useState(1.2);
  const [paused, setPaused] = useState(false);
  const stateRef = useRef({ t: 0, trail: [], mode: "linear", speed: 1.2, paused: false });
  const vals = useRef({ r: "—", p: "—", L: "—", phi: "—" });
  const [, forceUpdate] = useState(0);
  const rafRef = useRef(null);
  const cvRef = useRef(null);

  useEffect(() => { stateRef.current.mode = mode; stateRef.current.t = 0; stateRef.current.trail = []; }, [mode]);
  useEffect(() => { stateRef.current.speed = speed; }, [speed]);
  useEffect(() => { stateRef.current.paused = paused; }, [paused]);

  function arrow(ctx, x1, y1, x2, y2, col, lbl, lside, lw = 2) {
    const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
    if (len < 3) return;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    const ux=dx/len,uy=dy/len,hw=8,hh=4;
    ctx.beginPath(); ctx.moveTo(x2,y2);
    ctx.lineTo(x2-hw*ux+hh*uy,y2-hw*uy-hh*ux);
    ctx.lineTo(x2-hw*ux-hh*uy,y2-hw*uy+hh*ux);
    ctx.closePath(); ctx.fill();
    if (lbl) { ctx.font="500 12px sans-serif"; ctx.fillStyle=col; const nx=-uy,ny=ux,off=lside===-1?-14:14; ctx.fillText(lbl,(x1+x2)/2+nx*off-5,(y1+y2)/2+ny*off+4); }
    ctx.restore();
  }

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const O = {x: W/2, y: H/2};
    const s = stateRef.current;
    const ctx = cv.getContext("2d");

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#f8f7f3"; ctx.fillRect(0,0,W,H);
      const sp = s.speed;
      let rx, ry, vx, vy;
      if (s.mode === "linear") {
        const d=70, x0=-180;
        const tt = s.t/60;
        rx=x0+sp*55*tt; ry=-d; vx=sp*55; vy=0;
      } else {
        const R=120, omega=sp*0.022, a=omega*s.t;
        rx=R*Math.cos(a); ry=R*Math.sin(a);
        const spd=sp*55*0.38;
        vx=-Math.sin(a)*spd; vy=Math.cos(a)*spd;
      }
      const px=O.x+rx, py=O.y-ry;
      s.trail.push({x:px,y:py});
      if(s.trail.length>180) s.trail.shift();
      if(s.mode==='linear'&&(px<-20||px>W+20)){s.t=0;s.trail=[];}
      ctx.save(); ctx.beginPath();
      if(s.trail.length>1){ctx.moveTo(s.trail[0].x,s.trail[0].y);for(const p of s.trail)ctx.lineTo(p.x,p.y);}
      ctx.strokeStyle="rgba(60,60,55,0.15)"; ctx.lineWidth=1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(O.x,O.y,5,0,Math.PI*2); ctx.fillStyle="#666"; ctx.fill();
      ctx.font="12px sans-serif"; ctx.fillStyle="#888"; ctx.fillText("O",O.x+8,O.y-6); ctx.restore();
      arrow(ctx,O.x,O.y,O.x+rx,O.y-ry,C.blue,"r",1);
      arrow(ctx,px,py,px+vx*0.55,py-vy*0.55,C.red,"p",-1);
      const Lz_phys=-(rx*vy-ry*vx);
      const Lmag=Math.abs(rx*vy-ry*vx);
      const Llen=Math.min(Lmag*0.012,110)+20;
      const lx=O.x+rx*0.45, ly=O.y-ry*0.45;
      ctx.save(); ctx.strokeStyle=C.green; ctx.fillStyle=C.green; ctx.lineWidth=2.5;
      if(Lz_phys>0){
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx,ly-Llen);ctx.stroke();
        ctx.beginPath();ctx.moveTo(lx,ly-Llen);ctx.lineTo(lx-5,ly-Llen+10);ctx.lineTo(lx+5,ly-Llen+10);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.arc(lx,ly-Llen-10,7,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.arc(lx,ly-Llen-10,2.5,0,Math.PI*2);ctx.fill();
        ctx.font="500 11px sans-serif";ctx.fillText("L (⊙ ieșind)",lx+12,ly-Llen/2);
      } else {
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx,ly+Llen);ctx.stroke();
        ctx.beginPath();ctx.moveTo(lx,ly+Llen);ctx.lineTo(lx-5,ly+Llen-10);ctx.lineTo(lx+5,ly+Llen-10);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.arc(lx,ly+Llen+10,7,0,Math.PI*2);ctx.stroke();
        ctx.lineWidth=1.5;const r7=7;
        ctx.beginPath();ctx.moveTo(lx-r7*0.65,ly+Llen+10-r7*0.65);ctx.lineTo(lx+r7*0.65,ly+Llen+10+r7*0.65);ctx.stroke();
        ctx.beginPath();ctx.moveTo(lx+r7*0.65,ly+Llen+10-r7*0.65);ctx.lineTo(lx-r7*0.65,ly+Llen+10+r7*0.65);ctx.stroke();
        ctx.font="500 11px sans-serif";ctx.fillText("L (⊗ intrând)",lx+12,ly+Llen/2);
      }
      ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fillStyle=C.red;ctx.fill();ctx.restore();
      const rmag=Math.sqrt(rx*rx+ry*ry),pmag=Math.sqrt(vx*vx+vy*vy);
      const cosA=(rx*vx+ry*vy)/(rmag*pmag+1e-9);
      vals.current={r:rmag.toFixed(1),p:pmag.toFixed(1),L:Lmag.toFixed(1),phi:(Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI).toFixed(1)+"°"};
      if(!s.paused){s.t++;rafRef.current=requestAnimationFrame(draw);forceUpdate(n=>n+1);}
    }
    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} width={480} height={280} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <ValBox label="|r| =" value={vals.current.r}/>
        <ValBox label="|p| =" value={vals.current.p}/>
        <ValBox label="|L| =" value={vals.current.L} color={C.green}/>
        <ValBox label="φ(r,p) =" value={vals.current.phi}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8,alignItems:"center"}}>
        <Btn active={mode==="linear"} onClick={()=>setMode("linear")}>Rectilinie</Btn>
        <Btn active={mode==="circular"} onClick={()=>setMode("circular")}>Circulară</Btn>
        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Viteză:</span>
        <input type="range" min="0.3" max="2.5" step="0.1" value={speed} onChange={e=>setSpeed(+e.target.value)} style={{flex:1,minWidth:80}}/>
        <Btn onClick={()=>{setPaused(p=>{stateRef.current.paused=!p;if(p){const cv=cvRef.current;if(cv){const s=stateRef.current;const ctx=cv.getContext("2d");const W=cv.width,H=cv.height;/* resume handled by useEffect */stateRef.current.paused=false;const loop=()=>{if(!stateRef.current.paused){rafRef.current=requestAnimationFrame(loop);}}; rafRef.current=requestAnimationFrame(loop);}} return !p;})}}>{paused?"▶ Redă":"⏸ Pauză"}</Btn>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <Badge color={C.blue}>r</Badge>
        <Badge color={C.red}>p = mv</Badge>
        <Badge color={C.green}>L = r × p</Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  E1 — Forță centrală, legea ariilor
// ─────────────────────────────────────────────────────
function E1() {
  const cvRef = useRef(null);
  const sRef = useRef({ angle:0, areas:[], wedge:[], areaTimer:0, colorIdx:0, frame:0, paused:false, showAreas:true, mode:"ellipse" });
  const [paused,setPaused]=useState(false);
  const [showAreas,setShowAreas]=useState(true);
  const [mode,setMode]=useState("ellipse");
  const vals=useRef({tau:"0.00",L:"—",dA:"—",r:"—",v:"—"});
  const rafRef=useRef(null);
  const [,fu]=useState(0);
  const ORBITS={ellipse:{a:105,b:90},circle:{a:88,b:88}};
  const AREA_INT=55;
  const AREA_COLS=["rgba(127,119,221,0.25)","rgba(127,119,221,0.18)","rgba(127,119,221,0.13)"];

  useEffect(()=>{sRef.current.mode=mode;sRef.current.angle=0;sRef.current.areas=[];sRef.current.wedge=[];sRef.current.areaTimer=0;sRef.current.frame=0;},[mode]);
  useEffect(()=>{sRef.current.showAreas=showAreas;},[showAreas]);
  useEffect(()=>{sRef.current.paused=paused;},[paused]);

  function getPos(th,m){const{a,b}=ORBITS[m];const c=Math.sqrt(Math.max(0,a*a-b*b));return{x:a*Math.cos(th)+c,y:b*Math.sin(th)};}
  function getVel(th,m){const{a,b}=ORBITS[m];const c=Math.sqrt(Math.max(0,a*a-b*b));const pos=getPos(th,m);const r=Math.sqrt(pos.x*pos.x+pos.y*pos.y);const e=c/a;const L_sq=a*(1-e*e);const dt=Math.sqrt(Math.max(0,L_sq))/(r*r);return{vx:-a*Math.sin(th)*dt,vy:b*Math.cos(th)*dt,dtheta:dt,r_phys:r};}
  function arrow(ctx,x1,y1,x2,y2,col,lbl,lside,lw=2){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return;ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const ux=dx/len,uy=dy/len,hw=7,hh=3.5;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-hw*ux+hh*uy,y2-hw*uy-hh*ux);ctx.lineTo(x2-hw*ux-hh*uy,y2-hw*uy+hh*ux);ctx.closePath();ctx.fill();if(lbl){ctx.font="500 11px sans-serif";ctx.fillStyle=col;const nx=-uy,ny=ux,off=lside===-1?-13:13;ctx.fillText(lbl,(x1+x2)/2+nx*off-4,(y1+y2)/2+ny*off+4);}ctx.restore();}

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const W=cv.width,H=cv.height,O={x:W*0.42,y:H/2};
    const ctx=cv.getContext("2d");
    const s=sRef.current;
    function draw(){
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#f8f7f3";ctx.fillRect(0,0,W,H);
      const{a,b}=ORBITS[s.mode];const c=Math.sqrt(Math.max(0,a*a-b*b));
      ctx.save();ctx.translate(O.x+c,O.y);ctx.beginPath();ctx.ellipse(0,0,a,b,0,0,Math.PI*2);ctx.strokeStyle="rgba(60,60,55,0.11)";ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(O.x,O.y,4,0,Math.PI*2);ctx.fillStyle="#666";ctx.fill();ctx.font="11px sans-serif";ctx.fillStyle="#777";ctx.fillText("O",O.x+7,O.y-6);ctx.restore();
      const pos=getPos(s.angle,s.mode);const vel=getVel(s.angle,s.mode);
      const px=O.x+pos.x,py=O.y-pos.y;
      const r=Math.sqrt(pos.x*pos.x+pos.y*pos.y);
      const vmag=Math.sqrt(vel.vx*vel.vx+vel.vy*vel.vy);
      if(s.showAreas){
        for(const area of s.areas){ctx.save();ctx.beginPath();ctx.moveTo(O.x,O.y);for(const p of area.pts)ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fillStyle=area.color;ctx.fill();ctx.strokeStyle="rgba(127,119,221,0.35)";ctx.lineWidth=0.5;ctx.stroke();ctx.restore();}
        if(s.frame%2===0)s.wedge.push({x:px,y:py});
        s.areaTimer++;
        if(s.areaTimer>=AREA_INT){s.areas.push({pts:[...s.wedge],color:AREA_COLS[s.colorIdx%3]});s.colorIdx++;if(s.areas.length>3)s.areas.shift();s.wedge=[];s.areaTimer=0;}
      }
      arrow(ctx,O.x,O.y,px,py,C.blue,"r",1);
      const fux=-pos.x/r,fuy=pos.y/r;
      arrow(ctx,px,py,px+fux*55,py+fuy*55,C.red,"F",-1);
      const vux=vmag>0?vel.vx/vmag:0,vuy=vmag>0?-vel.vy/vmag:0;
      arrow(ctx,px,py,px+vux*50,py+vuy*50,C.amber,"v",1,2.5);
      ctx.save();ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fillStyle=C.red;ctx.fill();ctx.restore();
      ctx.save();ctx.font="11px sans-serif";ctx.fillStyle=C.green;ctx.fillText("τ = r × F = 0",10,H-10);ctx.restore();
      const L=Math.abs(pos.x*vel.vy-pos.y*vel.vx);
      vals.current={tau:"0.00",L:L.toFixed(3),dA:(L/2).toFixed(3),r:r.toFixed(1),v:vmag.toFixed(3)};
      if(!s.paused){s.angle+=vel.dtheta*3.5;if(s.angle>Math.PI*2)s.angle-=Math.PI*2;s.frame++;rafRef.current=requestAnimationFrame(draw);fu(n=>n+1);}
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} width={480} height={280} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <ValBox label="|τ| =" value={vals.current.tau} color={C.green}/>
        <ValBox label="|L| =" value={vals.current.L} color={C.green}/>
        <ValBox label="dA/dt =" value={vals.current.dA} color={C.purple}/>
        <ValBox label="r =" value={vals.current.r}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <Btn active={mode==="ellipse"} onClick={()=>setMode("ellipse")}>Elipsă</Btn>
        <Btn active={mode==="circle"} onClick={()=>setMode("circle")}>Cerc</Btn>
        <Btn active={showAreas} onClick={()=>setShowAreas(a=>!a)}>Arii {showAreas?"✓":"✗"}</Btn>
        <Btn onClick={()=>setPaused(p=>{sRef.current.paused=!p;if(p)rafRef.current=requestAnimationFrame(function loop(){if(!sRef.current.paused){rafRef.current=requestAnimationFrame(loop);}});return!p;})}>{paused?"▶ Redă":"⏸ Pauză"}</Btn>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <Badge color={C.blue}>r</Badge><Badge color={C.red}>F centrală</Badge>
        <Badge color={C.amber}>v</Badge><Badge color={C.purple}>arii egale</Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  E2 — Coordonate polare
// ─────────────────────────────────────────────────────
function E2() {
  const cvRef=useRef(null);
  const sRef=useRef({angle:0,paused:false,showDecomp:true,mode:"ellipse"});
  const [paused,setPaused]=useState(false);
  const [showDecomp,setShowDecomp]=useState(true);
  const [mode,setMode]=useState("ellipse");
  const vals=useRef({r:"—",th:"—",vr:"—",vt:"—",L:"—"});
  const rafRef=useRef(null);const[,fu]=useState(0);
  const ORBITS={ellipse:{a:105,b:90},circle:{a:85,b:85}};
  let V_SCALE=useRef(1);

  useEffect(()=>{sRef.current.mode=mode;sRef.current.angle=0;calibrate(mode);},[mode]);
  useEffect(()=>{sRef.current.showDecomp=showDecomp;},[showDecomp]);
  useEffect(()=>{sRef.current.paused=paused;},[paused]);

  function getPos(th,m){const{a,b}=ORBITS[m];const c=Math.sqrt(Math.max(0,a*a-b*b));return{x:a*Math.cos(th)+c,y:b*Math.sin(th)};}
  function getVel(th,m){const{a,b}=ORBITS[m];const pos=getPos(th,m);const r=Math.sqrt(pos.x*pos.x+pos.y*pos.y);const c=Math.sqrt(Math.max(0,a*a-b*b));const e=c/a;const L_sq=a*(1-e*e);const dt=Math.sqrt(Math.max(0,L_sq))/(r*r);return{vx:-a*Math.sin(th)*dt,vy:b*Math.cos(th)*dt,dtheta:dt,r_phys:r};}
  function getRdot(th,dt,m){const{a,b}=ORBITS[m];const pos=getPos(th,m);const r=Math.sqrt(pos.x*pos.x+pos.y*pos.y);return((-a*Math.sin(th)*pos.x+b*Math.cos(th)*pos.y)/r)*dt;}
  function calibrate(m){let vmin=Infinity;for(let i=0;i<360;i++){const th=(i/360)*Math.PI*2;const v=getVel(th,m);const vm=Math.sqrt(v.vx*v.vx+v.vy*v.vy);if(vm<vmin)vmin=vm;}V_SCALE.current=35/vmin;}

  function arrow(ctx,x1,y1,x2,y2,col,lbl,lside,lw=2){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<3)return;ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const ux=dx/len,uy=dy/len,hw=8,hh=4;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-hw*ux+hh*uy,y2-hw*uy-hh*ux);ctx.lineTo(x2-hw*ux-hh*uy,y2-hw*uy+hh*ux);ctx.closePath();ctx.fill();if(lbl){ctx.font="500 12px sans-serif";ctx.fillStyle=col;const nx=-uy,ny=ux,off=lside===-1?-14:14;ctx.fillText(lbl,(x1+x2)/2+nx*off-5,(y1+y2)/2+ny*off+4);}ctx.restore();}

  useEffect(()=>{
    calibrate("ellipse");
    const cv=cvRef.current;if(!cv)return;
    const W=cv.width,H=cv.height,O={x:W/2-15,y:H/2};
    const ctx=cv.getContext("2d");const s=sRef.current;
    function draw(){
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#f8f7f3";ctx.fillRect(0,0,W,H);
      const{a,b}=ORBITS[s.mode];const c=Math.sqrt(Math.max(0,a*a-b*b));
      ctx.save();ctx.translate(O.x+c,O.y);ctx.beginPath();ctx.ellipse(0,0,a,b,0,0,Math.PI*2);ctx.strokeStyle="rgba(60,60,55,0.11)";ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(O.x,O.y,4,0,Math.PI*2);ctx.fillStyle="#666";ctx.fill();ctx.font="11px sans-serif";ctx.fillStyle="#777";ctx.fillText("O",O.x+7,O.y-6);ctx.restore();
      const pos=getPos(s.angle,s.mode);const vel=getVel(s.angle,s.mode);
      const{dtheta,r_phys}=vel;const rdot=getRdot(s.angle,dtheta,s.mode);
      const px=O.x+pos.x,py=O.y-pos.y;
      const rc_x=pos.x/r_phys,rc_y=-pos.y/r_phys;
      const tc_x=-pos.y/r_phys,tc_y=-pos.x/r_phys;
      const UL=48;
      arrow(ctx,px,py,px+rc_x*UL,py+rc_y*UL,C.blue,"r̂",1,2);
      arrow(ctx,px,py,px+tc_x*UL,py+tc_y*UL,C.purple,"θ̂",-1,2);
      const vth_phys=r_phys*dtheta;
      const S=V_SCALE.current;
      const vr_cx=rc_x*rdot*S,vr_cy=rc_y*rdot*S;
      const vth_cx=tc_x*vth_phys*S,vth_cy=tc_y*vth_phys*S;
      if(s.showDecomp){
        ctx.save();ctx.setLineDash([3,4]);
        ctx.strokeStyle=C.red;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+vr_cx,py+vr_cy);ctx.stroke();
        ctx.strokeStyle=C.green;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+vth_cx,py+vth_cy);ctx.stroke();
        ctx.restore();
        ctx.save();ctx.font="500 11px sans-serif";
        if(Math.abs(rdot)*S>10){ctx.fillStyle=C.red;ctx.fillText("ṙr̂",px+vr_cx/2+5,py+vr_cy/2-4);}
        ctx.fillStyle=C.green;ctx.fillText("rθ̇θ̂",px+vth_cx/2+5,py+vth_cy/2-4);ctx.restore();
        ctx.save();ctx.setLineDash([2,5]);ctx.strokeStyle="rgba(0,0,0,0.10)";ctx.lineWidth=0.8;
        ctx.beginPath();ctx.moveTo(px+vr_cx,py+vr_cy);ctx.lineTo(px+vr_cx+vth_cx,py+vr_cy+vth_cy);
        ctx.moveTo(px+vth_cx,py+vth_cy);ctx.lineTo(px+vth_cx+vr_cx,py+vth_cy+vr_cy);ctx.stroke();ctx.restore();
      }
      const vendx=px+vr_cx+vth_cx,vendy=py+vr_cy+vth_cy;
      arrow(ctx,px,py,vendx,vendy,C.amber,"v",1,3);
      ctx.save();ctx.strokeStyle="rgba(55,138,221,0.28)";ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(O.x,O.y);ctx.lineTo(px,py);ctx.stroke();ctx.restore();
      const sq=8;ctx.save();ctx.strokeStyle="rgba(0,0,0,0.16)";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(px+rc_x*sq,py+rc_y*sq);ctx.lineTo(px+rc_x*sq+tc_x*sq,py+rc_y*sq+tc_y*sq);ctx.lineTo(px+tc_x*sq,py+tc_y*sq);ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fillStyle=C.amber;ctx.fill();ctx.restore();
      ctx.save();ctx.font="11px sans-serif";ctx.fillStyle="rgba(60,60,55,0.38)";ctx.fillText("v = ṙr̂ + rθ̇θ̂",10,H-10);ctx.restore();
      const L_val=r_phys*r_phys*dtheta;
      vals.current={r:r_phys.toFixed(1),th:dtheta.toFixed(4),vr:rdot.toFixed(3),vt:vth_phys.toFixed(3),L:L_val.toFixed(3)};
      if(!s.paused){s.angle+=dtheta*3.5;if(s.angle>Math.PI*2)s.angle-=Math.PI*2;rafRef.current=requestAnimationFrame(draw);fu(n=>n+1);}
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} width={480} height={280} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <ValBox label="r =" value={vals.current.r}/>
        <ValBox label="θ̇ =" value={vals.current.th}/>
        <ValBox label="vᵣ =" value={vals.current.vr} color={C.red}/>
        <ValBox label="v_θ =" value={vals.current.vt} color={C.green}/>
        <ValBox label="L=r²θ̇ =" value={vals.current.L} color={C.green}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <Btn active={mode==="ellipse"} onClick={()=>setMode("ellipse")}>Elipsă</Btn>
        <Btn active={mode==="circle"} onClick={()=>setMode("circle")}>Cerc</Btn>
        <Btn active={showDecomp} onClick={()=>setShowDecomp(d=>!d)}>Descomp. v {showDecomp?"✓":"✗"}</Btn>
        <Btn onClick={()=>setPaused(p=>{sRef.current.paused=!p;if(p)rafRef.current=requestAnimationFrame(function loop(){if(!sRef.current.paused)rafRef.current=requestAnimationFrame(loop);});return!p;})}>{paused?"▶ Redă":"⏸ Pauză"}</Btn>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <Badge color={C.blue}>r̂</Badge><Badge color={C.purple}>θ̂</Badge>
        <Badge color={C.amber}>v</Badge><Badge color={C.red}>ṙr̂</Badge><Badge color={C.green}>rθ̇θ̂</Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  E3 — Potențial efectiv  (Canvas 2D graf + orbită)
// ─────────────────────────────────────────────────────
function E3() {
  const cvRef=useRef(null);
  const [preset,setPreset]=useState("circ");
  const [L,setL]=useState(2.5);
  const sRef=useRef({preset:"circ",L:2.5,animT:0});
  const rafRef=useRef(null);const[,fu]=useState(0);

  const PRESETS=["circ","el1","el2","par","hyp"];
  function Emin(L){return L*L/(2*L*L*L*L)-1/(L*L);}// L²/2r₀²-1/r₀, r₀=L²
  function Uef(r,L){return L*L/(2*r*r)-1/r;}
  function getE(pr,L){const em=Emin(L);if(pr==="circ")return em;if(pr==="el1")return em*0.5;if(pr==="el2")return em*0.1;if(pr==="par")return 0;return Math.abs(em)*0.4;}
  function getBounds(E,L){const pts=[];let prev=Uef(0.26,L)-E;for(let i=1;i<=2000;i++){const r=0.26+(8.5-0.26)*i/2000;const cur=Uef(r,L)-E;if(prev*cur<0)pts.push(r-(8.5-0.26)/2000*cur/(cur-prev));prev=cur;}return pts;}
  function classify(E,L){const em=Emin(L);if(Math.abs(E-em)<Math.abs(em)*0.03+0.001)return{type:"cerc",color:C.green};if(E<-0.001)return{type:"elipsă",color:C.green};if(Math.abs(E)<0.006)return{type:"parabolă",color:C.amber};return{type:"hiperbolă",color:C.red};}
  function orbitScale(E,L,bounds,pH){const info=classify(E,L);let mR;if(info.type==="cerc")mR=L*L;else if(info.type==="elipsă"&&bounds.length>=2)mR=bounds[bounds.length-1];else mR=6;return Math.min(pH*0.38/Math.max(mR,0.1),40);}

  useEffect(()=>{sRef.current.preset=preset;},[preset]);
  useEffect(()=>{sRef.current.L=L;},[L]);

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const W=cv.width,H=cv.height;
    const GH=295,Oy=GH+8,OH=H-Oy;
    const GL=52,GR=W-18,GT=26,GB=GH-16;
    const R_MIN=0.25,R_MAX=8.5,U_MIN=-2.2,U_MAX=1.5;
    function rx2px(r){return GL+(r-R_MIN)/(R_MAX-R_MIN)*(GR-GL);}
    function u2py(u){return GB-(u-U_MIN)/(U_MAX-U_MIN)*(GB-GT);}
    const ctx=cv.getContext("2d");const s=sRef.current;

    function draw(){
      const E=getE(s.preset,s.L);const Lv=s.L;
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#f8f7f3";ctx.fillRect(0,0,W,H);
      const zy=u2py(0);
      ctx.save();ctx.strokeStyle="rgba(60,60,55,0.18)";ctx.lineWidth=0.8;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(GL,zy);ctx.lineTo(GR,zy);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(GL,GB);ctx.lineTo(GR,GB);ctx.stroke();ctx.restore();
      ctx.save();ctx.font="11px sans-serif";ctx.fillStyle="rgba(60,60,55,0.4)";ctx.fillText("r",GR+4,GB+4);ctx.fillText("U",GL-16,GT+8);ctx.fillText("0",GL-14,zy+4);
      for(let r=1;r<=8;r++){const x=rx2px(r);if(x<GR){ctx.beginPath();ctx.moveTo(x,GB);ctx.lineTo(x,GB+3);ctx.stroke();ctx.fillText(r,x-3,GB+13);}}ctx.restore();
      // U_grav
      ctx.save();ctx.strokeStyle=C.red;ctx.lineWidth=1.2;ctx.setLineDash([4,4]);ctx.beginPath();let first=true;
      for(let r=0.26;r<=R_MAX;r+=0.04){const u=-1/r,py=u2py(u);if(u<U_MIN||u>U_MAX){first=true;continue;}first?ctx.moveTo(rx2px(r),py):ctx.lineTo(rx2px(r),py);first=false;}ctx.stroke();ctx.restore();
      // U_cent
      ctx.save();ctx.strokeStyle=C.blue;ctx.lineWidth=1.2;ctx.setLineDash([4,4]);ctx.beginPath();first=true;
      for(let r=0.26;r<=R_MAX;r+=0.04){const u=Lv*Lv/(2*r*r),py=u2py(u);if(u<U_MIN||u>U_MAX){first=true;continue;}first?ctx.moveTo(rx2px(r),py):ctx.lineTo(rx2px(r),py);first=false;}ctx.stroke();ctx.restore();
      // U_ef
      ctx.save();ctx.strokeStyle=C.purple;ctx.lineWidth=2.5;ctx.setLineDash([]);ctx.beginPath();first=true;
      for(let r=0.26;r<=R_MAX;r+=0.03){const u=Uef(r,Lv),py=u2py(u);if(u<U_MIN||u>U_MAX){first=true;continue;}first?ctx.moveTo(rx2px(r),py):ctx.lineTo(rx2px(r),py);first=false;}ctx.stroke();ctx.restore();
      // E line
      const epy=u2py(E);if(epy>=GT&&epy<=GB){ctx.save();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(GL,epy);ctx.lineTo(GR,epy);ctx.stroke();ctx.fillStyle=C.amber;ctx.font="500 11px sans-serif";ctx.fillText("E",GR+4,epy+4);ctx.restore();}
      // Allowed region
      const bounds=getBounds(E,Lv);
      if(bounds.length>=2){const x1=rx2px(bounds[0]),x2=rx2px(bounds[bounds.length-1]);ctx.save();ctx.fillStyle="rgba(239,159,39,0.09)";ctx.fillRect(x1,GT,x2-x1,GB-GT);ctx.strokeStyle="rgba(239,159,39,0.5)";ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x1,GT);ctx.lineTo(x1,GB);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,GT);ctx.lineTo(x2,GB);ctx.stroke();ctx.restore();}
      else if(bounds.length===1){const x1=rx2px(bounds[0]);ctx.save();ctx.fillStyle="rgba(239,159,39,0.07)";ctx.fillRect(x1,GT,GR-x1,GB-GT);ctx.strokeStyle="rgba(239,159,39,0.5)";ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x1,GT);ctx.lineTo(x1,GB);ctx.stroke();ctx.restore();}
      // Emin dot
      const r0=Lv*Lv,em=Uef(r0,Lv);if(em>=U_MIN&&em<=U_MAX){ctx.save();ctx.beginPath();ctx.arc(rx2px(r0),u2py(em),4,0,Math.PI*2);ctx.fillStyle=C.purple;ctx.fill();ctx.font="10px sans-serif";ctx.fillStyle="rgba(80,75,180,0.75)";ctx.fillText("E_min",rx2px(r0)+6,u2py(em)-5);ctx.restore();}
      ctx.save();ctx.font="500 11px sans-serif";ctx.fillStyle=C.purple;ctx.fillText("U_ef(r) = L²/2mr² − GMm/r",GL+4,GT+12);ctx.restore();
      // Orbit panel
      ctx.save();ctx.strokeStyle="rgba(0,0,0,0.07)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,Oy-1);ctx.lineTo(W,Oy-1);ctx.stroke();ctx.restore();
      ctx.save();ctx.font="500 11px sans-serif";ctx.fillStyle="rgba(60,60,55,0.3)";ctx.fillText("Orbita:",10,Oy+14);ctx.restore();
      const info=classify(E,Lv);
      const OCX=W*0.6,OCY=Oy+OH/2+4;
      const SC=orbitScale(E,Lv,bounds,OH);
      ctx.save();ctx.beginPath();ctx.arc(OCX,OCY,5,0,Math.PI*2);ctx.fillStyle="#666";ctx.fill();ctx.font="11px sans-serif";ctx.fillStyle="#777";ctx.fillText("O",OCX+7,OCY-5);ctx.restore();
      ctx.save();ctx.strokeStyle=info.color;ctx.lineWidth=2;ctx.setLineDash([]);
      if(info.type==="cerc"){ctx.beginPath();ctx.arc(OCX,OCY,r0*SC,0,Math.PI*2);ctx.stroke();}
      else if(info.type==="elipsă"&&bounds.length>=2){const rmin=bounds[0],rmax=bounds[bounds.length-1];const a=(rmin+rmax)/2,c2=a-rmin;const b2=Math.sqrt(Math.max(0,a*a-c2*c2));ctx.beginPath();ctx.ellipse(OCX+c2*SC,OCY,a*SC,b2*SC,0,0,Math.PI*2);ctx.stroke();}
      else if(info.type==="parabolă"){ctx.beginPath();let ff=true;for(let d=-155;d<=155;d+=2){const th=d*Math.PI/180;const r=Lv*Lv/(1+Math.cos(th));if(r>0&&r<20){const x=OCX+r*SC*Math.cos(th+Math.PI);const y=OCY-r*SC*Math.sin(th+Math.PI);ff?ctx.moveTo(x,y):ctx.lineTo(x,y);ff=false;}}ctx.stroke();}
      else if(info.type==="hiperbolă"){const eo=Math.sqrt(1+2*E*Lv*Lv);ctx.beginPath();let ff=true;const thm=Math.acos(-1/eo)-0.05;for(let t=-thm;t<=thm;t+=0.02){const r=Lv*Lv/(1+eo*Math.cos(t));if(r>0&&r<20){const x=OCX+r*SC*Math.cos(t+Math.PI);const y=OCY-r*SC*Math.sin(t+Math.PI);ff?ctx.moveTo(x,y):ctx.lineTo(x,y);ff=false;}}ctx.stroke();}
      ctx.restore();
      // Animated dot
      if(info.type==="cerc"){const px=OCX+r0*SC*Math.cos(s.animT);const py=OCY-r0*SC*Math.sin(s.animT);ctx.save();ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fillStyle=info.color;ctx.fill();ctx.restore();s.animT+=0.018;}
      else if(info.type==="elipsă"&&bounds.length>=2){const rmin=bounds[0],rmax=bounds[bounds.length-1];const a=(rmin+rmax)/2,c2=a-rmin;const b2=Math.sqrt(Math.max(0,a*a-c2*c2));const px=OCX+c2*SC+a*SC*Math.cos(s.animT);const py=OCY-b2*SC*Math.sin(s.animT);ctx.save();ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fillStyle=info.color;ctx.fill();ctx.restore();s.animT+=0.013;}
      if(s.animT>Math.PI*2)s.animT-=Math.PI*2;
      rafRef.current=requestAnimationFrame(draw);fu(n=>n+1);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  const PRESET_DEFS=[{id:"circ",label:"Cerc",sub:"E_min"},{id:"el1",label:"Elipsă mică",sub:"0.5 E_min"},{id:"el2",label:"Elipsă mare",sub:"0.1 E_min"},{id:"par",label:"Parabolă",sub:"E=0"},{id:"hyp",label:"Hiperbolă",sub:"E>0"}];
  const COLS={circ:C.green,el1:C.green,el2:C.green,par:C.amber,hyp:C.red};

  return(
    <div>
      <canvas ref={cvRef} width={480} height={560} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
        {PRESET_DEFS.map(p=>(
          <button key={p.id} onClick={()=>{setPreset(p.id);sRef.current.preset=p.id;sRef.current.animT=0;}} style={{fontSize:12,padding:"5px 11px",borderRadius:6,border:`${preset===p.id?"1.5px":"0.5px"} solid ${preset===p.id?COLS[p.id]:"var(--color-border-secondary)"}`,background:"transparent",color:"var(--color-text-primary)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:11,fontWeight:500,color:COLS[p.id]}}>{p.label}</span>
            <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{p.sub}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>L:</span>
        <input type="range" min="1" max="4" step="0.5" value={L} onChange={e=>{setL(+e.target.value);sRef.current.L=+e.target.value;}} style={{flex:1,minWidth:80}}/>
        <ValBox label="L =" value={L.toFixed(1)}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <Badge color={C.purple}>U_ef</Badge><Badge color={C.red}>U grav</Badge>
        <Badge color={C.blue}>U centrifug</Badge><Badge color={C.amber}>E</Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  E4 — Binet / conice
// ─────────────────────────────────────────────────────
function E4() {
  const cvRef=useRef(null);
  const [e,setE]=useState(0.6);
  const [p,setP]=useState(1.2);
  const [preset,setPreset]=useState(1);
  const sRef=useRef({e:0.6,p:1.2,animT:0});
  const rafRef=useRef(null);const[,fu]=useState(0);
  const PRESETS_E=[{e:0,p:1.2},{e:0.6,p:1.2},{e:0.9,p:1.2},{e:1,p:1.2},{e:1.5,p:1.2}];
  const PLABELS=["Cerc","Elipsă","Elipsă alungită","Parabolă","Hiperbolă"];
  const PSUBS=["e=0","e=0.6","e=0.9","e=1","e=1.5"];

  useEffect(()=>{sRef.current.e=e;sRef.current.p=p;},[e,p]);

  function ocol(e){if(e<0.99)return C.green;if(e<1.01)return C.amber;return C.red;}

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const W=cv.width,H=cv.height;
    const FX=W*0.38,FY=H*0.5;
    const ctx=cv.getContext("2d");const s=sRef.current;
    function draw(){
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#f8f7f3";ctx.fillRect(0,0,W,H);
      const{e:ev,p:pv}=s;
      const col=ocol(ev);
      let rRef;if(ev<1)rRef=pv/(1-ev);else if(ev===1)rRef=pv*4;else rRef=pv/(ev-1)*1.5;
      const maxPx=Math.min(FX,FY,W-FX,H-FY)*0.85;
      const SC=Math.min(maxPx/Math.max(rRef,0.01),120);
      [1,2,3,4,5].forEach(n=>{ctx.save();ctx.strokeStyle="rgba(60,60,55,0.07)";ctx.lineWidth=0.5;ctx.beginPath();ctx.arc(FX,FY,n*SC*0.5,0,Math.PI*2);ctx.stroke();ctx.restore();});
      ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.setLineDash([]);ctx.beginPath();let first=true;
      const TH_MAX=ev>=1?Math.acos(-1/ev)-0.04:Math.PI;
      for(let i=0;i<=1200;i++){const th=-TH_MAX+2*TH_MAX*i/1200;const r=pv/(1+ev*Math.cos(th));if(r<0||r>999){first=true;continue;}const x=FX+r*SC*Math.cos(th);const y=FY-r*SC*Math.sin(th);if(x<-20||x>W+20||y<-20||y>H+20){first=true;continue;}first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}ctx.stroke();ctx.restore();
      const rmin=pv/(1+ev);ctx.save();ctx.strokeStyle="rgba(60,60,55,0.2)";ctx.lineWidth=0.8;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(FX,FY);ctx.lineTo(FX+rmin*SC,FY);ctx.stroke();ctx.font="10px sans-serif";ctx.fillStyle="rgba(60,60,55,0.45)";ctx.fillText("r_min",FX+rmin*SC/2-10,FY-5);ctx.restore();
      if(ev<0.99){const rmax=pv/(1-ev);ctx.save();ctx.strokeStyle="rgba(60,60,55,0.2)";ctx.lineWidth=0.8;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(FX,FY);ctx.lineTo(FX-rmax*SC,FY);ctx.stroke();ctx.font="10px sans-serif";ctx.fillStyle="rgba(60,60,55,0.45)";ctx.fillText("r_max",FX-rmax*SC/2-10,FY-5);ctx.restore();}
      ctx.save();ctx.beginPath();ctx.arc(FX,FY,5,0,Math.PI*2);ctx.fillStyle="#666";ctx.fill();ctx.font="11px sans-serif";ctx.fillStyle="#777";ctx.fillText("O (focar)",FX+8,FY-7);ctx.restore();
      if(ev<0.99){const ra=pv/(1+ev*Math.cos(s.animT));const ppx=FX+ra*SC*Math.cos(s.animT);const ppy=FY-ra*SC*Math.sin(s.animT);ctx.save();ctx.strokeStyle="rgba(55,138,221,0.5)";ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(FX,FY);ctx.lineTo(ppx,ppy);ctx.stroke();ctx.restore();ctx.save();ctx.beginPath();ctx.arc(ppx,ppy,6,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.restore();s.animT+=0.018*(pv/ra)*(pv/ra)*0.4;if(s.animT>Math.PI*2)s.animT-=Math.PI*2;}
      let lbl=ev<0.01?"Cerc (e=0)":ev<0.99?"Elipsă (e<1)":Math.abs(ev-1)<0.02?"Parabolă (e=1)":"Hiperbolă (e>1)";
      ctx.save();ctx.font="500 12px sans-serif";ctx.fillStyle=col;const mw=ctx.measureText(lbl).width;ctx.fillText(lbl,W-10-mw,20);ctx.restore();
      ctx.save();ctx.font="12px sans-serif";ctx.fillStyle="rgba(60,60,55,0.4)";ctx.fillText("r(θ) = p / (1 + e·cosθ)",10,H-10);ctx.restore();
      rafRef.current=requestAnimationFrame(draw);fu(n=>n+1);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} width={480} height={300} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
        {PLABELS.map((l,i)=>(
          <button key={i} onClick={()=>{setPreset(i);setE(PRESETS_E[i].e);setP(PRESETS_E[i].p);sRef.current.e=PRESETS_E[i].e;sRef.current.p=PRESETS_E[i].p;sRef.current.animT=0;}} style={{fontSize:12,padding:"5px 11px",borderRadius:6,border:`${preset===i?"1.5px":"0.5px"} solid ${preset===i?ocol(PRESETS_E[i].e):"var(--color-border-secondary)"}`,background:"transparent",color:"var(--color-text-primary)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:11,fontWeight:500,color:ocol(PRESETS_E[i].e)}}>{l}</span>
            <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{PSUBS[i]}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>e:</span>
        <input type="range" min="0" max="2.5" step="0.05" value={e} onChange={ev=>{setE(+ev.target.value);sRef.current.e=+ev.target.value;sRef.current.animT=0;}} style={{flex:1,minWidth:80}}/>
        <ValBox label="e =" value={e.toFixed(2)}/>
        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>p:</span>
        <input type="range" min="0.3" max="3" step="0.1" value={p} onChange={ev=>{setP(+ev.target.value);sRef.current.p=+ev.target.value;}} style={{flex:1,minWidth:80}}/>
        <ValBox label="p =" value={p.toFixed(1)}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  E5 — Transfer Hohmann
// ─────────────────────────────────────────────────────
function E5() {
  const cvRef=useRef(null);
  const [ratio,setRatio]=useState(3);
  const [paused,setPaused]=useState(false);
  const sRef=useRef({phase:0,angle:Math.PI,trail:[],ratio:3,paused:false,totalT:0});
  const rafRef=useRef(null);const[,fu]=useState(0);
  const vals=useRef({ratio:"3.0",dv1:"—",dv2:"—",time:"—"});

  useEffect(()=>{sRef.current.ratio=ratio;restart();},[ratio]);
  useEffect(()=>{sRef.current.paused=paused;},[paused]);
  function restart(){sRef.current.phase=0;sRef.current.angle=Math.PI;sRef.current.trail=[];sRef.current.totalT=0;}

  function arrow(ctx,x1,y1,x2,y2,col,lbl,lside,lw=2){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<3)return;ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const ux=dx/len,uy=dy/len,hw=7,hh=3.5;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-hw*ux+hh*uy,y2-hw*uy-hh*ux);ctx.lineTo(x2-hw*ux-hh*uy,y2-hw*uy+hh*ux);ctx.closePath();ctx.fill();if(lbl){ctx.font="500 11px sans-serif";ctx.fillStyle=col;const nx=-uy,ny=ux,off=lside===-1?-13:13;ctx.fillText(lbl,(x1+x2)/2+nx*off-4,(y1+y2)/2+ny*off+4);}ctx.restore();}

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const W=cv.width,H=cv.height;const CX=W*0.42,CY=H*0.5;
    const R1_PX=55;const DT=0.012;
    const ctx=cv.getContext("2d");const s=sRef.current;
    function draw(){
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#f8f7f3";ctx.fillRect(0,0,W,H);
      const R2=s.ratio,R1=1;const at=(R1+R2)/2;
      const vc1=Math.sqrt(1/R1),vc2=Math.sqrt(1/R2);
      const vt1=Math.sqrt(2*R2/(R1*(R1+R2))),vt2=Math.sqrt(2*R1/(R2*(R1+R2)));
      const dv1=vt1-vc1,dv2=vc2-vt2;
      const T1=2*Math.PI,Tt=Math.PI*Math.sqrt(at*at*at);
      const r1px=R1*R1_PX,r2px=R2*R1_PX,apx=at*R1_PX;
      const c_px=(at-R1)*R1_PX,bpx=Math.sqrt(Math.max(0,apx*apx-c_px*c_px));
      // Sun
      ctx.save();ctx.beginPath();ctx.arc(CX,CY,8,0,Math.PI*2);const g=ctx.createRadialGradient(CX,CY,1,CX,CY,8);g.addColorStop(0,"#FFE066");g.addColorStop(1,C.amber);ctx.fillStyle=g;ctx.fill();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(CX,CY,r1px,0,Math.PI*2);ctx.strokeStyle="rgba(55,138,221,0.35)";ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(CX,CY,r2px,0,Math.PI*2);ctx.strokeStyle="rgba(127,119,221,0.35)";ctx.lineWidth=1.5;ctx.setLineDash([4,5]);ctx.stroke();ctx.restore();
      ctx.save();ctx.translate(CX-c_px,CY);ctx.beginPath();ctx.ellipse(0,0,apx,bpx,0,0,Math.PI*2);ctx.strokeStyle="rgba(29,158,117,0.3)";ctx.lineWidth=1.2;ctx.setLineDash([3,5]);ctx.stroke();ctx.restore();
      if(s.phase===1&&s.trail.length>1){ctx.save();ctx.strokeStyle="rgba(29,158,117,0.6)";ctx.lineWidth=2;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(s.trail[0].x,s.trail[0].y);for(const pt of s.trail)ctx.lineTo(pt.x,pt.y);ctx.stroke();ctx.restore();}
      let sx,sy;
      if(s.phase===0){sx=CX+r1px*Math.cos(s.angle);sy=CY-r1px*Math.sin(s.angle);if(!s.paused){s.angle+=vc1/R1*DT;s.totalT+=DT;if(s.angle>=2*Math.PI)s.angle-=2*Math.PI;if(s.angle>0.02&&s.angle<0.06){s.angle=0;s.phase=1;s.trail=[];}}}
      else if(s.phase===1){const e_t=(R2-R1)/(R2+R1);const p_t=R1*(1+e_t);const r_p=p_t/(1+e_t*Math.cos(s.angle));sx=CX+r_p*R1_PX*Math.cos(s.angle);sy=CY-r_p*R1_PX*Math.sin(s.angle);if(!s.paused){s.trail.push({x:sx,y:sy});const L=R1*vt1;s.angle+=L/(r_p*r_p)*DT;s.totalT+=DT;if(s.angle>=Math.PI){s.angle=Math.PI;s.phase=2;}}}
      else{sx=CX+r2px*Math.cos(s.angle);sy=CY-r2px*Math.sin(s.angle);if(!s.paused){s.angle+=vc2/R2*DT*0.5;s.totalT+=DT;if(s.angle<Math.PI)s.angle=Math.PI;}}
      if(s.phase===1&&s.angle<0.15){const dvpx=dv1*300;arrow(ctx,sx,sy,sx,sy-dvpx,C.amber,"Δv₁",1,2.5);}
      if(s.phase===2&&Math.abs(s.angle-Math.PI)<0.12){const dvpx=dv2*300;arrow(ctx,sx,sy,sx,sy+dvpx,C.purple,"Δv₂",-1,2.5);}
      const satCol=s.phase===0?C.blue:s.phase===1?C.green:C.purple;
      ctx.save();ctx.beginPath();ctx.arc(sx,sy,7,0,Math.PI*2);ctx.fillStyle=satCol;ctx.fill();ctx.restore();
      const pLabels=["Orbita 1 — circulară","Transfer Hohmann","Orbita 2 — circulară"];
      ctx.save();ctx.font="500 12px sans-serif";ctx.fillStyle=satCol;ctx.fillText(pLabels[s.phase],10,20);ctx.restore();
      ctx.save();ctx.font="11px sans-serif";ctx.fillStyle="rgba(60,60,55,0.38)";ctx.fillText("t_transfer = π·√(a³/GM)",10,H-10);ctx.restore();
      vals.current={ratio:R2.toFixed(1),dv1:(dv1/vc1*100).toFixed(1)+"%",dv2:(dv2/vc2*100).toFixed(1)+"%",time:(Tt/T1).toFixed(2)};
      if(!s.paused)rafRef.current=requestAnimationFrame(draw);fu(n=>n+1);
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} width={480} height={300} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <ValBox label="R₂/R₁ =" value={vals.current.ratio}/>
        <ValBox label="Δv₁/v_c1 =" value={vals.current.dv1} color={C.amber}/>
        <ValBox label="Δv₂/v_c2 =" value={vals.current.dv2} color={C.purple}/>
        <ValBox label="t/T₁ =" value={vals.current.time}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>R₂/R₁:</span>
        <input type="range" min="1.5" max="5" step="0.5" value={ratio} onChange={e=>setRatio(+e.target.value)} style={{flex:1,minWidth:80}}/>
        <Btn onClick={()=>{restart();fu(n=>n+1);}}>↺ Restart</Btn>
        <Btn onClick={()=>setPaused(p=>{sRef.current.paused=!p;if(p)rafRef.current=requestAnimationFrame(function loop(){if(!sRef.current.paused)rafRef.current=requestAnimationFrame(loop);});return!p;})}>{paused?"▶ Redă":"⏸ Pauză"}</Btn>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <Badge color={C.blue}>Orbita 1</Badge><Badge color={C.green}>Transfer</Badge>
        <Badge color={C.purple}>Orbita 2</Badge><Badge color={C.amber}>Δv₁</Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  E6 — Două corpuri
// ─────────────────────────────────────────────────────
function E6() {
  const cvRef=useRef(null);
  const [ratioIdx,setRatioIdx]=useState(0);
  const sRef=useRef({angle:0,trail1:[],trail2:[],trailRel:[],ratio:1,paused:false});
  const [paused,setPaused]=useState(false);
  const rafRef=useRef(null);const[,fu]=useState(0);
  const PRESETS_R=[1,1/3,0.1,0.02];
  const PRESET_LABELS=["m₁ = m₂","m₁ = m₂/3","m₁ = m₂/10","m₁ ≪ m₂"];

  useEffect(()=>{sRef.current.ratio=PRESETS_R[ratioIdx];sRef.current.angle=0;sRef.current.trail1=[];sRef.current.trail2=[];sRef.current.trailRel=[];},[ratioIdx]);
  useEffect(()=>{sRef.current.paused=paused;},[paused]);

  function pushT(arr,pt){arr.push({...pt});if(arr.length>180)arr.shift();}
  function drawT(ctx,trail,colRgb){if(trail.length<2)return;ctx.save();for(let i=1;i<trail.length;i++){const a=i/trail.length;ctx.strokeStyle=`rgba(${colRgb},${a*0.6})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y);ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();}ctx.restore();}

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const W=cv.width,H=cv.height;const CX=W/2,CY=H/2;
    const A_PX=105;const DT=0.022;
    const ctx=cv.getContext("2d");const s=sRef.current;
    function draw(){
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#f8f7f3";ctx.fillRect(0,0,W,H);
      const m2=1,m1=s.ratio*m2,M=m1+m2,mu=m1*m2/M;
      const f1=m2/M,f2=m1/M;
      const r1orb=f1*A_PX,r2orb=f2*A_PX;
      ctx.save();ctx.beginPath();ctx.arc(CX,CY,A_PX,0,Math.PI*2);ctx.strokeStyle="rgba(29,158,117,0.2)";ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.stroke();ctx.restore();
      ctx.save();ctx.setLineDash([3,5]);ctx.lineWidth=0.8;
      ctx.beginPath();ctx.arc(CX,CY,r1orb,0,Math.PI*2);ctx.strokeStyle="rgba(55,138,221,0.25)";ctx.stroke();
      ctx.beginPath();ctx.arc(CX,CY,r2orb,0,Math.PI*2);ctx.strokeStyle="rgba(226,75,74,0.25)";ctx.stroke();
      ctx.restore();
      const x1=CX+r1orb*Math.cos(s.angle),y1=CY-r1orb*Math.sin(s.angle);
      const x2=CX-r2orb*Math.cos(s.angle),y2=CY+r2orb*Math.sin(s.angle);
      const xrel=CX+A_PX*Math.cos(s.angle),yrel=CY-A_PX*Math.sin(s.angle);
      pushT(s.trail1,{x:x1,y:y1});pushT(s.trail2,{x:x2,y:y2});pushT(s.trailRel,{x:xrel,y:yrel});
      drawT(ctx,s.trail1,"55,138,221");drawT(ctx,s.trail2,"226,75,74");drawT(ctx,s.trailRel,"29,158,117");
      ctx.save();ctx.strokeStyle="rgba(0,0,0,0.08)";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
      ctx.save();ctx.setLineDash([3,4]);ctx.lineWidth=0.8;ctx.strokeStyle="rgba(239,159,39,0.4)";ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(x1,y1);ctx.stroke();ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(xrel,yrel,5,0,Math.PI*2);ctx.fillStyle="rgba(29,158,117,0.5)";ctx.fill();ctx.restore();
      const r1v=Math.max(6,14*Math.cbrt(m1/M)),r2v=Math.max(6,14*Math.cbrt(m2/M));
      ctx.save();ctx.beginPath();ctx.arc(x1,y1,r1v,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();ctx.font="500 11px sans-serif";ctx.fillStyle=C.blue;ctx.fillText("m₁",x1+r1v+4,y1-r1v);ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(x2,y2,r2v,0,Math.PI*2);ctx.fillStyle=C.red;ctx.fill();ctx.font="500 11px sans-serif";ctx.fillStyle=C.red;ctx.fillText("m₂",x2+r2v+4,y2-r2v);ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(CX,CY,5,0,Math.PI*2);ctx.fillStyle=C.amber;ctx.fill();ctx.font="500 11px sans-serif";ctx.fillStyle=C.amber;ctx.fillText("CM",CX+7,CY-6);ctx.restore();
      // Info
      ctx.save();ctx.font="11px sans-serif";ctx.fillStyle="rgba(60,60,55,0.5)";
      ctx.fillText(`r₁/a = ${f1.toFixed(3)}  (m₂/M)`,W-155,22);
      ctx.fillText(`r₂/a = ${f2.toFixed(3)}  (m₁/M)`,W-155,36);
      ctx.fillText(`μ/M  = ${(mu/M).toFixed(3)}`,W-155,50);
      ctx.restore();
      ctx.save();ctx.font="11px sans-serif";ctx.fillStyle="rgba(60,60,55,0.38)";ctx.fillText("μ = m₁m₂/(m₁+m₂)   T² = 4π²a³/G(m₁+m₂)",10,H-10);ctx.restore();
      if(!s.paused){s.angle+=DT;if(s.angle>Math.PI*2)s.angle-=Math.PI*2;rafRef.current=requestAnimationFrame(draw);fu(n=>n+1);}
    }
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} width={480} height={280} style={{width:"100%",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)"}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        <ValBox label="m₁ =" value={(PRESETS_R[ratioIdx]).toFixed(3)} color={C.blue}/>
        <ValBox label="m₂ =" value="1.000" color={C.red}/>
        <ValBox label="μ =" value={(PRESETS_R[ratioIdx]/(1+PRESETS_R[ratioIdx])).toFixed(3)} color={C.green}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
        {PRESET_LABELS.map((l,i)=>(
          <Btn key={i} active={ratioIdx===i} onClick={()=>setRatioIdx(i)}>{l}</Btn>
        ))}
        <Btn onClick={()=>setPaused(p=>{sRef.current.paused=!p;if(p)rafRef.current=requestAnimationFrame(function loop(){if(!sRef.current.paused)rafRef.current=requestAnimationFrame(loop);});return!p;})}>{paused?"▶ Redă":"⏸ Pauză"}</Btn>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
        <Badge color={C.blue}>m₁</Badge><Badge color={C.red}>m₂</Badge>
        <Badge color={C.amber}>CM</Badge><Badge color={C.green}>orbita relativă μ</Badge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────
const PANELS = { e0: E0, e1: E1, e2: E2, e3: E3, e4: E4, e5: E5, e6: E6 };

export default function ForCentraleSim() {
  const [active, setActive] = useState("e0");
  const Panel = PANELS[active];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 520, margin: "0 auto", padding: "12px 8px" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            fontSize: 11, padding: "5px 9px", borderRadius: 6,
            border: active === t.id ? `1.5px solid ${C.blue}` : "0.5px solid var(--color-border-secondary)",
            background: active === t.id ? "var(--color-background-secondary)" : "transparent",
            color: active === t.id ? C.blue : "var(--color-text-secondary)",
            fontWeight: active === t.id ? 500 : 400,
            cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>
      {/* Active panel */}
      <Panel />
    </div>
  );
}
