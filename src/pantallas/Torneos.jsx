import { useMemo, useState } from 'react'
import { CalendarPlus, Check, MapPin, Medal, Plus, Radio, Ruler, Trash2, Users, Wallet, X } from 'lucide-react'
import { ALUMNOS, ESTADOS_TORNEO, ESTILOS, GRUPOS, METAS, RESULTADOS_INTERNO, TORNEOS, alumnoPorId, enDias, constancia, diasDesde, flechasDe, promedio, sesionesEntre } from '../datos.js'
import { Barra, Sello } from '../graficas.jsx'
import { Avatares, Pestanas, useAviso } from '../comunes.jsx'
import { dec, fechaCorta, iniciales, pesos, relativo } from '../formato.js'
import { CampoFecha, aISO } from '../selectores.jsx'
import './torneos.css'

const diaSemana = new Intl.DateTimeFormat('es-MX', { weekday: 'short' })
const mesCorto = new Intl.DateTimeFormat('es-MX', { month: 'short' })

/** Promedio, constancia y metas cumplidas de cada alumno: con esto se arma el equipo. */
function useFichas() {
  return useMemo(
    () =>
      ALUMNOS.map((a) => {
        const s = sesionesEntre(a, 30)
        return { a, prom: promedio(s), cons: constancia(s), flechas: flechasDe(s), metas: METAS[a.id].filter((m) => m.actual >= m.objetivo).length }
      }).sort((x, y) => (y.prom ?? 0) - (x.prom ?? 0)),
    [],
  )
}

function FechaBloque({ fecha }) {
  return (
    <time className="fecha-bloque" dateTime={fecha.toISOString().slice(0, 10)}>
      <span>{diaSemana.format(fecha).replace('.', '')}</span>
      <b>{fecha.getDate()}</b>
      <span>{mesCorto.format(fecha).replace('.', '')}</span>
    </time>
  )
}

