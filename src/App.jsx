// ═══════════════════════════════════════════════════════════════
//  App.jsx — shell principal
//  Hash routing · Lazy loading · Categorii · Search
//  Aesthetic: Scientific Manuscript — Spectral + IBM Plex
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { REGISTRY, CATEGORIES } from './registry.js'

// CSS variables definite în index.html
const T = {
  bg:       'var(--bg)',
  surface:  'var(--surface)',
  surfaceUp:'var(--surface-up)',
  border:   'var(--border)',
  borderMid:'var(--border-mid)',
  text:     'var(--text)',
  body:     'var(--text-body)',
  dim:      'var(--dim)',
  dimmer:   'var(--dimmer)',
  ui:       'var(--font-ui)',
  serif:    'var(--font-body)',
  mono:     'var(--font-mono)',
}

const toRoman = n =>
  ['I','II','III','IV','V','VI','VII','VIII','IX','X'][n - 1] ?? n

// ─── Hash Router ──────────────────────────────────────────────
function useRoute() {
  const parse = (hash) => {
    const m = (hash || '').match(/^#\/sim\/([^/]+)$/)
    return m ? { view: 'sim', id: m[1] } : { view: 'home' }
  }
  const [route, setRoute] = useState(() => parse(window.location.hash))
  useEffect(() => {
    const h = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  const go = useCallback((simId) => {
    window.location.hash = simId ? `/sim/${simId}` : '/'
  }, [])
  return { route, go }
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function App() {
  const { route, go } = useRoute()
  if (route.view === 'sim') {
    const entry = REGISTRY.find(r => r.id === route.id)
    if (!entry) { go(null); return null }
    return <LessonView entry={entry} onBack={() => go(null)} />
  }
  return <HomeView onSelect={(id) => go(id)} />
}

// ═══════════════════════════════════════════════════════════════
//  HOME VIEW
// ═══════════════════════════════════════════════════════════════
function HomeView({ onSelect }) {
  const [query, setQuery] = useState('')

  const activeCats = CATEGORIES.filter(cat =>
    REGISTRY.some(r => r.category === cat.id)
  )

  const filtered = query.trim()
    ? REGISTRY.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        (CATEGORIES.find(c => c.id === r.category)?.label || '')
          .toLowerCase().includes(query.toLowerCase())
      )
    : null

  return (
    <div style={{ minHeight: '100dvh', color: T.text, fontFamily: T.ui }}>

      {/* ── Header ── */}
      <div style={{
        padding: '52px 22px 22px',
        background: 'linear-gradient(180deg, var(--surface) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <AtomLogo />
          <div>
            <div style={{
              fontFamily: T.serif, fontSize: 26, fontWeight: 700,
              letterSpacing: '-0.5px', color: T.text, lineHeight: 1,
            }}>
              Fizică
            </div>
            <div style={{
              fontFamily: T.ui, fontSize: 10, fontWeight: 500,
              letterSpacing: '2px', color: 'var(--dim)',
              textTransform: 'uppercase', marginTop: 3,
            }}>
              Simulări Interactive
            </div>
          </div>
        </div>

        {/* Thin rule */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, var(--border-mid) 0%, transparent 80%)',
          margin: '14px 0',
        }} />

        <p style={{
          color: 'var(--dim)', fontSize: 13,
          fontFamily: T.serif, fontStyle: 'italic',
          lineHeight: 1.6, marginBottom: 16,
        }}>
          Teorie · Simulări interactive · Probleme rezolvate
        </p>

        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* ── Simulări ── */}
      <div style={{ padding: '4px 0 56px' }}>
        {filtered
          ? <>
              <SectionDivider label={`${filtered.length} rezultate`} />
              <SimList sims={filtered} onSelect={onSelect}
                emptyMsg="Nicio simulare găsită." />
            </>
          : activeCats.map(cat => {
              const sims = REGISTRY.filter(r => r.category === cat.id)
              return (
                <CategorySection key={cat.id} cat={cat}
                  sims={sims} onSelect={onSelect} />
              )
            })
        }
      </div>

      <HomeFooter />
    </div>
  )
}

function SearchBar({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: T.surfaceUp,
      border: `1px solid ${value ? 'rgba(129,140,248,0.35)' : 'var(--border)'}`,
      borderRadius: 10, padding: '10px 14px',
      transition: 'border-color .2s',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ opacity: 0.35, flexShrink: 0 }}>
        <circle cx="5.5" cy="5.5" r="4.5" stroke="var(--text)" strokeWidth="1.5"/>
        <line x1="9" y1="9" x2="13" y2="13" stroke="var(--text)"
          strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Caută simulare, capitol..."
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: T.text, fontSize: 14, fontFamily: T.ui,
        }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--dim)', fontSize: 18, lineHeight: 1, padding: 0,
        }}>×</button>
      )}
    </div>
  )
}

