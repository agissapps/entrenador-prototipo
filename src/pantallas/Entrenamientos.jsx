import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, BookmarkPlus, Check, Clock, Copy, Dumbbell, Flame, Plus, Send, Smartphone, Snowflake, Target, Trash2, Users, Wind } from 'lucide-react'
import { ALUMNOS, CLASES, GRUPOS, HOY, PLANTILLAS, TIPOS_BLOQUE, diasDesde, plantillaPorId } from '../datos.js'
import { Barra } from '../graficas.jsx'
import './entrenamientos.css'

const ICONOS_BLOQUE = { calentamiento: Flame, tecnica: Target, tiro: Wind, fisico: Dumbbell, enfriamiento: Snowflake }
const REPETIR = {
  una: 'Solo esta vez',
  semanal: 'Cada semana el mismo día, por 4 semanas',
  lmv: 'Lunes, miércoles y viernes, por 4 semanas',
}
const diaCorto = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric' })
const diaLargo = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const aISO = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`

function claseDesde(plantilla, fecha = HOY) {
  return {
    nombre: plantilla.nombre,
    objetivo: plantilla.objetivo,
    bloques: plantilla.bloques.map((b, i) => ({ ...b, id: `${plantilla.id}-${i}-${Math.random()}` })),
    fecha: aISO(fecha),
    hora: '16:00',
    modo: 'grupos',
    grupos: ['Intermedio'],
    alumnos: [],
    repetir: 'una',
  }
}

/** Minutos aproximados de un bloque: los de tiro se calculan a 2 minutos por tanda de 3 flechas. */
function minutosDe(b) {
  if (b.tipo === 'tiro') return Math.round((b.tandas * b.flechas) / 3) * 2
  if (b.tipo === 'fisico') return b.series * 2
  return b.minutos ?? 0
}

function destinatarios(clase) {
  if (clase.modo === 'todos') return ALUMNOS.map((a) => a.id)
  if (clase.modo === 'grupos') return ALUMNOS.filter((a) => clase.grupos.includes(a.grupo)).map((a) => a.id)
  return clase.alumnos
}

function Bloque({ b, i, total, cambiar, mover, quitar }) {
  const Icono = ICONOS_BLOQUE[b.tipo]
  const num = (campo) => (e) => cambiar({ ...b, [campo]: Math.max(1, +e.target.value || 1) })
  return (
    <li className={`bloque bloque-${b.tipo}`}>
      <div className="bloque-cabeza">
        <span className="bloque-icono" aria-hidden="true"><Icono size={16} /></span>
        <strong>{TIPOS_BLOQUE[b.tipo]}</strong>
        <span className="bloque-min"><Clock size={13} aria-hidden="true" /> {minutosDe(b)} min</span>
        <div className="bloque-acciones">
          <button className="icono-chico" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir bloque"><ArrowUp size={15} /></button>
          <button className="icono-chico" onClick={() => mover(i, 1)} disabled={i === total - 1} aria-label="Bajar bloque"><ArrowDown size={15} /></button>
          <button className="icono-chico peligro" onClick={() => quitar(i)} aria-label="Quitar bloque"><Trash2 size={15} /></button>
        </div>
      </div>
      <input className="bloque-texto" value={b.texto} onChange={(e) => cambiar({ ...b, texto: e.target.value })} placeholder="¿Qué van a hacer?" aria-label="Descripción del bloque" />
      <div className="bloque-numeros">
        {b.tipo === 'tiro' && (
          <>
            <label>Distancia<span><input type="number" value={b.distancia} onChange={num('distancia')} /> m</span></label>
            <label>Tandas<span><input type="number" value={b.tandas} onChange={num('tandas')} /></span></label>
            <label>Flechas por tanda<span><input type="number" value={b.flechas} onChange={num('flechas')} /></span></label>
            <span className="bloque-total">{b.tandas * b.flechas} flechas</span>
          </>
        )}
        {b.tipo === 'fisico' && (
          <>
            <label>Series<span><input type="number" value={b.series} onChange={num('series')} /></span></label>
            <label>Repeticiones o tiempo<span><input value={b.repeticiones} onChange={(e) => cambiar({ ...b, repeticiones: e.target.value })} /></span></label>
          </>
        )}
        {b.tipo !== 'tiro' && b.tipo !== 'fisico' && (
          <label>Minutos<span><input type="number" value={b.minutos} onChange={num('minutos')} /> min</span></label>
        )}
      </div>
    </li>
  )
}

/** Cómo verá la clase el alumno en la app del teléfono. */
function VistaApp({ clase }) {
  const fecha = new Date(`${clase.fecha}T00:00`)
  return (
    <div className="telefono" aria-label="Vista previa en la app">
      <div className="telefono-pantalla">
        <span className="telefono-barra" />
        <p className="telefono-dia">{diaLargo.format(fecha)}, {clase.hora}</p>
        <strong className="telefono-titulo">{clase.nombre || 'Clase sin nombre'}</strong>
        {clase.objetivo && <p className="telefono-objetivo">{clase.objetivo}</p>}
        <ol className="telefono-bloques">
          {clase.bloques.map((b) => (
            <li key={b.id}>
              <span className={`punto-bloque bloque-${b.tipo}`} />
              <div>
                <b>{TIPOS_BLOQUE[b.tipo]}</b>
                <small>
                  {b.tipo === 'tiro' ? `${b.distancia} m, ${b.tandas} × ${b.flechas} flechas` : b.tipo === 'fisico' ? `${b.series} series de ${b.repeticiones}` : `${b.minutos} min`}
                </small>
                {b.texto && <small>{b.texto}</small>}
              </div>
            </li>
          ))}
        </ol>
        <span className="telefono-boton">Empezar clase</span>
      </div>
    </div>
  )
}

export default function Entrenamientos() {
  const [clase, setClase] = useState(() => claseDesde(PLANTILLAS[0]))
  const [clases, setClases] = useState(CLASES)
  const [plantillas, setPlantillas] = useState(PLANTILLAS)
  const [aviso, setAviso] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const para = destinatarios(clase)
  const minutos = clase.bloques.reduce((s, b) => s + minutosDe(b), 0)
  const flechas = clase.bloques.filter((b) => b.tipo === 'tiro').reduce((s, b) => s + b.tandas * b.flechas, 0)
  const cambiar = (campos) => setClase((c) => ({ ...c, ...campos }))

  function avisar(texto) {
    setAviso(texto)
    setTimeout(() => setAviso(null), 3200)
  }

  function mover(i, d) {
    const b = [...clase.bloques]
    ;[b[i], b[i + d]] = [b[i + d], b[i]]
    cambiar({ bloques: b })
  }

  function agregar(tipo) {
    const nuevo = { tipo, id: Math.random(), texto: '' }
    if (tipo === 'tiro') Object.assign(nuevo, { distancia: 18, tandas: 6, flechas: 3 })
    else if (tipo === 'fisico') Object.assign(nuevo, { series: 3, repeticiones: '12' })
    else nuevo.minutos = 10
    cambiar({ bloques: [...clase.bloques, nuevo] })
  }

  function mandar() {
    if (!para.length || !clase.bloques.length) return
    const veces = clase.repetir === 'una' ? 1 : clase.repetir === 'semanal' ? 4 : 12
    const fecha = new Date(`${clase.fecha}T00:00`)
    const grupo = clase.modo === 'todos' ? 'Todo el club' : clase.modo === 'grupos' ? clase.grupos.join(', ') : `${para.length} alumnos`
    setClases((cs) => [...cs, { id: `n${cs.length}`, fecha, hora: clase.hora, grupo, nombre: clase.nombre, alumnos: para, hechos: [], mandada: true }])
    avisar(`Mandada a ${para.length} alumnos${veces > 1 ? `, se repite ${veces} veces` : ''}. Les llega a la app.`)
  }

  function guardarPlantilla() {
    const p = { id: `p${plantillas.length + 1}`, nombre: clase.nombre || 'Plantilla nueva', objetivo: clase.objetivo, bloques: clase.bloques }
    setPlantillas([...plantillas, p])
    avisar(`Plantilla «${p.nombre}» guardada.`)
  }

  // La semana: de hoy menos dos días a hoy más cinco.
  const semana = useMemo(() => Array.from({ length: 8 }, (_, i) => new Date(HOY.getTime() + (i - 2) * 86400000)), [])
  const alumnosFiltrados = busqueda.trim() ? ALUMNOS.filter((a) => a.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) && !clase.alumnos.includes(a.id)).slice(0, 6) : []

  return (
    <div className="entrenamientos">
      <header className="encabezado">
        <div>
          <h1>Entrenamientos</h1>
          <p className="sobretitulo">Arma la clase, mándala a la app y revisa quién la hizo.</p>
        </div>
      </header>

      <div className="entrenamientos-columnas">
        <section className="tarjeta editor" aria-labelledby="titulo-editor">
          <div className="editor-cabeza">
            <h2 id="titulo-editor">Armar clase</h2>
            <label className="desde-plantilla">
              Empezar desde
              <select onChange={(e) => e.target.value && setClase({ ...claseDesde(plantillaPorId(e.target.value) ?? plantillas.find((p) => p.id === e.target.value)), fecha: clase.fecha, hora: clase.hora, modo: clase.modo, grupos: clase.grupos, alumnos: clase.alumnos })} value="">
                <option value="">Elegir plantilla…</option>
                {plantillas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>
          </div>

          <div className="editor-fila">
            <label className="campo ancho">Nombre de la clase<input value={clase.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} /></label>
            <label className="campo">Día<input type="date" value={clase.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} /></label>
            <label className="campo">Hora<input type="time" value={clase.hora} onChange={(e) => cambiar({ hora: e.target.value })} /></label>
          </div>
          <label className="campo">Objetivo técnico<input value={clase.objetivo} onChange={(e) => cambiar({ objetivo: e.target.value })} placeholder="Ej. que el anclaje sea el mismo en cada flecha" /></label>

          <fieldset className="para-quien">
            <legend><Users size={16} aria-hidden="true" /> Para quién</legend>
            <div className="segmentos chicos" role="tablist">
              {[['todos', 'Todo el club'], ['grupos', 'Grupos'], ['alumnos', 'Alumnos']].map(([m, t]) => (
                <button key={m} role="tab" aria-selected={clase.modo === m} className={clase.modo === m ? 'activo' : ''} onClick={() => cambiar({ modo: m })}>{t}</button>
              ))}
            </div>
            {clase.modo === 'grupos' && (
              <div className="fichas-opcion">
                {GRUPOS.map((g) => {
                  const dentro = clase.grupos.includes(g)
                  return (
                    <button key={g} className={`opcion ${dentro ? 'elegida' : ''}`} aria-pressed={dentro} onClick={() => cambiar({ grupos: dentro ? clase.grupos.filter((x) => x !== g) : [...clase.grupos, g] })}>
                      {dentro && <Check size={14} aria-hidden="true" />} {g} <small>{ALUMNOS.filter((a) => a.grupo === g).length}</small>
                    </button>
                  )
                })}
              </div>
            )}
            {clase.modo === 'alumnos' && (
              <div className="elegir-alumnos">
                <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar alumno para agregar" aria-label="Buscar alumno" />
                {alumnosFiltrados.length > 0 && (
                  <ul className="sugerencias">
                    {alumnosFiltrados.map((a) => (
                      <li key={a.id}><button onClick={() => { cambiar({ alumnos: [...clase.alumnos, a.id] }); setBusqueda('') }}>{a.nombre} <small>{a.grupo}</small></button></li>
                    ))}
                  </ul>
                )}
                <div className="fichas-opcion">
                  {clase.alumnos.map((id) => (
                    <button key={id} className="opcion elegida" onClick={() => cambiar({ alumnos: clase.alumnos.filter((x) => x !== id) })} aria-label={`Quitar a ${ALUMNOS.find((a) => a.id === id).nombre}`}>
                      {ALUMNOS.find((a) => a.id === id).nombreCorto} ×
                    </button>
                  ))}
                  {!clase.alumnos.length && <p className="ayuda">Busca y agrega a uno o varios alumnos.</p>}
                </div>
              </div>
            )}
          </fieldset>

          <h3 className="sub">Bloques de la clase</h3>
          <ol className="bloques">
            {clase.bloques.map((b, i) => (
              <Bloque
                key={b.id}
                b={b}
                i={i}
                total={clase.bloques.length}
                cambiar={(nuevo) => cambiar({ bloques: clase.bloques.map((x, j) => (j === i ? nuevo : x)) })}
                mover={mover}
                quitar={(j) => cambiar({ bloques: clase.bloques.filter((_, k) => k !== j) })}
              />
            ))}
          </ol>
          <div className="agregar-bloque">
            {Object.entries(TIPOS_BLOQUE).map(([t, nombre]) => {
              const Icono = ICONOS_BLOQUE[t]
              return <button key={t} className={`opcion bloque-${t}`} onClick={() => agregar(t)}><Plus size={14} aria-hidden="true" /><Icono size={14} aria-hidden="true" /> {nombre}</button>
            })}
          </div>

          <label className="campo">Repetir<select value={clase.repetir} onChange={(e) => cambiar({ repetir: e.target.value })}>{Object.entries(REPETIR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>

          <div className="editor-pie">
            <p className="resumen-clase"><b>{minutos}</b> min aprox. <span>·</span> <b>{flechas}</b> flechas <span>·</span> <b>{para.length}</b> alumnos</p>
            <div className="acciones">
              <button className="boton secundario" onClick={guardarPlantilla}><BookmarkPlus size={17} aria-hidden="true" /> Guardar como plantilla</button>
              <button className="boton oro" onClick={mandar} disabled={!para.length || !clase.bloques.length}><Send size={17} aria-hidden="true" /> Mandar a {para.length} alumnos</button>
            </div>
          </div>
        </section>

        <aside className="entrenamientos-lado">
          <section className="tarjeta vista-app">
            <h2><Smartphone size={20} aria-hidden="true" /> Así le llega al alumno</h2>
            <VistaApp clase={clase} />
          </section>
        </aside>
      </div>

      <section className="tarjeta semana-clases" aria-labelledby="titulo-semana-clases">
        <h2 id="titulo-semana-clases">La semana</h2>
        <p className="ayuda">Las clases mandadas y las programadas. En las de días pasados ves cuántos la marcaron como hecha en la app.</p>
        <div className="dias">
          {semana.map((d) => {
            const delDia = clases.filter((c) => diasDesde(c.fecha) === diasDesde(d))
            const hoy = diasDesde(d) === 0
            return (
              <div key={d.toISOString()} className={`dia-columna ${hoy ? 'hoy' : ''} ${diasDesde(d) > 0 ? 'pasado' : ''}`}>
                <span className="dia-nombre">{hoy ? 'Hoy' : diaCorto.format(d).replace('.', '')}</span>
                {delDia.map((c) => {
                  const p = c.plantilla ? plantillaPorId(c.plantilla) : null
                  const pasada = diasDesde(c.fecha) >= 0
                  return (
                    <button key={c.id} className="clase-mini" onClick={() => p && setClase({ ...claseDesde(p, c.fecha), grupos: [c.grupo] })} title="Usar como base">
                      <span className="clase-hora">{c.hora}</span>
                      <strong>{p?.nombre ?? c.nombre}</strong>
                      <small>{c.grupo}</small>
                      {pasada ? (
                        <>
                          <Barra valor={c.hechos.length} max={c.alumnos.length || 1} estado={c.hechos.length / (c.alumnos.length || 1) >= 0.7 ? 'bien' : ''} />
                          <small>{c.hechos.length} de {c.alumnos.length} la hicieron</small>
                        </>
                      ) : (
                        <small className="programada"><Clock size={12} aria-hidden="true" /> Programada</small>
                      )}
                    </button>
                  )
                })}
                {!delDia.length && <span className="sin-clase">Sin clase</span>}
              </div>
            )
          })}
        </div>
      </section>

      <section className="tarjeta" aria-labelledby="titulo-plantillas">
        <h2 id="titulo-plantillas">Plantillas</h2>
        <ul className="plantillas">
          {plantillas.map((p) => (
            <li key={p.id}>
              <div>
                <strong>{p.nombre}</strong>
                <small>{p.objetivo}</small>
                <span className="mini-bloques">{p.bloques.map((b, i) => <span key={i} className={`punto-bloque bloque-${b.tipo}`} title={TIPOS_BLOQUE[b.tipo]} />)}</span>
              </div>
              <button className="boton secundario" onClick={() => setClase({ ...claseDesde(p, new Date(`${clase.fecha}T00:00`)), hora: clase.hora, modo: clase.modo, grupos: clase.grupos, alumnos: clase.alumnos })}><Copy size={16} aria-hidden="true" /> Usar</button>
            </li>
          ))}
        </ul>
      </section>

      {aviso && <div className="aviso-flotante" role="status"><Check size={18} aria-hidden="true" /> {aviso}</div>}
    </div>
  )
}
