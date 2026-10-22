import { useState } from 'react'
import { AlertTriangle, BellRing, CircleDollarSign, Clock, Plus, Receipt, X } from 'lucide-react'
import { ALUMNOS, HOY, INGRESOS, MESES, PAGOS } from '../datos.js'
import { Pestanas, useAviso } from '../comunes.jsx'
import { fechaCorta, iniciales, pesos } from '../formato.js'
import { Numero } from '../movimiento.jsx'
import './pagos.css'

const CONCEPTOS = ['Mensualidad', 'Inscripción a torneo', 'Uniforme o equipo', 'Otro']
const METODOS = ['Efectivo', 'Transferencia', 'Tarjeta']

/** Ingresos de los últimos 6 meses: lo cobrado contra lo que se esperaba. */
function GraficaIngresos({ meses }) {
  const max = Math.max(...meses.map((m) => m.esperado))
  return (
    <div className="grafica-ingresos" role="img" aria-label="Ingresos de los últimos seis meses">
      {meses.map((m, i) => (
        <div key={m.mes} className={`mes-barra ${i === meses.length - 1 ? 'actual' : ''}`}>
          <span className="mes-monto">{pesos(Math.round(m.cobrado / 1000))} mil</span>
          <span className="barra-fondo" style={{ height: `${(m.esperado / max) * 100}%` }}>
            <span className="barra-cobrado" style={{ height: `${(m.cobrado / m.esperado) * 100}%`, animationDelay: `${i * 80}ms` }} />
          </span>
          <span className="mes-nombre">{m.mes.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  )
}

function RegistrarPago({ alumnoInicial, cerrar, registrar }) {
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.target)
    registrar(f.get('alumno'), {
      concepto: f.get('concepto') === 'Mensualidad' ? `Mensualidad de ${MESES[HOY.getMonth()]}` : f.get('detalle') || f.get('concepto'),
      monto: +f.get('monto'),
      metodo: f.get('metodo'),
      fecha: HOY,
      estado: 'Pagado',
      mensualidad: f.get('concepto') === 'Mensualidad',
    })
  }
  return (
    <form className="tarjeta registrar-pago" onSubmit={enviar}>
      <div className="editor-cabeza">
        <h2><Receipt size={20} aria-hidden="true" /> Registrar pago</h2>
        <button type="button" className="icono-chico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button>
      </div>
      <div className="registrar-campos">
        <label className="campo ancho">Alumno<select name="alumno" defaultValue={alumnoInicial ?? ALUMNOS[0].id}>{ALUMNOS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
        <label className="campo">Concepto<select name="concepto">{CONCEPTOS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="campo">Monto<input name="monto" type="number" min="0" defaultValue={850} required /></label>
        <label className="campo">Forma de pago<select name="metodo">{METODOS.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="campo ancho">Detalle (opcional)<input name="detalle" placeholder="Ej. inscripción Copa Regional" /></label>
      </div>
      <p className="ayuda">Por ahora solo se registra; cobrar con tarjeta desde la página queda para después.</p>
      <div className="acciones"><button className="boton oro" type="submit"><Plus size={17} aria-hidden="true" /> Registrar</button></div>
    </form>
  )
}

export default function Pagos() {
  const [pagos, setPagos] = useState(PAGOS)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [registrando, setRegistrando] = useState(null)
  const [aviso, avisar] = useAviso()

  // Estado de cada alumno: atrasado si debe un mes anterior, pendiente si debe el de este mes.
  const filas = ALUMNOS.map((a) => {
    const lista = pagos[a.id]
    const debe = lista.filter((p) => p.estado !== 'Pagado')
    const estado = debe.some((p) => p.estado === 'Atrasado') ? 'Atrasado' : debe.length ? 'Pendiente' : 'Al corriente'
    const ultimo = lista.filter((p) => p.estado === 'Pagado').sort((x, y) => y.fecha - x.fecha)[0]
    return { a, estado, debe: debe.reduce((s, p) => s + p.monto, 0), ultimo }
  })
  const delMes = ALUMNOS.reduce((s, a) => s + pagos[a.id].filter((p) => p.estado === 'Pagado' && p.fecha.getMonth() === HOY.getMonth() && p.fecha.getFullYear() === HOY.getFullYear()).reduce((t, p) => t + p.monto, 0), 0)
  const pendiente = filas.filter((f) => f.estado === 'Pendiente')
  const atrasado = filas.filter((f) => f.estado === 'Atrasado')
  const meses = INGRESOS.map((m, i) => (i === INGRESOS.length - 1 ? { ...m, cobrado: Math.max(m.cobrado, delMes) } : m))

  const texto = busqueda.trim().toLowerCase()
  const visibles = filas
    .filter((f) => (filtro === 'todos' || f.estado === filtro) && (!texto || f.a.nombre.toLowerCase().includes(texto)))
    .sort((x, y) => ({ Atrasado: 0, Pendiente: 1, 'Al corriente': 2 })[x.estado] - ({ Atrasado: 0, Pendiente: 1, 'Al corriente': 2 })[y.estado] || x.a.nombre.localeCompare(y.a.nombre))

  function registrar(id, pago) {
    setPagos((ps) => {
      let lista = ps[id]
      if (pago.mensualidad) {
        // Una mensualidad salda primero lo atrasado y luego lo de este mes.
        const i = lista.findIndex((p) => p.estado === 'Atrasado') >= 0 ? lista.findIndex((p) => p.estado === 'Atrasado') : lista.findIndex((p) => p.estado === 'Pendiente')
        if (i >= 0) lista = lista.map((p, j) => (j === i ? { ...p, estado: 'Pagado', fecha: HOY, metodo: pago.metodo } : p))
        else lista = [pago, ...lista]
      } else lista = [pago, ...lista]
      return { ...ps, [id]: lista }
    })
    setRegistrando(null)
    avisar(`Pago de ${pesos(pago.monto)} registrado. Se le manda el recibo a la app.`)
  }

  function recordar(filasRecordar) {
    const tutores = filasRecordar.filter((f) => f.a.menor).length
    avisar(`Recordatorio mandado a ${filasRecordar.length} ${filasRecordar.length === 1 ? 'persona' : 'personas'}${tutores ? ` (${tutores} a su tutor)` : ''}.`)
  }

  return (
    <div className="pagos-pantalla">
      <header className="encabezado">
        <div>
          <h1>Pagos</h1>
          <p className="sobretitulo">Mensualidades, inscripciones y adeudos de {MESES[HOY.getMonth()]}.</p>
        </div>
        <button className="boton oro" onClick={() => setRegistrando('')}><Plus size={17} aria-hidden="true" /> Registrar pago</button>
      </header>

      {registrando !== null && <RegistrarPago alumnoInicial={registrando || undefined} cerrar={() => setRegistrando(null)} registrar={registrar} />}

      <div className="pagos-arriba">
        <section className="cifras pagos-cifras" aria-label="Resumen del mes">
          <div className="cifra-tarjeta">
            <span className="cifra-icono" aria-hidden="true"><CircleDollarSign size={20} /></span>
            <span className="cifra">$<Numero valor={delMes} /></span>
            <span className="cifra-texto">cobrado este mes</span>
          </div>
          <div className="cifra-tarjeta">
            <span className="cifra-icono oro" aria-hidden="true"><Clock size={20} /></span>
            <span className="cifra">$<Numero valor={pendiente.reduce((s, f) => s + f.debe, 0)} /></span>
            <span className="cifra-texto">pendiente de {pendiente.length} alumnos</span>
          </div>
          <div className="cifra-tarjeta">
            <span className="cifra-icono rojo" aria-hidden="true"><AlertTriangle size={20} /></span>
            <span className="cifra">$<Numero valor={atrasado.reduce((s, f) => s + f.debe, 0)} /></span>
            <span className="cifra-texto">atrasado de {atrasado.length} alumnos</span>
          </div>
        </section>
        <section className="tarjeta ingresos">
          <h2>Ingresos</h2>
          <p className="ayuda">Lo cobrado (color) contra lo que se esperaba (fondo) en los últimos seis meses.</p>
          <GraficaIngresos meses={meses} />
        </section>
      </div>

      <div className="pagos-filtros">
        <Pestanas opciones={[['todos', 'Todos'], ['Atrasado', `Atrasados (${atrasado.length})`], ['Pendiente', `Pendientes (${pendiente.length})`], ['Al corriente', 'Al corriente']]} valor={filtro} cambiar={setFiltro} />
        <input type="search" placeholder="Buscar alumno" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar alumno" />
        {(atrasado.length > 0 || pendiente.length > 0) && (
          <button className="boton secundario" onClick={() => recordar([...atrasado, ...pendiente])}><BellRing size={16} aria-hidden="true" /> Recordar a todos los que deben</button>
        )}
      </div>

      <div className="tabla-envoltura">
        <table className="tabla compacta tabla-pagos">
          <thead>
            <tr><th>Alumno</th><th>Avisar a</th><th className="num">Mensualidad</th><th>Último pago</th><th className="num">Debe</th><th>Estado</th><th /></tr>
          </thead>
          <tbody>
            {visibles.map(({ a, estado, debe, ultimo }) => (
              <tr key={a.id}>
                <td><a className="celda-alumno" href={`#/alumnos/${a.id}`}><span className="avatar chico">{iniciales(a.nombre)}</span><span><strong>{a.nombre}</strong><small>{a.grupo}</small></span></a></td>
                <td>{a.tutor ? <span>{a.tutor.split(': ')[1]}<small className="bloque">{a.tutor.split(':')[0]}</small></span> : <span>El alumno<small className="bloque">{a.telefono}</small></span>}</td>
                <td className="num">{pesos(a.mensualidad)}</td>
                <td>{ultimo ? <span>{fechaCorta(ultimo.fecha)}<small className="bloque">{ultimo.concepto}</small></span> : '—'}</td>
                <td className="num"><b className={debe ? 'mal' : ''}>{debe ? pesos(debe) : '—'}</b></td>
                <td><span className={`estado ${estado === 'Al corriente' ? 'bien' : estado === 'Atrasado' ? 'mal' : 'aviso'}`}>{estado}</span></td>
                <td className="acciones-fila">
                  {estado !== 'Al corriente' && <button className="icono-chico" onClick={() => recordar([{ a }])} aria-label={`Recordar a ${a.nombre}`} title="Mandar recordatorio"><BellRing size={16} /></button>}
                  <button className="boton secundario chico" onClick={() => setRegistrando(a.id)}><Plus size={14} aria-hidden="true" /> Pago</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibles.length && <p className="vacio" style={{ padding: 16 }}>Nadie coincide con el filtro.</p>}
      </div>
      {aviso}
    </div>
  )
}