function SectionDivider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '22px 20px 12px',
    }}>
      <span style={{
        fontSize: 10, color: 'var(--dim)', fontFamily: T.ui,
        textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function CategorySection({ cat, sims, onSelect }) {
  return (
    <div style={{ marginTop: 8 }}>
      <SectionDivider label={cat.label} />
      <SimList sims={sims} onSelect={onSelect} />
    </div>
  )
}

function SimList({ sims, onSelect, emptyMsg }) {
  if (sims.length === 0) return (
    <p style={{ color: 'var(--dim)', fontSize: 14, padding: '16px 20px', fontFamily: T.ui }}>
      {emptyMsg}
    </p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 14px' }}>
      {sims.map((s, i) => <SimCard key={s.id} sim={s} index={i} onSelect={onSelect} />)}
    </div>
  )
}

function SimCard({ sim, index, onSelect }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      onClick={() => onSelect(sim.id)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        animationDelay: `${index * 0.05}s`,
        background: pressed ? sim.colorDim : 'var(--surface)',
        borderLeft: `3px solid ${sim.color}`,
        borderTop: `1px solid ${pressed ? sim.color + '28' : 'var(--border)'}`,
        borderRight: `1px solid ${pressed ? sim.color + '18' : 'var(--border)'}`,
        borderBottom: `1px solid ${pressed ? sim.color + '18' : 'var(--border)'}`,
        borderRadius: '4px 12px 12px 4px',
        padding: '13px 14px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 13,
        transform: pressed ? 'scale(0.978)' : 'scale(1)',
        transition: 'transform .1s, background .1s, border-color .12s',
        WebkitTapHighlightColor: 'transparent', userSelect: 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 11, flexShrink: 0,
        background: sim.colorDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {sim.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.serif, fontSize: 15, fontWeight: 700,
          color: T.text, marginBottom: 2, letterSpacing: '-0.2px',
        }}>
          {sim.title}
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 12, color: 'var(--dim)', lineHeight: 1.4 }}>
          {sim.subtitle}
        </div>
        {/* Pills */}
        <div style={{ display: 'flex', gap: 4, marginTop: 7, flexWrap: 'wrap' }}>
          {sim.grade.map(g => (
            <span key={g} style={{
              fontSize: 10, color: sim.color, background: sim.colorDim,
              borderRadius: 4, padding: '1px 6px', fontWeight: 600,
              fontFamily: T.ui, letterSpacing: '0.3px',
            }}>
              cls. {g}
            </span>
          ))}
          {['Teorie', 'Simulare', 'Probleme'].map(tab => (
            <span key={tab} style={{
              fontSize: 10, color: 'var(--dim)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 4, padding: '1px 6px', fontFamily: T.ui,
            }}>
              {tab}
            </span>
          ))}
        </div>
      </div>

      <span style={{ color: 'var(--dimmer)', fontSize: 22, flexShrink: 0 }}>›</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  LESSON VIEW
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { id: 'theory',   label: 'Teorie',   icon: '§' },
  { id: 'sim',      label: 'Simulare', icon: '⟳' },
  { id: 'problems', label: 'Probleme', icon: '∴' },
]

