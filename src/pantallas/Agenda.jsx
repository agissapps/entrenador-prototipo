import { useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Users, X } from 'lucide-react'
import { AGENDA, ALUMNOS, CLASES, GRUPOS, HOY, TORNEOS, alumnoPorId, plantillaPorId } from '../datos.js'
import { Avatares, useAviso } from '../comunes.jsx'
import { CampoFecha, CampoHora } from '../selectores.jsx'
import './agenda.css'

const TIPOS = ['Clase', 'Psicología', 'Fisioterapia', 'Nutrición', 'Capacitación', 'Junta', 'Torneo']
const SEMANA = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']
const nombreMes = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })
const diaLargo = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const mismoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const claseTipo = (t) => `tipo-${t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`

/** Todo lo que hay en el calendario: citas y eventos, clases mandadas y torneos. */
function eventosIniciales() {
  return [
    ...AGENDA.map((e) => ({ ...e })),
    ...CLASES.map((c) => ({ id: c.id, tipo: 'Clase', titulo: plantillaPorId(c.plantilla).nombre, fecha: c.fecha, hora: c.hora, con: c.grupo, alumnos: c.alumnos })),
    ...TORNEOS.map((t) => ({ id: t.id, tipo: 'Torneo', titulo: t.nombre, fecha: t.fecha, hora: 'Todo el día', con: t.sede, alumnos: t.alumnos })),
  ]
}

