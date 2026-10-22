import { AlarmClock, BadgeDollarSign, CalendarClock, Crosshair, Flag, TrendingDown, UserX, Users } from 'lucide-react'
import { AGENDA, ALUMNOS, CLUB, METAS, TORNEOS, alumnoPorId, cambio, diasDesde, flechasDe, promedio, promedioSemanal, sesionesEntre, ultimaSesion, HOY } from '../datos.js'
import { fechaLarga, relativo, iniciales, dec } from '../formato.js'
import { LineaDeTiro } from '../graficas.jsx'
import { Numero } from '../movimiento.jsx'

const diaSemana = new Intl.DateTimeFormat('es-MX', { weekday: 'short' })
const diaMes = new Intl.DateTimeFormat('es-MX', { day: 'numeric' })
const mes = new Intl.DateTimeFormat('es-MX', { month: 'short' })

function saludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

function Alumno({ a, detalle, tono }) {
  return (
    <a className="fila-alumno" href={`#/alumnos/${a.id}`}>
      <span className="avatar chico">{iniciales(a.nombre)}</span>
      <span className="nombre">{a.nombreCorto}</span>
      <span className={`detalle ${tono ?? ''}`}>{detalle}</span>
    </a>
  )
}

function Grupo({ titulo, Icono, tono, cuenta, ayuda, children, max = 5 }) {
  return (
    <div className={`grupo-atencion tono-${tono}`}>
      <div className="grupo-cabeza">
        <span className="grupo-icono" aria-hidden="true"><Icono size={18} strokeWidth={2} /></span>
        <h3>{titulo}</h3>
        <span className="cuenta">{cuenta}</span>
      </div>
      {ayuda && <p className="ayuda">{ayuda}</p>}
      {cuenta ? children : <p className="vacio">Nada pendiente.</p>}
      {cuenta > max && <p className="ayuda mas">y {cuenta - max} más</p>}
    </div>
  )
}

function Cifra({ Icono, color, valor, decimales, sufijo, texto, tono }) {
  return (
    <div className="cifra-tarjeta">
      <span className={`cifra-icono ${color ?? ''}`} aria-hidden="true"><Icono size={20} strokeWidth={1.9} /></span>
      <span className="cifra"><Numero valor={valor} decimales={decimales} retardo={300} />{sufijo && <small>{sufijo}</small>}</span>
      <span className={`cifra-texto ${tono ?? ''}`}>{texto}</span>
    </div>
  )
}

