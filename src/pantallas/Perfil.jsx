import { useState } from 'react'
import { ArrowLeft, CalendarDays, CalendarPlus, Dumbbell, History, NotebookPen, Target, Wallet } from 'lucide-react'
import { AGENDA, ESTILOS, METAS, NOTAS, PAGOS, TORNEOS, HOY, alumnoPorId, constancia, diasDesde, etiqueta, flechasDe, promedio, promedioSemanal, sesionesEntre } from '../datos.js'
import { Barra, Diana, LineaPromedio, Sello, anilloDe } from '../graficas.jsx'
import { Numero } from '../movimiento.jsx'
import { dec, fechaCorta, iniciales, pesos, relativo } from '../formato.js'

const PERIODOS = { 7: 'Última semana', 30: 'Últimos 30 días', 90: 'Últimos 90 días' }

export default function Perfil({ id }) {
  const a = alumnoPorId(id)
  const [periodo, setPeriodo] = useState(30)
  const [notas, setNotas] = useState(() => NOTAS[id] ?? [])
  const [nota, setNota] = useState('')
  const [agenda, setAgenda] = useState(() => AGENDA.filter((e) => e.alumnos.includes(id)))
  const [formCita, setFormCita] = useState(false)

  if (!a) {
    return (
      <section className="pronto">
        <h1>No encontramos a ese alumno</h1>
        <a className="boton" href="#/alumnos">Ver la lista</a>
      </section>
    )
  }

  const sesiones = sesionesEntre(a, periodo)
  const prom = promedio(sesiones)
  const flechas = sesiones.flatMap((s) => s.flechas)
  const dieces = flechas.filter((f) => f.v >= 10).length
  const fallos = flechas.filter((f) => f.v === 0).length
  const cons = constancia(sesiones)
  const torneos = TORNEOS.filter((t) => t.alumnos.includes(id))
  const recientes = [...a.sesiones].reverse().slice(0, 6)

  function agregarNota(e) {
    e.preventDefault()
    if (!nota.trim()) return
    setNotas([{ fecha: HOY, texto: nota.trim() }, ...notas])
    setNota('')
  }

  function agendar(e) {
    e.preventDefault()
    const f = new FormData(e.target)
    setAgenda([...agenda, { id: `n${agenda.length}`, tipo: f.get('tipo'), titulo: f.get('titulo') || f.get('tipo'), fecha: new Date(`${f.get('fecha')}T00:00`), hora: f.get('hora'), con: f.get('con'), alumnos: [id] }].sort((x, y) => x.fecha - y.fecha))
    setFormCita(false)
  }

  return (
    <>
      <header className="portada ficha">
        <svg className="portada-anillos" viewBox="0 0 400 400" aria-hidden="true">
          {[190, 160, 130, 100, 70, 40].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        </svg>
        <a className="volver" href="#/alumnos"><ArrowLeft size={16} aria-hidden="true" /> Alumnos</a>
        <div className="ficha-nombre">
          <span className={`avatar grande ${anilloDe(promedio(sesionesEntre(a, 30)))}`}>{iniciales(a.nombre)}</span>
          <div>
            <h1>{a.nombre}</h1>
            <p className="ficha-grupo">{a.grupo}</p>
          </div>
        </div>
        <dl className="ficha-datos">
          <div><dt>Edad</dt><dd>{a.edad} años</dd></div>
          <div><dt>Categoría</dt><dd>{a.categoria}</dd></div>
          <div><dt>Arco</dt><dd>{ESTILOS[a.estilo]}, {a.libraje} lb</dd></div>
          <div><dt>Distancia</dt><dd>{a.distancia} m</dd></div>
          <div><dt>Mano</dt><dd>{a.mano}</dd></div>
          <div><dt>Equipo</dt><dd>{a.arco}</dd></div>
          <div><dt>Flechas</dt><dd>{a.flechas}</dd></div>
          {a.tutor && <div><dt>Tutor</dt><dd>{a.tutor}</dd></div>}
        </dl>
        <div className="acciones">
          <button className="boton fantasma" onClick={() => alert('Aquí se le mandaría un entrenamiento solo a este alumno.')}><Dumbbell size={17} aria-hidden="true" /> Mandarle entrenamiento</button>
          <button className="boton oro" onClick={() => { setFormCita(true); document.getElementById('agenda-alumno')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}><CalendarPlus size={17} aria-hidden="true" /> Agendar cita</button>
        </div>
      </header>

      <div className="segmentos" role="tablist" aria-label="Periodo">
        {Object.entries(PERIODOS).map(([d, nombre]) => (
          <button key={d} role="tab" aria-selected={periodo === +d} className={periodo === +d ? 'activo' : ''} onClick={() => setPeriodo(+d)}>{nombre}</button>
        ))}
      </div>

      <section className="tiro-resumen" aria-label="Cómo tira en el periodo">
        <div className="tiro-diana">
          <Diana flechas={flechas.slice(-400)} tam={320} key={periodo} />
          <p className="ayuda">Sus últimas {Math.min(400, flechas.length)} flechas. La cruz verde marca el centro del grupo.</p>
        </div>
        <div className="tiro-numeros">
          <div className="tiro-promedio">
            <Sello prom={prom} grande><Numero valor={prom} decimales={2} key={periodo} /></Sello>
            <span className="cifra-texto">promedio por flecha, sobre 10</span>
          </div>
          <div className="cifras compactas">
            <div><span className="cifra"><Numero valor={flechasDe(sesiones)} key={periodo} /></span><span className="cifra-texto">flechas en {sesiones.length} sesiones</span></div>
            <div><span className="cifra"><Numero valor={flechas.length ? Math.round((dieces / flechas.length) * 100) : 0} key={periodo} /><small>%</small></span><span className="cifra-texto">en el 10 o la X, {fallos} fuera</span></div>
            <div><span className="cifra">{cons == null ? '—' : <>±<Numero valor={cons} decimales={1} key={periodo} /></>}</span><span className="cifra-texto">de variación entre tandas (menos es más parejo)</span></div>
          </div>
          <div className="tiro-semanas">
            <h2>Promedio por semana</h2>
            <LineaPromedio semanas={promedioSemanal(a, 16)} />
          </div>
        </div>
      </section>

      <div className="rejilla-perfil">

        <section className="tarjeta">
          <h2><Target size={20} aria-hidden="true" /> Metas</h2>
          <ul className="metas">
            {METAS[id].map((m, i) => {
              const cumplida = m.actual >= m.objetivo
              const dias = -diasDesde(m.vence)
              return (
                <li key={i}>
                  <div className="meta-cabeza">
                    <span className="chip">{m.tipo}</span>
                    <span className={`detalle ${cumplida ? 'bien' : dias < 10 ? 'aviso' : ''}`}>{cumplida ? 'Cumplida' : `vence ${relativo(m.vence)}`}</span>
                  </div>
                  <strong>{m.texto}</strong>
                  <Barra valor={m.actual} max={m.objetivo} estado={cumplida ? 'bien' : ''} retardo={200 + i * 90} />
                  <small className="ayuda">
                    {m.unidad === 'pts' ? dec(m.actual) : Math.round(m.actual)} de {m.unidad === 'pts' ? dec(m.objetivo) : m.objetivo} {m.unidad}. {m.auto ? 'Se actualiza con la app.' : 'Lo anota el entrenador.'}
                  </small>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="tarjeta">
          <h2><NotebookPen size={20} aria-hidden="true" /> Notas del entrenador</h2>
          <form className="form-nota" onSubmit={agregarNota}>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Escribe una nota sobre su técnica, actitud o salud…" rows={3} />
            <button className="boton" type="submit">Guardar nota</button>
          </form>
          <ul className="notas">
            {notas.map((n, i) => (
              <li key={i}><small>{fechaCorta(n.fecha)}</small><p>{n.texto}</p></li>
            ))}
          </ul>
        </section>

        <section className="tarjeta" id="agenda-alumno">
          <h2><CalendarDays size={20} aria-hidden="true" /> Agenda</h2>
          {formCita && (
            <form className="form-cita" onSubmit={agendar}>
              <label>Tipo
                <select name="tipo"><option>Psicología</option><option>Fisioterapia</option><option>Nutrición</option><option>Capacitación</option><option>Clase</option></select>
              </label>
              <label>Motivo<input name="titulo" placeholder="Ej. revisión de hombro" /></label>
              <label>Fecha<input name="fecha" type="date" required /></label>
              <label>Hora<input name="hora" type="time" defaultValue="17:00" /></label>
              <label>Con<input name="con" placeholder="Nombre del especialista" /></label>
              <div className="acciones">
                <button type="button" className="boton secundario" onClick={() => setFormCita(false)}>Cancelar</button>
                <button className="boton" type="submit">Agendar</button>
              </div>
            </form>
          )}
          {agenda.length ? (
            <ul className="agenda">
              {agenda.map((e) => (
                <li key={e.id}>
                  <span className={`chip ${e.tipo.toLowerCase()}`}>{e.tipo}</span>
                  <div><strong>{e.titulo}</strong><small>{fechaCorta(e.fecha)}, {e.hora}, {e.con}</small></div>
                </li>
              ))}
            </ul>
          ) : <p className="vacio">Sin citas ni eventos próximos.</p>}
          {torneos.length > 0 && (
            <>
              <h3>Torneos asignados</h3>
              <ul className="agenda">
                {torneos.map((t) => (
                  <li key={t.id}>
                    <span className={`chip ${t.tipo === 'Interno' ? 'clase' : 'torneo'}`}>{t.tipo}</span>
                    <div><strong>{t.nombre}</strong><small>{fechaCorta(t.fecha)}, {t.sede}</small></div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="tarjeta">
          <h2><Wallet size={20} aria-hidden="true" /> Pagos</h2>
          <ul className="pagos">
            {PAGOS[id].map((p, i) => (
              <li key={i}>
                <div><strong>{p.concepto}</strong><small>{fechaCorta(p.fecha)}</small></div>
                <span>{pesos(p.monto)}</span>
                <span className={`estado ${p.estado === 'Pagado' ? 'bien' : p.estado === 'Atrasado' ? 'mal' : 'aviso'}`}>{p.estado}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tarjeta ancha">
          <h2><History size={20} aria-hidden="true" /> Sesiones recientes</h2>
          <div className="tabla-envoltura">
            <table className="tabla compacta">
              <thead><tr><th>Fecha</th><th>Tipo</th><th>Distancia</th><th>Carátula</th><th className="num">Flechas</th><th className="num">Puntos</th><th className="num">Promedio</th><th>Última tanda</th></tr></thead>
              <tbody>
                {recientes.map((s) => (
                  <tr key={s.id}>
                    <td>{fechaCorta(s.fecha)}</td>
                    <td>{s.tipo}</td>
                    <td>{s.distancia} m</td>
                    <td>{s.diana}</td>
                    <td className="num">{s.flechas.length}</td>
                    <td className="num">{s.total} / {s.maximo}</td>
                    <td className="num">{dec(s.promedio)}</td>
                    <td className="tanda">{s.flechas.slice(-s.porTanda).map((f, i) => <span key={i} className={`f f${f.v === 11 ? 10 : f.v}`}>{etiqueta(f.v)}</span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
