import { useState } from 'react'
import { LESSONS } from './content.js'
import AtomicSim from './simulations/AtomicSim'
import QuantumSim from './simulations/QuantumSim'
import MRU from './simulations/MRU'
import ThermalAgitation from './simulations/ThermalAgitation'

const SIM_MAP = {
  atomic:  AtomicSim,
  quantum: QuantumSim,
  mru:     MRU,
  thermal: ThermalAgitation,
}

// ─── Theme ────────────────────────────────────────────────────
const T = {
  bg:      '#0F1117',
  surface: '#1A1D27',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EAF0',
  dim:     '#6B7280',
  font:    "'Inter', 'Segoe UI', system-ui, sans-serif",
}

// ─── Tiny helpers ─────────────────────────────────────────────
const css = (obj) => obj  // just for readability

// ──────────────────────────────────────────────────────────────
// HOME — Card list
// ──────────────────────────────────────────────────────────────
function Home({ onSelect }) {
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{
        padding: '48px 20px 24px',
        background: `linear-gradient(180deg, #1A1D27 0%, ${T.bg} 100%)`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🧪</span>
          <span style={{
            fontSize: 22, fontWeight: 800,
            background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: -0.5,
          }}>
            Fizică
          </span>
        </div>
        <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
          Simulări interactive · Teorie · Probleme rezolvate
        </p>
      </div>

      {/* Cards */}
      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 11, color: T.dim, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 4px 4px' }}>
          Lecții disponibile
        </p>
        {LESSONS.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect} />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '0 20px 32px',
        color: T.dim, fontSize: 12, lineHeight: 1.7,
      }}>
        <div style={{ marginBottom: 4 }}>Apasă pe o lecție pentru a o deschide</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>
          Funcționează offline după prima încărcare
        </div>
      </div>
    </div>
  )
}