function Calendario({ torneos, setTorneos, avisar }) {
  const [elegido, setElegido] = useState(() => torneos.find((t) => diasDesde(t.fecha) < 0)?.id)
  const fichas = useFichas()
  const t = torneos.find((x) => x.id === elegido)
  const proximos = torneos.filter((x) => diasDesde(x.fecha) <= 0)
  const pasados = torneos.filter((x) => diasDesde(x.fecha) > 0)

  const actualizar = (cambio) => setTorneos((ts) => ts.map((x) => (x.id === t.id ? { ...x, ...cambio(x) } : x)))
  const agregar = (id) => actualizar((x) => ({ alumnos: [...x.alumnos, id], estados: { ...x.estados, [id]: 'Invitado' } }))
  const quitar = (id) => actualizar((x) => ({ alumnos: x.alumnos.filter((y) => y !== id) }))
  const estado = (id, e) => actualizar((x) => ({ estados: { ...x.estados, [id]: e } }))

  const fila = (x) => {
    const cierra = -diasDesde(x.inscripcionHasta)
    const conteo = ESTADOS_TORNEO.map((e) => x.alumnos.filter((id) => x.estados[id] === e).length)
    return (
      <li key={x.id}>
        <button className={`torneo-fila ${x.id === elegido ? 'elegido' : ''} ${x.tipo === 'Interno' ? 'interno' : ''}`} onClick={() => setElegido(x.id)}>
          <FechaBloque fecha={x.fecha} />
          <div className="torneo-info">
            <span className="torneo-tipo">{x.tipo}</span>
            <strong>{x.nombre}</strong>
            <small><MapPin size={13} aria-hidden="true" /> {x.sede} <Ruler size={13} aria-hidden="true" /> {x.distancias}</small>
            {x.resultado ? (
              <small className="resultado"><Medal size={13} aria-hidden="true" /> {x.resultado}</small>
            ) : (
              <small className={cierra < 5 && cierra >= 0 ? 'mal' : ''}>
                {cierra >= 0 ? `Inscripción cierra ${relativo(x.inscripcionHasta)}` : 'Inscripción cerrada'}{x.costo ? `, ${pesos(x.costo)}` : ', sin costo'}
              </small>
            )}
          </div>
          <div className="torneo-alumnos">
            <Avatares nombres={x.alumnos.map((id) => alumnoPorId(id).nombre)} max={4} />
            {x.alumnos.length > 0 && !x.resultado && (
              <span className="estados-barra" title={ESTADOS_TORNEO.map((e, i) => `${e}: ${conteo[i]}`).join(', ')}>
                {conteo.map((n, i) => n > 0 && <span key={i} className={`estado-${i}`} style={{ flex: n }} />)}
              </span>
            )}
          </div>
        </button>
      </li>
    )
  }

  const asignados = t ? t.alumnos.map((id) => alumnoPorId(id)) : []
  const sugeridos = t ? fichas.filter((f) => !t.alumnos.includes(f.a.id)).slice(0, 6) : []
  const porCobrar = t ? t.alumnos.filter((id) => t.estados[id] !== 'Pagado').length * t.costo : 0

  return (
    <div className="torneos-columnas">
      <div className="torneos-lista">
        <h2 className="titulo-seccion">Próximos</h2>
        <ul>{proximos.map(fila)}</ul>
        {pasados.length > 0 && (
          <>
            <h2 className="titulo-seccion pasados">Ya pasaron</h2>
            <ul>{pasados.map(fila)}</ul>
          </>
        )}
      </div>

      {t && (
        <aside className="tarjeta torneo-detalle" key={t.id}>
          <div className="detalle-cabeza">
            <FechaBloque fecha={t.fecha} />
            <div>
              <span className="torneo-tipo">{t.tipo}</span>
              <h2>{t.nombre}</h2>
              <small>{t.sede}, {t.distancias}</small>
            </div>
          </div>
          <div className="detalle-cifras">
            <div><b>{t.alumnos.length}</b><small>alumnos</small></div>
            <div><b>{t.alumnos.filter((id) => t.estados[id] === 'Pagado').length}</b><small>pagados</small></div>
            <div><b>{t.costo ? pesos(porCobrar) : '—'}</b><small>por cobrar</small></div>
          </div>

          <h3><Users size={17} aria-hidden="true" /> Van al torneo</h3>
          {asignados.length ? (
            <ul className="asignados">
              {asignados.map((a) => (
                <li key={a.id}>
                  <span className="avatar chico">{iniciales(a.nombre)}</span>
                  <a href={`#/alumnos/${a.id}`}>{a.nombreCorto}<small>{ESTILOS[a.estilo]}, {a.categoria}</small></a>
                  {t.resultado ? (
                    <span className="estado bien">Fue</span>
                  ) : (
                    <>
                      <select value={t.estados[a.id]} onChange={(e) => estado(a.id, e.target.value)} className={`estado-select estado-${ESTADOS_TORNEO.indexOf(t.estados[a.id])}`} aria-label={`Estado de ${a.nombre}`}>
                        {ESTADOS_TORNEO.map((e) => <option key={e}>{e}</option>)}
                      </select>
                      <button className="icono-chico peligro" onClick={() => quitar(a.id)} aria-label={`Quitar a ${a.nombre}`}><Trash2 size={15} /></button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="vacio">Nadie asignado todavía. Agrega alumnos de la lista de abajo.</p>
          )}

          {!t.resultado && (
            <>
              <h3><Plus size={17} aria-hidden="true" /> Sugeridos por su promedio</h3>
              <ul className="sugeridos">
                {sugeridos.map(({ a, prom }) => (
                  <li key={a.id}>
                    <Sello prom={prom} />
                    <span>{a.nombreCorto}<small>{a.grupo}</small></span>
                    <button className="boton secundario chico" onClick={() => agregar(a.id)}><Plus size={15} aria-hidden="true" /> Agregar</button>
                  </li>
                ))}
              </ul>
              <div className="acciones">
                <button className="boton oro" onClick={() => avisar(`Invitación mandada a ${t.alumnos.filter((id) => t.estados[id] === 'Invitado').length} alumnos por la app.`)}>
                  Mandar invitaciones
                </button>
                {t.costo > 0 && (
                  <button className="boton secundario" onClick={() => avisar('Recordatorio de pago mandado a los que no han pagado.')}><Wallet size={16} aria-hidden="true" /> Recordar pago</button>
                )}
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  )
}

function Equipo({ avisar }) {
  const fichas = useFichas()
  const [equipo, setEquipo] = useState(() => new Set(ALUMNOS.filter((a) => a.grupo === 'Equipo de competencia').map((a) => a.id)))
  const [estilo, setEstilo] = useState('')
  const lista = fichas.filter((f) => !estilo || f.a.estilo === estilo)
  const cambiar = (id) => setEquipo((e) => {
    const n = new Set(e)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    return n
  })

  return (
    <div className="equipo">
      <div className="equipo-cabeza">
        <p className="ayuda">Ordenados por su promedio de los últimos 30 días. Toca una tarjeta para meter o sacar al alumno del equipo de competencia.</p>
        <div className="filtros">
          <select value={estilo} onChange={(e) => setEstilo(e.target.value)} aria-label="Arco">
            <option value="">Todos los arcos</option>
            {Object.entries(ESTILOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="boton oro" onClick={() => avisar(`Equipo guardado: ${equipo.size} alumnos.`)}><Check size={17} aria-hidden="true" /> Guardar equipo ({equipo.size})</button>
        </div>
      </div>
      <ul className="equipo-rejilla">
        {lista.map(({ a, prom, cons, flechas, metas }, i) => {
          const dentro = equipo.has(a.id)
          return (
            <li key={a.id}>
              <button className={`candidato ${dentro ? 'dentro' : ''}`} onClick={() => cambiar(a.id)} aria-pressed={dentro}>
                <span className="candidato-lugar">{i + 1}</span>
                <span className="candidato-cabeza">
                  <span className="avatar">{iniciales(a.nombre)}</span>
                  <span><strong>{a.nombreCorto}</strong><small>{ESTILOS[a.estilo]}, {a.categoria}</small></span>
                  <Sello prom={prom} />
                </span>
                <span className="candidato-datos">
                  <span><b>{cons == null ? '—' : `±${dec(cons, 1)}`}</b> constancia</span>
                  <span><b>{flechas}</b> flechas</span>
                  <span><b>{metas}</b> metas</span>
                </span>
                <span className="candidato-marca">{dentro ? <><Check size={14} aria-hidden="true" /> En el equipo</> : 'Fuera del equipo'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Interno() {
  const t = TORNEOS.find((x) => x.id === 't2')
  const [categoria, setCategoria] = useState('')
  const filas = RESULTADOS_INTERNO.map((r) => ({ ...r, a: alumnoPorId(r.id) }))
    .filter((r) => !categoria || r.a.estilo === categoria)
    .sort((x, y) => y.puntos - x.puntos || y.dieces - x.dieces)
  const maxTandas = 12

  return (
    <div className="interno">
      <section className="portada interno-portada">
        <svg className="portada-anillos" viewBox="0 0 400 400" aria-hidden="true">
          {[190, 160, 130, 100, 70, 40].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        </svg>
        <span className="en-vivo"><Radio size={15} aria-hidden="true" /> En vivo</span>
        <h2>{t.nombre}</h2>
        <p className="ayuda">{fechaCorta(t.fecha)}, {t.sede}. Ronda de 72 flechas. Los puntos llegan solos desde la app de cada arquero.</p>
        <div className="podio">
          {filas.slice(0, 3).map((r, i) => (
            <div key={r.id} className={`podio-lugar lugar-${i + 1}`}>
              <span className="avatar">{iniciales(r.a.nombre)}</span>
              <strong>{r.a.nombreCorto}</strong>
              <b>{r.puntos}</b>
              <span className="podio-escalon">{i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="filtros">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Arco">
          <option value="">Todos los arcos</option>
          {Object.entries(ESTILOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="tabla-envoltura">
        <table className="tabla compacta">
          <thead>
            <tr><th className="num">Lugar</th><th>Arquero</th><th>Arco</th><th>Avance</th><th className="num">10 y X</th><th className="num">Puntos</th></tr>
          </thead>
          <tbody>
            {filas.map((r, i) => (
              <tr key={r.id} className={i < 3 ? `fila-lugar-${i + 1}` : ''}>
                <td className="num"><span className="lugar">{i + 1}</span></td>
                <td><a className="celda-alumno" href={`#/alumnos/${r.id}`}><span className="avatar chico">{iniciales(r.a.nombre)}</span><span><strong>{r.a.nombre}</strong><small>{r.a.categoria}</small></span></a></td>
                <td>{ESTILOS[r.a.estilo]}</td>
                <td className="avance"><Barra valor={r.tandas} max={maxTandas} estado={r.tandas === maxTandas ? 'bien' : ''} /><small>{r.tandas} de {maxTandas} tandas</small></td>
                <td className="num">{r.dieces}</td>
                <td className="num"><b className="puntos">{r.puntos}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NuevoTorneo({ cerrar, crear }) {
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.target)
    crear({
      id: `t${Date.now()}`,
      nombre: f.get('nombre'),
      tipo: f.get('tipo'),
      fecha: new Date(`${f.get('fecha')}T00:00`),
      sede: f.get('sede') || 'Campo del club',
      distancias: f.get('distancias') || '18 m',
      inscripcionHasta: new Date(`${f.get('cierre') || f.get('fecha')}T00:00`),
      costo: +f.get('costo') || 0,
      alumnos: f.get('tipo') === 'Interno' ? ALUMNOS.filter((a) => (f.getAll('grupos')).includes(a.grupo)).map((a) => a.id) : [],
      estados: {},
    })
  }
  return (
    <form className="tarjeta nuevo-torneo" onSubmit={enviar}>
      <div className="editor-cabeza">
        <h2><CalendarPlus size={20} aria-hidden="true" /> Nuevo torneo</h2>
        <button type="button" className="icono-chico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button>
      </div>
      <div className="nuevo-torneo-campos">
        <label className="campo ancho">Nombre<input name="nombre" required placeholder="Ej. Copa de Primavera" /></label>
        <label className="campo">Tipo<select name="tipo"><option>Externo</option><option>Interno</option></select></label>
        <label className="campo">Fecha<CampoFecha name="fecha" defaultValue={aISO(enDias(21))} etiqueta="Fecha del torneo" /></label>
        <label className="campo">Cierre de inscripción<CampoFecha name="cierre" defaultValue={aISO(enDias(14))} etiqueta="Cierre de inscripción" /></label>
        <label className="campo">Sede<input name="sede" placeholder="Campo del club" /></label>
        <label className="campo">Distancias<input name="distancias" placeholder="18 m" /></label>
        <label className="campo">Costo<input name="costo" type="number" min="0" placeholder="0" /></label>
      </div>
      <fieldset className="para-quien">
        <legend>Si es interno, ¿qué grupos participan?</legend>
        <div className="fichas-opcion">
          {GRUPOS.map((g) => <label key={g} className="opcion"><input type="checkbox" name="grupos" value={g} /> {g}</label>)}
        </div>
      </fieldset>
      <div className="acciones"><button className="boton oro" type="submit"><Plus size={17} aria-hidden="true" /> Crear torneo</button></div>
    </form>
  )
}

export default function Torneos() {
  const [vista, setVista] = useState('calendario')
  const [torneos, setTorneos] = useState(TORNEOS)
  const [nuevo, setNuevo] = useState(false)
  const [aviso, avisar] = useAviso()

  return (
    <div className="torneos">
      <header className="encabezado">
        <div>
          <h1>Torneos</h1>
          <p className="sobretitulo">Calendario, equipo de competencia y resultados de los torneos del club.</p>
        </div>
        <button className="boton oro" onClick={() => setNuevo(true)}><Plus size={17} aria-hidden="true" /> Nuevo torneo</button>
      </header>
      {nuevo && <NuevoTorneo cerrar={() => setNuevo(false)} crear={(t) => { setTorneos((ts) => [...ts, t].sort((a, b) => a.fecha - b.fecha)); setNuevo(false); avisar(`Torneo «${t.nombre}» creado.`) }} />}
      <Pestanas opciones={[['calendario', 'Calendario'], ['equipo', 'Equipo de competencia'], ['interno', 'Torneo interno']]} valor={vista} cambiar={setVista} />
      {vista === 'calendario' && <Calendario torneos={torneos} setTorneos={setTorneos} avisar={avisar} />}
      {vista === 'equipo' && <Equipo avisar={avisar} />}
      {vista === 'interno' && <Interno />}
      {aviso}
    </div>
  )
}
