// Gráficas dibujadas a mano en SVG (sin librerías): la línea de tiro del club, la diana con
// impactos, la línea de promedio semanal y la gráfica chiquita de tendencia.

import { useId, useLayoutEffect, useRef, useState } from 'react'

/** Anillo de la diana en el que cae un promedio: así se pinta en toda la página. */
export function anilloDe(prom) {
  if (prom == null) return 'sin'
  if (prom >= 9) return 'oro'
  if (prom >= 7) return 'rojo'
  if (prom >= 5) return 'azul'
  if (prom >= 3) return 'negro'
  return 'blanco'
}

/** El promedio dentro de un sello con el color de su anillo. */
export function Sello({ prom, grande, children }) {
  return <span className={`sello ${anilloDe(prom)} ${grande ? 'grande' : ''}`}>{children ?? (prom == null ? '—' : prom.toFixed(2))}</span>
}

const ESCALA = { min: 3, max: 10 }
const BANDAS = [
  { desde: 3, hasta: 5, clase: 'negro' },
  { desde: 5, hasta: 7, clase: 'azul' },
  { desde: 7, hasta: 9, clase: 'rojo' },
  { desde: 9, hasta: 10, clase: 'oro' },
]

/**
 * La línea de tiro: todo el club sobre la escala de la diana, cada alumno en su promedio de 30
 * días. Los que se encimarían se apilan hacia arriba. Al pasar sobre uno sale su tarjeta.
 */