function LessonView({ entry, onBack }) {
  const [tab, setTab]         = useState('theory')
  const [content, setContent] = useState(null)
  const [SimComp, setSimComp] = useState(null)
  const [loadErr, setLoadErr] = useState(false)

  useEffect(() => {
    let alive = true
    setContent(null); setSimComp(null); setLoadErr(false)
    Promise.all([
      entry.content().catch(() => null),
      entry.component().catch(() => null),
    ]).then(([cm, comp]) => {
      if (!alive) return
      if (!cm || !comp) { setLoadErr(true); return }
      setContent(cm.default ?? cm)
      setSimComp(() => comp.default)
    })
    return () => { alive = false }
  }, [entry.id])

  return (
    <div style={{
      minHeight: '100dvh', color: T.text, fontFamily: T.ui,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Sticky bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px 0' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: entry.color, fontSize: 13, fontWeight: 600,
              padding: '4px 0', display: 'flex', alignItems: 'center', gap: 3,
              fontFamily: T.ui, WebkitTapHighlightColor: 'transparent',
            }}
          >
            ‹ Înapoi
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{
              fontFamily: T.serif, fontSize: 14, fontWeight: 700, color: T.text,
            }}>
              {entry.icon} {entry.title}
            </span>
          </div>
          <span style={{
            fontFamily: T.ui, fontSize: 10, color: entry.color,
            background: entry.colorDim,
            padding: '2px 7px', borderRadius: 4, fontWeight: 600,
          }}>
            {entry.grade[entry.grade.length - 1]}
          </span>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', padding: '6px 8px 0' }}>
          {TABS.map(t => (
            <TabBtn key={t.id} tab={t} active={tab === t.id}
              color={entry.color} onClick={() => setTab(t.id)} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {loadErr && <LoadError />}

        {!loadErr && tab === 'theory' && (
          content
            ? <TheoryTab content={content} color={entry.color} title={entry.title} />
            : <Spinner />
        )}
        {!loadErr && tab === 'sim' && (
          SimComp
            ? <div style={{ minHeight: '70dvh' }}><SimComp /></div>
            : <Spinner label="Se încarcă simularea..." />
        )}
        {!loadErr && tab === 'problems' && (
          content
            ? <ProblemsTab content={content} color={entry.color} />
            : <Spinner />
        )}
      </div>
    </div>
  )
}

function TabBtn({ tab, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '7px 0 9px',
        background: 'none', border: 'none',
        borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
        color: active ? color : 'var(--dim)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: 'pointer', fontFamily: T.ui, letterSpacing: '0.2px',
        transition: 'color .15s, border-color .15s',
        whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ marginRight: 5, fontFamily: T.mono, opacity: 0.75 }}>{tab.icon}</span>
      {tab.label}
    </button>
  )
}

function Spinner({ label = 'Se încarcă...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '40dvh', gap: 14,
    }}>
      <div style={{
        width: 28, height: 28,
        border: '2px solid var(--dimmer)',
        borderTopColor: '#818cf8', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: 'var(--dim)', fontSize: 13, fontFamily: T.ui }}>{label}</span>
    </div>
  )
}

function LoadError() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
      <p style={{ fontSize: 14, fontFamily: T.ui }}>Nu s-a putut încărca simularea.</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  THEORY TAB
// ═══════════════════════════════════════════════════════════════
function TheoryTab({ content, color, title }) {
  return (
    <div style={{ padding: '24px 20px 56px', maxWidth: 680, margin: '0 auto' }}>
      {/* Chapter heading */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: T.ui, fontSize: 10, color: 'var(--dim)',
          textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600,
          marginBottom: 8,
        }}>
          Capitol
        </div>
        <h1 style={{
          fontFamily: T.serif, fontSize: 24, fontWeight: 700,
          color: T.text, lineHeight: 1.2, letterSpacing: '-0.5px', margin: 0,
        }}>
          {title}
        </h1>
        <div style={{
          marginTop: 12, height: 2,
          background: `linear-gradient(90deg, ${color} 0%, transparent 70%)`,
          borderRadius: 2,
        }} />
      </div>

      {(content.theory || []).map((block, i) =>
        <TheoryBlock key={i} block={block} color={color} />
      )}
    </div>
  )
}

function TheoryBlock({ block, color }) {
  if (block.type === 'heading') return (
    <h2 style={{
      fontFamily: T.serif, fontSize: 18, fontWeight: 700,
      color: T.text, margin: '32px 0 12px',
      letterSpacing: '-0.3px', lineHeight: 1.3,
      paddingLeft: 12, borderLeft: `2px solid ${color}`,
    }}>
      {block.text}
    </h2>
  )

  if (block.type === 'text') return (
    <p style={{
      fontFamily: T.serif, fontSize: 16.5,
      color: 'var(--text-body)', lineHeight: 1.85,
      margin: '0 0 16px',
    }}>
      {block.text}
    </p>
  )

  if (block.type === 'formula') return (
    <div style={{
      margin: '14px 0 18px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${color}`,
      borderRadius: '2px 10px 10px 2px',
      padding: '14px 18px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: -1, right: 12,
        fontFamily: T.ui, fontSize: 9,
        color: color, opacity: 0.65,
        textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600,
        background: 'var(--surface)', padding: '0 4px',
        transform: 'translateY(-50%)',
      }}>
        Formulă
      </div>
      <div style={{
        fontFamily: T.mono, fontSize: 15.5, fontWeight: 600,
        color, letterSpacing: '0.3px',
        marginBottom: block.label ? 8 : 0,
        lineHeight: 1.5,
      }}>
        {block.text}
      </div>
      {block.label && (
        <div style={{
          fontFamily: T.serif, fontStyle: 'italic',
          fontSize: 13, color: 'var(--dim)', lineHeight: 1.5,
        }}>
          {block.label}
        </div>
      )}
    </div>
  )

  if (block.type === 'list') return (
    <ul style={{ margin: '4px 0 18px', paddingLeft: 0, listStyle: 'none' }}>
      {(block.items || []).map((item, i) => (
        <li key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          fontFamily: T.serif, fontSize: 16,
          color: 'var(--text-body)', lineHeight: 1.75, marginBottom: 8,
        }}>
          <span style={{
            color, flexShrink: 0, marginTop: 5,
            fontFamily: T.mono, fontSize: 10,
          }}>▸</span>
          {item}
        </li>
      ))}
    </ul>
  )

  return null
}

