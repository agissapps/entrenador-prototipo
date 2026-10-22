import { useState } from 'react'
import { AlarmClock, CheckCircle2, Goal, PencilLine, Plus, TrendingUp, X } from 'lucide-react'
import { ALUMNOS, GRUPOS, METAS, alumnoPorId, diasDesde } from '../datos.js'
import { Barra } from '../graficas.jsx'
import { useAviso } from '../comunes.jsx'
import { dec, iniciales, relativo } from '../formato.js'
import { Numero } from '../movimiento.jsx'
import './metas.css'

const TIPOS = {
  Puntos: { unidad: 'pts', auto: true, ejemplo: 'Promedio de 8.5 por flecha' },
  Volumen: { unidad: 'flechas', auto: true, ejemplo: 'Tirar 600 flechas este mes' },
  Distancia: { unidad: 'm', auto: true, ejemplo: 'Pasar a 50 m' },
  Libraje: { unidad: 'lb', auto: true, ejemplo: 'Subir a 30 lb' },
  Fuerza: { unidad: 's', auto: false, ejemplo: 'Sostener el anclaje 30 s' },
  Resistencia: { unidad: 'rep', auto: false, ejemplo: 'Remo con mancuerna: 20 repeticiones' },
}

/** Cumplida, en camino o en riesgo (vence pronto y va lejos). */
function estadoDe(m) {
  const avance = m.actual / m.objetivo
  if (avance >= 1) return 'cumplida'
  if (avance < 0.7 && -diasDesde(m.vence) < 14) return 'riesgo'
  return 'camino'
}
const NOMBRE_ESTADO = { cumplida: 'Cumplida', camino: 'En camino', riesgo: 'En riesgo' }
const valor = (m, v) => (m.unidad === 'pts' ? dec(v) : Math.round(v))

function NuevaMeta({ cerrar, crear }) {
  const [tipo, setTipo] = useState('Puntos')
  const [para, setPara] = useState('grupo')
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.target)
    const ids = para === 'grupo' ? ALUMNOS.filter((a) => a.grupo === f.get('grupo')).map((a) => a.id) : [f.get('alumno')]
    crear(ids, {
      tipo,
      texto: f.get('texto') || TIPOS[tipo].ejemplo,
      objetivo: +f.get('objetivo'),
      unidad: TIPOS[tipo].unidad,
      auto: TIPOS[tipo].auto,
      vence: new Date(`${f.get('vence')}T00:00`),
    })
  }
  return (
    <form className="tarjeta nueva-meta" onSubmit={enviar}>
      <div className="editor-cabeza">
        <h2><Goal size={20} aria-hidden="true" /> Nueva meta</h2>
        <button type="button" className="icono-chico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button>
      </div>
      <div className="fichas-opcion">
        {Object.keys(TIPOS).map((t) => (
          <button type="button" key={t} className={`opcion ${tipo === t ? 'elegida' : ''}`} aria-pressed={tipo === t} onClick={() => setTipo(t)}>{t}</button>
        ))}
      </div>
      <div className="nueva-meta-campos">
        <label className="campo ancho">Descripción<input name="texto" placeholder={TIPOS[tipo].ejemplo} /></label>
        <label className="campo">Objetivo ({TIPOS[tipo].unidad})<input name="objetivo" type="number" step="any" required /></label>
        <label className="campo">Fecha límite<input name="vence" type="date" required /></label>
        <label className="campo">Para
          <select value={para} onChange={(e) => setPara(e.target.value)}><option value="grupo">Un grupo</option><option value="alumno">Un alumno</option></select>
        </label>
        {para === 'grupo' ? (
          <label className="campo">Grupo<select name="grupo">{GRUPOS.map((g) => <option key={g}>{g}</option>)}</select></label>
        ) : (
          <label className="campo">Alumno<select name="alumno">{ALUMNOS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
        )}
      </div>
      <p className="ayuda">{TIPOS[tipo].auto ? 'Esta meta se actualiza sola con lo que el alumno registra en la app.' : 'Esta meta la anotas tú (o el alumno) cuando hace la prueba.'}</p>
      <div className="acciones"><button className="boton oro" type="submit"><Plus size={17} aria-hidden="true" /> Crear meta</button></div>
    </form>
  )
}