function LessonCard({ lesson, onSelect }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      onClick={() => onSelect(lesson)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: pressed ? lesson.colorDim : T.surface,
        border: `1px solid ${pressed ? lesson.color + '44' : T.border}`,
        borderRadius: 16,
        padding: '16px 18px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform .12s, background .12s, border-color .12s',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: lesson.colorDim,
        border: `1.5px solid ${lesson.color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>
        {lesson.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: T.text,
          marginBottom: 3, letterSpacing: -0.2,
        }}>
          {lesson.title}
        </div>
        <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.4 }}>
          {lesson.subtitle}
        </div>
        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
          {['📖 Teorie', '🎮 Simulare', '✏️ Probleme'].map(tab => (
            <span key={tab} style={{
              fontSize: 10, color: lesson.color,
              background: lesson.colorDim,
              border: `1px solid ${lesson.color}33`,
              borderRadius: 20, padding: '2px 7px',
              fontWeight: 500,
            }}>
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Chevron */}
      <span style={{ color: T.dim, fontSize: 18, flexShrink: 0, marginLeft: 4 }}>›</span>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// LESSON — 3 tabs
// ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'theory',    label: 'Teorie',    icon: '📖' },
  { id: 'sim',       label: 'Simulare',  icon: '🎮' },
  { id: 'problems',  label: 'Probleme',  icon: '✏️' },
]

function Lesson({ lesson, onBack }) {
  const [tab, setTab] = useState('theory')
  const Sim = SIM_MAP[lesson.id]

  return (
    <div style={{
      minHeight: '100dvh', background: T.bg,
      color: T.text, fontFamily: T.font,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: '0 4px',
      }}>
        {/* Back row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 12px 0' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: lesson.color, fontSize: 14, fontWeight: 600,
              padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: T.font,
            }}
          >
            ‹ Înapoi
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
              {lesson.icon} {lesson.title}
            </span>
          </div>
          <div style={{ width: 60 }} /> {/* spacer */}
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, padding: '10px 8px 0',
        }}>
          {TABS.map(t => (
            <TabBtn
              key={t.id}
              tab={t}
              active={tab === t.id}
              color={lesson.color}
              onClick={() => setTab(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {tab === 'theory'   && <TheoryTab lesson={lesson} />}
        {tab === 'sim'      && (
          <div style={{ minHeight: '70dvh' }}>
            <Sim />
          </div>
        )}
        {tab === 'problems' && <ProblemsTab lesson={lesson} />}
      </div>
    </div>
  )
}

function TabBtn({ tab, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 0 10px',
        background: 'none', border: 'none',
        borderBottom: active ? `2.5px solid ${color}` : '2.5px solid transparent',
        color: active ? color : T.dim,
        fontSize: 12, fontWeight: active ? 700 : 500,
        cursor: 'pointer', fontFamily: T.font,
        transition: 'color .15s, border-color .15s',
        whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {tab.icon} {tab.label}
    </button>
  )
}

// ──────────────────────────────────────────────────────────────
// THEORY TAB
// ──────────────────────────────────────────────────────────────
function TheoryTab({ lesson }) {
  return (
    <div style={{ padding: '20px 18px 40px' }}>
      {lesson.theory.map((block, i) => <TheoryBlock key={i} block={block} color={lesson.color} />)}
    </div>
  )
}

function TheoryBlock({ block, color }) {
  if (block.type === 'heading') return (
    <h2 style={{
      fontSize: 17, fontWeight: 800, color,
      margin: '24px 0 10px', letterSpacing: -0.3,
      borderLeft: `3px solid ${color}`,
      paddingLeft: 10,
    }}>
      {block.text}
    </h2>
  )

  if (block.type === 'text') return (
    <p style={{
      fontSize: 14.5, color: '#C8CAD0', lineHeight: 1.75,
      margin: '0 0 14px',
    }}>
      {block.text}
    </p>
  )

  if (block.type === 'formula') return (
    <div style={{
      background: T.surface,
      border: `1px solid ${color}33`,
      borderRadius: 12, padding: '14px 18px',
      margin: '10px 0',
    }}>
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 16, fontWeight: 700,
        color, letterSpacing: 0.5, marginBottom: 5,
      }}>
        {block.text}
      </div>
      {block.label && (
        <div style={{ fontSize: 12, color: T.dim }}>{block.label}</div>
      )}
    </div>
  )

  if (block.type === 'list') return (
    <ul style={{ margin: '0 0 14px', paddingLeft: 0, listStyle: 'none' }}>
      {block.items.map((item, i) => (
        <li key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          fontSize: 14, color: '#C8CAD0', lineHeight: 1.65,
          marginBottom: 8,
        }}>
          <span style={{ color, flexShrink: 0, marginTop: 2 }}>▸</span>
          {item}
        </li>
      ))}
    </ul>
  )

  return null
}

// ──────────────────────────────────────────────────────────────
// PROBLEMS TAB
// ──────────────────────────────────────────────────────────────
function ProblemsTab({ lesson }) {
  return (
    <div style={{ padding: '20px 18px 40px' }}>
      <p style={{ fontSize: 12, color: T.dim, marginBottom: 20 }}>
        Încearcă să rezolvi singur, apoi apasă pentru a vedea răspunsul.
      </p>
      {lesson.problems.map((prob, i) => (
        <ProblemCard key={prob.id} prob={prob} index={i + 1} color={lesson.color} />
      ))}
    </div>
  )
}

function ProblemCard({ prob, index, color }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14, marginBottom: 14,
      overflow: 'hidden',
      transition: 'border-color .2s',
      borderColor: open ? color + '44' : T.border,
    }}>
      {/* Question */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{
          fontSize: 11, color, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 1,
          marginBottom: 8,
        }}>
          Problema {index}
        </div>
        <p style={{ fontSize: 14, color: T.text, lineHeight: 1.65, margin: 0 }}>
          {prob.text}
        </p>
      </div>

      {/* Show answer button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 16px',
          background: open ? color + '15' : 'rgba(255,255,255,0.03)',
          border: 'none',
          borderTop: `1px solid ${T.border}`,
          color: open ? color : T.dim,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: T.font,
          transition: 'background .2s, color .2s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span>{open ? 'Ascunde răspunsul' : 'Arată răspunsul'}</span>
        <span style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform .2s', display: 'inline-block',
        }}>⌄</span>
      </button>

      {/* Answer */}
      {open && (
        <div style={{
          padding: '14px 16px 16px',
          borderTop: `1px solid ${color}22`,
          background: color + '08',
        }}>
          <div style={{
            fontSize: 11, color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
          }}>
            Rezolvare
          </div>
          <pre style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 13, color: '#C8CAD0',
            lineHeight: 1.75, margin: 0,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {prob.answer}
          </pre>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// ROOT
// ──────────────────────────────────────────────────────────────
export default function App() {
  const [current, setCurrent] = useState(null)

  if (current) {
    return <Lesson lesson={current} onBack={() => setCurrent(null)} />
  }
  return <Home onSelect={setCurrent} />
}