// ═══════════════════════════════════════════════════════════════
//  PROBLEMS TAB
// ═══════════════════════════════════════════════════════════════
function ProblemsTab({ content, color }) {
  return (
    <div style={{ padding: '24px 20px 56px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{
        fontFamily: T.serif, fontStyle: 'italic',
        fontSize: 14.5, color: 'var(--dim)',
        lineHeight: 1.65, marginBottom: 24,
        paddingLeft: 12, borderLeft: '2px solid var(--border)',
      }}>
        Încearcă să rezolvi fiecare problemă înainte de a deschide rezolvarea.
      </div>

      {(content.problems || []).map((prob, i) => (
        <ProblemCard key={prob.id} prob={prob} index={i + 1} color={color} />
      ))}
    </div>
  )
}

function ProblemCard({ prob, index, color }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${open ? color + '32' : 'var(--border)'}`,
      borderLeft: `3px solid ${open ? color : 'var(--border-mid)'}`,
      borderRadius: '2px 12px 12px 2px',
      marginBottom: 16, overflow: 'hidden',
      transition: 'border-color .2s',
    }}>
      {/* Enunț */}
      <div style={{ padding: '16px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <span style={{
            fontFamily: T.mono, fontSize: 12, fontWeight: 600,
            color, letterSpacing: '1px',
          }}>
            {toRoman(index)}.
          </span>
          <span style={{
            fontFamily: T.ui, fontSize: 10, color: 'var(--dim)',
            textTransform: 'uppercase', letterSpacing: '1.2px',
          }}>
            Problemă
          </span>
        </div>
        <p style={{
          fontFamily: T.serif, fontSize: 16,
          color: T.text, lineHeight: 1.75, margin: 0,
        }}>
          {prob.text}
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 18px',
          background: open ? color + '10' : 'rgba(255,255,255,0.02)',
          border: 'none', borderTop: '1px solid var(--border)',
          color: open ? color : 'var(--dim)',
          fontSize: 11, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: T.ui, letterSpacing: '0.8px',
          transition: 'background .2s, color .2s',
          WebkitTapHighlightColor: 'transparent',
          textTransform: 'uppercase',
        }}
      >
        <span>{open ? '— Ascunde rezolvarea' : '+ Arată rezolvarea'}</span>
        <span style={{
          fontFamily: T.mono,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s', display: 'inline-block', fontSize: 14,
        }}>⌄</span>
      </button>

      {/* Rezolvare */}
      {open && (
        <div style={{
          padding: '16px 18px 18px',
          borderTop: `1px solid ${color}18`,
          background: color + '05',
        }}>
          <div style={{
            fontFamily: T.ui, fontSize: 10, color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10,
          }}>
            Rezolvare
          </div>
          <pre style={{
            fontFamily: T.mono, fontSize: 13,
            color: 'var(--text-body)', lineHeight: 1.85, margin: 0,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {prob.answer}
          </pre>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  DECORATIVE
// ═══════════════════════════════════════════════════════════════
function AtomLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="3" fill="#818cf8" />
      <ellipse cx="18" cy="18" rx="16" ry="6"
        stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.8"/>
      <ellipse cx="18" cy="18" rx="16" ry="6"
        stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.7"
        transform="rotate(60 18 18)"/>
      <ellipse cx="18" cy="18" rx="16" ry="6"
        stroke="#f472b6" strokeWidth="1" fill="none" opacity="0.6"
        transform="rotate(120 18 18)"/>
      <circle cx="34" cy="18" r="2" fill="#818cf8" opacity="0.9"/>
    </svg>
  )
}

function HomeFooter() {
  return (
    <div style={{ textAlign: 'center', padding: '0 20px 44px', color: 'var(--dim)' }}>
      <div style={{
        margin: '0 auto 14px', width: 32, height: 1,
        background: 'var(--border)',
      }} />
      <div style={{ fontFamily: T.ui, fontSize: 11, lineHeight: 1.8, opacity: 0.65 }}>
        {REGISTRY.length} simulări disponibile
      </div>
      <div style={{
        fontFamily: T.serif, fontStyle: 'italic',
        fontSize: 11, opacity: 0.4, marginTop: 4,
      }}>
        Funcționează offline după prima încărcare
      </div>
    </div>
  )
}