export function LineaDeTiro({ puntos }) {
  const caja = useRef(null)
  const [ancho, setAncho] = useState(900)
  const [foco, setFoco] = useState(null)
  useLayoutEffect(() => {
    const el = caja.current
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Los círculos crecen con el ancho disponible: chicos en celular, más grandes en pantallas amplias.
  const tam = ancho < 480 ? 20 : ancho < 760 ? 24 : ancho < 1200 ? 30 : 34
  const x = (v) => ((Math.max(ESCALA.min, Math.min(ESCALA.max, v)) - ESCALA.min) / (ESCALA.max - ESCALA.min)) * (ancho - tam) + tam / 2
  const pilas = []
  const colocados = [...puntos]
    .filter((p) => p.prom != null)
    .sort((a, b) => a.prom - b.prom)
    .map((p, i) => {
      const px = x(p.prom)
      let fila = 0
      while (pilas[fila] != null && px - pilas[fila] < tam + 2) fila++
      pilas[fila] = px
      return { ...p, px, fila, orden: i }
    })
  const filas = Math.max(1, pilas.length)
  const alto = filas * (tam + 4) + 8
  const elegido = colocados.find((p) => p.id === foco)

  return (
    <div className="linea-tiro" ref={caja} onMouseLeave={() => setFoco(null)}>
      <div className="linea-tiro-campo" style={{ height: alto }}>
        {colocados.map((p) => (
          <a
            key={p.id}
            href={`#/alumnos/${p.id}`}
            className={`marcador ${p.estado} ${foco === p.id ? 'enfocado' : ''}`}
            style={{ left: p.px - tam / 2, bottom: 6 + p.fila * (tam + 4), width: tam, height: tam, '--retardo': `${250 + p.orden * 22}ms` }}
            onMouseEnter={() => setFoco(p.id)}
            onFocus={() => setFoco(p.id)}
            onBlur={() => setFoco(null)}
            aria-label={`${p.nombre}, ${p.prom.toFixed(2)} por flecha`}
          >
            {p.iniciales}
          </a>
        ))}
        {elegido && (
          <div
            className="tarjeta-flotante"
            role="presentation"
            style={{
              left: Math.min(Math.max(elegido.px, 120), ancho - 120),
              bottom: 6 + (elegido.fila + 1) * (tam + 4) + 8,
            }}
          >
            <div className="tf-cabeza">
              <strong>{elegido.nombre}</strong>
              <Sello prom={elegido.prom} />
            </div>
            <span className="tf-grupo">{elegido.grupo}</span>
            <Mini valores={elegido.semanas} ancho={200} alto={34} />
            <span className={`tf-nota ${elegido.estado}`}>{elegido.nota}</span>
          </div>
        )}
      </div>
      <div className="linea-tiro-bandas" aria-hidden="true">
        {BANDAS.map((b) => (
          <span key={b.clase} className={b.clase} style={{ width: `${((b.hasta - b.desde) / (ESCALA.max - ESCALA.min)) * 100}%` }}>
            <b>{b.desde}</b>
          </span>
        ))}
        <b className="fin">10</b>
      </div>
    </div>
  )
}

const ANILLOS = ['#FAFAFA', '#FAFAFA', '#1E1E1E', '#1E1E1E', '#2462C6', '#2462C6', '#D7372F', '#D7372F', '#F2B705', '#F2B705']

/**
 * Diana de 10 anillos con los impactos (x, y normalizados al radio) y el centro del grupo. Los
 * impactos se clavan uno tras otro al aparecer.
 */
export function Diana({ flechas, tam = 260 }) {
  const r = tam / 2 - 6
  const c = tam / 2
  const dentro = flechas.filter((f) => f.v > 0)
  const mx = dentro.reduce((s, f) => s + f.x, 0) / (dentro.length || 1)
  const my = dentro.reduce((s, f) => s + f.y, 0) / (dentro.length || 1)
  const paso = Math.min(4, 900 / (dentro.length || 1))
  return (
    <svg viewBox={`0 0 ${tam} ${tam}`} className="diana" role="img" aria-label={`Diana con ${flechas.length} impactos`}>
      <defs>
        <radialGradient id="brillo-diana" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c + 4} r={r + 2} className="diana-sombra" />
      {ANILLOS.map((color, i) => (
        <circle key={i} cx={c} cy={c} r={r * (1 - i / 10)} fill={color} stroke={i < 2 ? '#1E1E1E' : i < 4 ? '#FAFAFA' : '#1E1E1E33'} strokeWidth={i === 0 ? 1.2 : 0.6} />
      ))}
      <circle cx={c} cy={c} r={r * 0.05} fill="none" stroke="#1E1E1E66" strokeWidth={0.6} />
      <circle cx={c} cy={c} r={r} fill="url(#brillo-diana)" />
      {dentro.map((f, i) => (
        <circle
          key={i}
          cx={c + f.x * r}
          cy={c + f.y * r}
          r={2.6}
          className="impacto"
          style={{ animationDelay: `${300 + i * paso}ms`, transformOrigin: `${c + f.x * r}px ${c + f.y * r}px` }}
        />
      ))}
      {dentro.length > 0 && (
        <g className="centro-grupo" style={{ animationDelay: `${400 + dentro.length * paso}ms`, transformOrigin: `${c + mx * r}px ${c + my * r}px` }}>
          <circle cx={c + mx * r} cy={c + my * r} r={11} />
          <line x1={c + mx * r - 7} y1={c + my * r} x2={c + mx * r + 7} y2={c + my * r} />
          <line x1={c + mx * r} y1={c + my * r - 7} x2={c + mx * r} y2={c + my * r + 7} />
        </g>
      )}
    </svg>
  )
}

/** Promedio por flecha de cada semana, con el área sombreada. Los huecos son semanas sin tirar. */
export function LineaPromedio({ semanas, alto = 190 }) {
  const id = useId()
  const ancho = 560
  const m = { izq: 30, der: 12, arr: 14, abj: 26 }
  const vals = semanas.map((s) => s.promedio).filter((v) => v != null)
  if (!vals.length) return <p className="vacio">Sin sesiones en estas semanas.</p>
  const min = Math.max(0, Math.floor(Math.min(...vals) - 0.5))
  const max = Math.min(10, Math.ceil(Math.max(...vals) + 0.5))
  const x = (i) => m.izq + (i * (ancho - m.izq - m.der)) / (semanas.length - 1)
  const y = (v) => m.arr + ((max - v) * (alto - m.arr - m.abj)) / (max - min || 1)
  const tramos = []
  let actual = []
  semanas.forEach((s, i) => {
    if (s.promedio == null) {
      if (actual.length) tramos.push(actual)
      actual = []
    } else actual.push([x(i), y(s.promedio)])
  })
  if (actual.length) tramos.push(actual)
  const marcas = []
  for (let v = min; v <= max; v++) marcas.push(v)
  const piso = alto - m.abj
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="linea" role="img" aria-label="Promedio por flecha de cada semana">
      <defs>
        <linearGradient id={`area-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="area-arriba" />
          <stop offset="100%" className="area-abajo" />
        </linearGradient>
      </defs>
      {marcas.map((v) => (
        <g key={v}>
          <line x1={m.izq} x2={ancho - m.der} y1={y(v)} y2={y(v)} className="rejilla" />
          <text x={m.izq - 8} y={y(v) + 4} className="eje" textAnchor="end">{v}</text>
        </g>
      ))}
      {semanas.map((s, i) =>
        i % 4 === 3 || i === semanas.length - 1 ? (
          <text key={i} x={x(i)} y={alto - 6} className="eje" textAnchor={i === semanas.length - 1 ? 'end' : 'middle'}>
            {s.semana === 0 ? 'esta semana' : `hace ${s.semana} sem.`}
          </text>
        ) : null,
      )}
      {tramos.map((t, i) => (
        <g key={i}>
          {t.length > 1 && (
            <polygon className="area" fill={`url(#area-${id})`} points={`${t[0][0]},${piso} ${t.map((p) => p.join(',')).join(' ')} ${t[t.length - 1][0]},${piso}`} />
          )}
          <polyline points={t.map((p) => p.join(',')).join(' ')} className="trazo" pathLength={1} />
        </g>
      ))}
      {semanas.map((s, i) =>
        s.promedio == null ? null : (
          <circle key={i} cx={x(i)} cy={y(s.promedio)} r={i === semanas.length - 1 ? 5 : 3.2} className={`punto ${i === semanas.length - 1 ? 'ultimo' : ''}`} style={{ animationDelay: `${200 + i * 50}ms` }}>
            <title>{`${s.promedio.toFixed(2)} por flecha, ${s.flechas} flechas`}</title>
          </circle>
        ),
      )}
    </svg>
  )
}

/** Gráfica chiquita de tendencia. */
export function Mini({ valores, ancho = 90, alto = 26 }) {
  const v = valores.filter((x) => x != null)
  if (v.length < 2) return <span className="tenue">—</span>
  const min = Math.min(...v)
  const max = Math.max(...v)
  const pts = v.map((val, i) => `${(i * ancho) / (v.length - 1)},${alto - 3 - ((val - min) * (alto - 6)) / (max - min || 1)}`)
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} className="mini" aria-hidden="true">
      <polyline points={pts.join(' ')} />
      <circle cx={pts.at(-1).split(',')[0]} cy={pts.at(-1).split(',')[1]} r={2.6} />
    </svg>
  )
}

export function Barra({ valor, max, estado, retardo = 0 }) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100))
  return (
    <div className={`barra ${estado ?? ''}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${pct}%`, animationDelay: `${retardo}ms` }} />
    </div>
  )
}