export default function Panel() {
  const datos = ALUMNOS.map((a) => {
    const dias = diasDesde(ultimaSesion(a)?.fecha ?? new Date(0))
    return { a, dias, c: cambio(a), prom: promedio(sesionesEntre(a, 30)) }
  })

  const sinEntrenar = datos.filter((x) => x.dias >= 7).sort((x, y) => y.dias - x.dias)
  const bajando = datos.filter((x) => x.c != null && x.c < -0.15).sort((x, y) => x.c - y.c)
  const metasPorVencer = ALUMNOS.flatMap((a) => METAS[a.id].map((m) => ({ a, m })))
    .filter(({ m }) => m.actual < m.objetivo && diasDesde(m.vence) >= -10)
    .sort((x, y) => x.m.vence - y.m.vence)
  const atrasados = ALUMNOS.filter((a) => a.pago === 'Atrasado')
  const pendientes = ALUMNOS.filter((a) => a.pago === 'Pendiente')

  const activos = ALUMNOS.filter((a) => sesionesEntre(a, 7).length > 0).length
  const flechasSemana = ALUMNOS.reduce((s, a) => s + flechasDe(sesionesEntre(a, 7)), 0)
  const flechasAntes = ALUMNOS.reduce((s, a) => s + flechasDe(sesionesEntre(a, 14, 7)), 0)
  const cambioFlechas = Math.round(((flechasSemana - flechasAntes) / (flechasAntes || 1)) * 100)
  const promClub = promedio(ALUMNOS.flatMap((a) => sesionesEntre(a, 30)))

  const puntos = datos.map(({ a, dias, c, prom }) => ({
    id: a.id,
    nombre: a.nombre,
    grupo: a.grupo,
    iniciales: iniciales(a.nombre),
    prom,
    semanas: promedioSemanal(a, 12).map((s) => s.promedio),
    estado: dias >= 7 ? 'ausente' : c != null && c < -0.15 ? 'bajando' : '',
    nota: dias >= 7 ? `Lleva ${dias} días sin tirar` : c == null ? 'Sin datos para comparar' : c < 0 ? `Bajó ${dec(-c)} contra el mes anterior` : `Subió ${dec(c)} contra el mes anterior`,
  }))

  // Lo que viene como línea de tiempo: citas, clases y torneos de las próximas tres semanas.
  const eventos = [
    ...AGENDA.map((e) => ({ ...e, quien: e.alumnos.length === 1 ? alumnoPorId(e.alumnos[0]).nombreCorto : `${e.alumnos.length} alumnos` })),
    ...TORNEOS.map((t) => ({ id: t.id, tipo: 'Torneo', titulo: t.nombre, fecha: t.fecha, hora: t.sede, quien: `${t.alumnos.length} alumnos` })),
  ]
    .filter((e) => diasDesde(e.fecha) <= 0 && diasDesde(e.fecha) > -21)
    .sort((x, y) => x.fecha - y.fecha)

  return (
    <div className="panel">
      <section className="portada" aria-labelledby="titulo-linea">
        <svg className="portada-anillos" viewBox="0 0 400 400" aria-hidden="true">
          {[190, 160, 130, 100, 70, 40].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        </svg>
        <header className="saludo">
          <div>
            <p className="fecha-hoy">{fechaLarga(HOY)}</p>
            <h1>{saludo()}, {CLUB.entrenador.split(' ')[1]}</h1>
          </div>
          <a className="boton oro" href="#/entrenamientos"><Crosshair size={18} aria-hidden="true" /> Mandar la clase de hoy</a>
        </header>

        <div className="bloque-linea-cabeza">
          <div>
            <h2 id="titulo-linea">La línea de tiro</h2>
            <p className="ayuda">Cada alumno en su promedio por flecha de los últimos 30 días. Pasa sobre uno para ver cómo va.</p>
          </div>
          <ul className="leyenda">
            <li><span className="muestra" /> Al día</li>
            <li><span className="muestra bajando" /> Va bajando</li>
            <li><span className="muestra ausente" /> Una semana sin tirar</li>
          </ul>
        </div>
        <LineaDeTiro puntos={puntos} />
      </section>

      <section className="cifras" aria-label="Resumen de la semana">
        <Cifra Icono={Users} valor={activos} sufijo={`/${ALUMNOS.length}`} texto="entrenaron esta semana" />
        <Cifra
          Icono={Flag}
          color="azul"
          valor={flechasSemana}
          texto={`flechas, ${cambioFlechas >= 0 ? `${cambioFlechas} % más` : `${-cambioFlechas} % menos`} que la semana pasada`}
          tono={cambioFlechas >= 0 ? 'bien' : 'mal'}
        />
        <Cifra Icono={Crosshair} color="oro" valor={promClub} decimales={2} texto="promedio del club en 30 días" />
        <Cifra Icono={BadgeDollarSign} color="rojo" valor={atrasados.length} texto={`pagos atrasados y ${pendientes.length} pendientes`} tono={atrasados.length ? 'mal' : ''} />
      </section>

      <div className="panel-columnas">
        <section className="atencion" aria-labelledby="titulo-atencion">
          <h2 id="titulo-atencion" className="titulo-seccion">Atención hoy</h2>
          <div className="atencion-grupos">
            <Grupo titulo="Sin entrenar" Icono={UserX} tono="aviso" cuenta={sinEntrenar.length} ayuda="Una semana o más sin registrar tiros en la app.">
              {sinEntrenar.slice(0, 5).map(({ a, dias }) => <Alumno key={a.id} a={a} detalle={`${dias} días`} tono={dias > 14 ? 'mal' : 'aviso'} />)}
            </Grupo>
            <Grupo titulo="Van bajando" Icono={TrendingDown} tono="mal" cuenta={bajando.length} ayuda="Últimos 30 días contra los 30 anteriores.">
              {bajando.slice(0, 5).map(({ a, c }) => <Alumno key={a.id} a={a} detalle={`−${dec(Math.abs(c))}`} tono="mal" />)}
            </Grupo>
            <Grupo titulo="Pagos atrasados" Icono={BadgeDollarSign} tono="mal" cuenta={atrasados.length}>
              {atrasados.slice(0, 5).map((a) => <Alumno key={a.id} a={a} detalle={a.menor ? 'avisar al tutor' : 'mandar recordatorio'} tono="mal" />)}
            </Grupo>
            <Grupo titulo="Metas por vencer" Icono={AlarmClock} tono="azul" cuenta={metasPorVencer.length} ayuda="Vencen en 10 días y aún no se cumplen.">
              {metasPorVencer.slice(0, 5).map(({ a, m }, i) => <Alumno key={i} a={a} detalle={`${m.tipo}, ${relativo(m.vence)}`} />)}
            </Grupo>
          </div>
        </section>

        <section className="semana" aria-labelledby="titulo-semana">
          <h2 id="titulo-semana" className="titulo-seccion"><CalendarClock size={22} aria-hidden="true" /> Lo que viene</h2>
          <ol className="tiempo">
            {eventos.map((e) => (
              <li key={e.id} className={`evento ${e.tipo.toLowerCase()}`}>
                <time className="dia" dateTime={e.fecha.toISOString().slice(0, 10)}>
                  <span>{diaSemana.format(e.fecha).replace('.', '')}</span>
                  <b>{diaMes.format(e.fecha)}</b>
                  <span>{mes.format(e.fecha).replace('.', '')}</span>
                </time>
                <div className="evento-cuerpo">
                  <span className="tipo">{e.tipo}</span>
                  <strong>{e.titulo}</strong>
                  <small>{e.hora}, {e.quien}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