function NuevoEvento({ dia, cerrar, crear }) {
  const [para, setPara] = useState('grupos')
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.target)
    const alumnos = para === 'grupos' ? ALUMNOS.filter((a) => f.getAll('grupos').includes(a.grupo)).map((a) => a.id) : [f.get('alumno')]
    crear({
      id: `e${Date.now()}`,
      tipo: f.get('tipo'),
      titulo: f.get('titulo') || f.get('tipo'),
      fecha: new Date(`${f.get('fecha')}T00:00`),
      hora: f.get('hora'),
      con: f.get('con') || 'Club',
      alumnos,
    })
  }
  const iso = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`
  return (
    <form className="tarjeta nuevo-evento" onSubmit={enviar}>
      <div className="editor-cabeza">
        <h2><CalendarPlus size={20} aria-hidden="true" /> Nuevo evento</h2>
        <button type="button" className="icono-chico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button>
      </div>
      <div className="nuevo-evento-campos">
        <label className="campo">Tipo<select name="tipo">{TIPOS.filter((t) => t !== 'Torneo' && t !== 'Clase').map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="campo ancho">Motivo<input name="titulo" placeholder="Ej. revisión de hombro, clínica de afinación" /></label>
        <label className="campo">Día<CampoFecha name="fecha" defaultValue={iso} etiqueta="Día del evento" /></label>
        <label className="campo">Hora<CampoHora name="hora" defaultValue="17:00" etiqueta="Hora del evento" /></label>
        <label className="campo">Con quién<input name="con" placeholder="Especialista o lugar" /></label>
        <label className="campo">Para
          <select value={para} onChange={(e) => setPara(e.target.value)}><option value="grupos">Uno o varios grupos</option><option value="alumno">Un alumno</option></select>
        </label>
      </div>
      {para === 'grupos' ? (
        <div className="fichas-opcion">
          {GRUPOS.map((g) => <label key={g} className="opcion"><input type="checkbox" name="grupos" value={g} /> {g}</label>)}
        </div>
      ) : (
        <label className="campo">Alumno<select name="alumno">{ALUMNOS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
      )}
      <div className="acciones"><button className="boton oro" type="submit"><Plus size={17} aria-hidden="true" /> Agendar y avisar</button></div>
    </form>
  )
}

export default function Agenda() {
  const [eventos, setEventos] = useState(eventosIniciales)
  const [mes, setMes] = useState(() => new Date(HOY.getFullYear(), HOY.getMonth(), 1))
  const [dia, setDia] = useState(HOY)
  const [ocultos, setOcultos] = useState(new Set())
  const [nuevo, setNuevo] = useState(false)
  const [aviso, avisar] = useAviso()

  const visibles = eventos.filter((e) => !ocultos.has(e.tipo))
  // La cuadrícula empieza el lunes de la semana del día 1 y llena 6 semanas.
  const inicio = new Date(mes)
  inicio.setDate(1 - ((mes.getDay() + 6) % 7))
  const dias = Array.from({ length: 42 }, (_, i) => new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i))
  const delDia = visibles.filter((e) => mismoDia(e.fecha, dia)).sort((a, b) => a.hora.localeCompare(b.hora))

  const cambiarMes = (d) => setMes(new Date(mes.getFullYear(), mes.getMonth() + d, 1))
  const alternar = (t) => setOcultos((o) => {
    const n = new Set(o)
    if (n.has(t)) n.delete(t)
    else n.add(t)
    return n
  })

  return (
    <div className="agenda-pantalla">
      <header className="encabezado">
        <div>
          <h1>Agenda</h1>
          <p className="sobretitulo">Clases, citas con especialistas, capacitaciones y torneos en un solo calendario.</p>
        </div>
        <button className="boton oro" onClick={() => setNuevo(true)}><Plus size={17} aria-hidden="true" /> Nuevo evento</button>
      </header>

      {nuevo && (
        <NuevoEvento
          dia={dia}
          cerrar={() => setNuevo(false)}
          crear={(e) => {
            setEventos((es) => [...es, e])
            setDia(e.fecha)
            setMes(new Date(e.fecha.getFullYear(), e.fecha.getMonth(), 1))
            setNuevo(false)
            avisar(`Agendado. Les llega el aviso a ${e.alumnos.length} ${e.alumnos.length === 1 ? 'alumno' : 'alumnos'}.`)
          }}
        />
      )}

      <div className="tipos-filtro" role="group" aria-label="Mostrar tipos">
        {TIPOS.map((t) => (
          <button key={t} className={`opcion ${claseTipo(t)} ${ocultos.has(t) ? 'oculto' : ''}`} aria-pressed={!ocultos.has(t)} onClick={() => alternar(t)}>
            <span className="punto-tipo" /> {t}
          </button>
        ))}
      </div>

      <div className="agenda-columnas">
        <section className="tarjeta calendario" aria-label="Calendario del mes">
          <div className="calendario-cabeza">
            <button className="icono-chico" onClick={() => cambiarMes(-1)} aria-label="Mes anterior"><ChevronLeft size={20} /></button>
            <h2>{nombreMes.format(mes)}</h2>
            <button className="icono-chico" onClick={() => cambiarMes(1)} aria-label="Mes siguiente"><ChevronRight size={20} /></button>
            <button className="boton secundario chico" onClick={() => { setMes(new Date(HOY.getFullYear(), HOY.getMonth(), 1)); setDia(HOY) }}>Hoy</button>
          </div>
          <div className="calendario-rejilla">
            {SEMANA.map((d) => <span key={d} className="calendario-dia-semana">{d}</span>)}
            {dias.map((d) => {
              const evs = visibles.filter((e) => mismoDia(e.fecha, d))
              return (
                <button
                  key={d.toISOString()}
                  className={`calendario-dia ${d.getMonth() !== mes.getMonth() ? 'fuera' : ''} ${mismoDia(d, HOY) ? 'hoy' : ''} ${mismoDia(d, dia) ? 'elegido' : ''}`}
                  onClick={() => setDia(d)}
                  aria-label={`${diaLargo.format(d)}, ${evs.length} eventos`}
                >
                  <span className="numero-dia">{d.getDate()}</span>
                  <span className="eventos-dia">
                    {evs.slice(0, 3).map((e) => <span key={e.id} className={`pastilla ${claseTipo(e.tipo)}`}>{e.titulo}</span>)}
                    {evs.length > 3 && <span className="mas-eventos">+{evs.length - 3}</span>}
                  </span>
                  <span className="puntos-dia">{evs.slice(0, 4).map((e) => <span key={e.id} className={`punto-tipo ${claseTipo(e.tipo)}`} />)}</span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="tarjeta dia-detalle" key={dia.toISOString()}>
          <h2>{mismoDia(dia, HOY) ? 'Hoy, ' : ''}{diaLargo.format(dia)}</h2>
          {delDia.length ? (
            <ul className="eventos-lista">
              {delDia.map((e) => (
                <li key={e.id} className={claseTipo(e.tipo)}>
                  <span className="tipo-evento"><span className="punto-tipo" /> {e.tipo}</span>
                  <strong>{e.titulo}</strong>
                  <small><Clock size={13} aria-hidden="true" /> {e.hora} <MapPin size={13} aria-hidden="true" /> {e.con}</small>
                  {e.alumnos.length > 0 && (
                    <span className="evento-personas">
                      <Users size={14} aria-hidden="true" />
                      <Avatares nombres={e.alumnos.map((id) => alumnoPorId(id).nombre)} max={6} />
                      <small>{e.alumnos.length === 1 ? alumnoPorId(e.alumnos[0]).nombreCorto : `${e.alumnos.length} alumnos`}</small>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="dia-vacio">
              <p className="vacio">No hay nada este día.</p>
              <button className="boton secundario" onClick={() => setNuevo(true)}><Plus size={16} aria-hidden="true" /> Agendar algo</button>
            </div>
          )}
        </aside>
      </div>
      {aviso}
    </div>
  )
}