export default function Metas() {
  const [metas, setMetas] = useState(() => ALUMNOS.flatMap((a) => METAS[a.id].map((m, i) => ({ ...m, id: `${a.id}-${i}`, alumno: a.id }))))
  const [tipo, setTipo] = useState('')
  const [grupo, setGrupo] = useState('')
  const [estado, setEstado] = useState('')
  const [nueva, setNueva] = useState(false)
  const [anotando, setAnotando] = useState(null)
  const [aviso, avisar] = useAviso()

  const conEstado = metas.map((m) => ({ ...m, estado: estadoDe(m), a: alumnoPorId(m.alumno) }))
  const cuenta = (e) => conEstado.filter((m) => m.estado === e).length
  const lista = conEstado
    .filter((m) => (!tipo || m.tipo === tipo) && (!grupo || m.a.grupo === grupo) && (!estado || m.estado === estado))
    .sort((x, y) => ({ riesgo: 0, camino: 1, cumplida: 2 })[x.estado] - ({ riesgo: 0, camino: 1, cumplida: 2 })[y.estado] || x.vence - y.vence)

  function crear(ids, meta) {
    setMetas((ms) => [...ms, ...ids.map((id, i) => ({ ...meta, id: `n${Date.now()}-${i}`, alumno: id, actual: 0 }))])
    setNueva(false)
    avisar(`Meta creada para ${ids.length} ${ids.length === 1 ? 'alumno' : 'alumnos'}. Les llega a la app.`)
  }

  function anotar(e, m) {
    e.preventDefault()
    const v = +new FormData(e.target).get('avance')
    setMetas((ms) => ms.map((x) => (x.id === m.id ? { ...x, actual: v } : x)))
    setAnotando(null)
    avisar(v >= m.objetivo ? `¡${m.a.nombreCorto} cumplió su meta!` : 'Avance anotado.')
  }

  return (
    <div className="metas-pantalla">
      <header className="encabezado">
        <div>
          <h1>Metas</h1>
          <p className="sobretitulo">Las metas de todo el club. Las de puntos, volumen, distancia y libraje se actualizan solas con la app.</p>
        </div>
        <button className="boton oro" onClick={() => setNueva(true)}><Plus size={17} aria-hidden="true" /> Nueva meta</button>
      </header>

      {nueva && <NuevaMeta cerrar={() => setNueva(false)} crear={crear} />}

      <section className="cifras metas-cifras" aria-label="Resumen de metas">
        <button className={`cifra-tarjeta ${estado === 'riesgo' ? 'activa' : ''}`} onClick={() => setEstado(estado === 'riesgo' ? '' : 'riesgo')}>
          <span className="cifra-icono rojo" aria-hidden="true"><AlarmClock size={20} /></span>
          <span className="cifra"><Numero valor={cuenta('riesgo')} /></span>
          <span className="cifra-texto" title="Vencen en menos de 2 semanas y llevan menos del 70 %">en riesgo</span>
        </button>
        <button className={`cifra-tarjeta ${estado === 'camino' ? 'activa' : ''}`} onClick={() => setEstado(estado === 'camino' ? '' : 'camino')}>
          <span className="cifra-icono azul" aria-hidden="true"><TrendingUp size={20} /></span>
          <span className="cifra"><Numero valor={cuenta('camino')} /></span>
          <span className="cifra-texto">en camino</span>
        </button>
        <button className={`cifra-tarjeta ${estado === 'cumplida' ? 'activa' : ''}`} onClick={() => setEstado(estado === 'cumplida' ? '' : 'cumplida')}>
          <span className="cifra-icono oro" aria-hidden="true"><CheckCircle2 size={20} /></span>
          <span className="cifra"><Numero valor={cuenta('cumplida')} /></span>
          <span className="cifra-texto">cumplidas</span>
        </button>
      </section>

      <div className="filtros metas-filtros">
        <div className="fichas-opcion">
          {['', ...Object.keys(TIPOS)].map((t) => (
            <button key={t || 'todas'} className={`opcion ${tipo === t ? 'elegida' : ''}`} aria-pressed={tipo === t} onClick={() => setTipo(t)}>{t || 'Todas'}</button>
          ))}
        </div>
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)} aria-label="Grupo">
          <option value="">Todos los grupos</option>
          {GRUPOS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      <ul className="lista-metas">
        {lista.slice(0, 60).map((m) => (
          <li key={m.id} className={`meta-fila ${m.estado}`}>
            <a className="meta-alumno" href={`#/alumnos/${m.alumno}`}>
              <span className="avatar chico">{iniciales(m.a.nombre)}</span>
              <span><strong>{m.a.nombreCorto}</strong><small>{m.a.grupo}</small></span>
            </a>
            <div className="meta-cuerpo">
              <span className="meta-tipo">{m.tipo}</span>
              <strong>{m.texto}</strong>
              <Barra valor={m.actual} max={m.objetivo} estado={m.estado === 'cumplida' ? 'bien' : ''} />
              <small>{valor(m, m.actual)} de {valor(m, m.objetivo)} {m.unidad}{m.auto ? ', se actualiza con la app' : ''}</small>
            </div>
            <div className="meta-lado">
              <span className={`estado ${m.estado === 'cumplida' ? 'bien' : m.estado === 'riesgo' ? 'mal' : 'aviso'}`}>{NOMBRE_ESTADO[m.estado]}</span>
              <small>{m.estado === 'cumplida' ? '' : `vence ${relativo(m.vence)}`}</small>
              {!m.auto && m.estado !== 'cumplida' && (anotando === m.id ? (
                <form className="anotar" onSubmit={(e) => anotar(e, m)}>
                  <input name="avance" type="number" step="any" defaultValue={m.actual} autoFocus aria-label="Nuevo avance" />
                  <button className="boton chico" type="submit">Anotar</button>
                </form>
              ) : (
                <button className="boton secundario chico" onClick={() => setAnotando(m.id)}><PencilLine size={14} aria-hidden="true" /> Anotar avance</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {lista.length > 60 && <p className="ayuda">Se muestran 60 de {lista.length}. Usa los filtros para ver las demás.</p>}
      {!lista.length && <p className="vacio">Ninguna meta coincide con los filtros.</p>}
      {aviso}
    </div>
  )
}
