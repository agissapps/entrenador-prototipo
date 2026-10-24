import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Apple, ArrowRight, CalendarDays, Camera, Check, ChevronDown, Crosshair, Dumbbell, Instagram, LifeBuoy, Menu, Moon, Play, Smartphone, Sun, Target, Trophy, Users, Wallet, Wrench, X,
} from 'lucide-react'
import { AGENDA, ALUMNOS, INGRESOS, METAS, PLANTILLAS, TORNEOS, alumnoPorId, constancia, diasDesde, promedio, sesionesEntre } from '../datos.js'
import { Barra, Diana, Sello } from '../graficas.jsx'
import { CORREO_SOPORTE } from '../comunes.jsx'
import { entrarDemo } from '../sesion.js'
import { dec, fechaCorta, iniciales, pesos } from '../formato.js'
import { aISO } from '../selectores.jsx'
import { sinMovimiento } from '../movimiento.jsx'
import { VistaApp } from './Entrenamientos.jsx'
import Panel from './Panel.jsx'
import './landing.css'

export function Logo({ tam = 34 }) {
  return (
    <svg viewBox="0 0 32 32" width={tam} height={tam} aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#FAFAFA" /><circle cx="16" cy="16" r="12" fill="#1E1E1E" /><circle cx="16" cy="16" r="9" fill="#2462C6" />
      <circle cx="16" cy="16" r="6" fill="#D7372F" /><circle cx="16" cy="16" r="3" fill="#F2B705" />
    </svg>
  )
}

const BASE = import.meta.env.BASE_URL

// La foto del campo se usa desde la hoja de estilos (con var()), y ahí una ruta relativa se
// resolvería contra la carpeta assets/ y no cargaría; por eso va con la dirección completa.
const FOTO_CAMPO = { '--foto-cierre': `url("${new URL(`${BASE}fondos/campo-atardecer.jpg`, document.baseURI).href}")` }

const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: sinMovimiento() ? 'auto' : 'smooth', block: 'start' })

const NAVEGACION = [
  ['inicio', 'Inicio'],
  ['funciones', 'Funcionalidades'],
  ['app', 'La app'],
  ['planes', 'Planes y precios'],
  ['preguntas', 'Preguntas frecuentes'],
]

/** El alumno de prueba que sale en las ilustraciones de la portada. */
const MUESTRA = alumnoPorId('4')

const PROBLEMAS = [
  {
    problema: 'No sé cómo van progresando todos mis alumnos.',
    solucion: 'Ves el promedio, la diana y la evolución semana a semana de cada arquero, sin pedirle su libreta.',
    ruta: ['alumnos'],
    modulo: 'Alumnos',
  },
  {
    problema: 'Pierdo tiempo organizando entrenamientos.',
    solucion: 'Armas la clase por bloques, partes de una plantilla y se la mandas a varios alumnos a la vez.',
    ruta: ['entrenamientos'],
    modulo: 'Entrenamientos',
  },
  {
    problema: 'No tengo control de los pagos.',
    solucion: 'Sabes quién pagó, quién está pendiente y quién va atrasado, y le mandas un recordatorio en un clic.',
    ruta: ['pagos'],
    modulo: 'Pagos',
  },
  {
    problema: 'Me cuesta organizar torneos.',
    solucion: 'Armas el equipo según el promedio, sigues las inscripciones y los puntos llegan solos desde la app.',
    ruta: ['torneos'],
    modulo: 'Torneos',
  },
]

const MODULOS = [
  {
    id: 'alumnos',
    nombre: 'Alumnos',
    Icono: Users,
    titulo: 'Conoce a cada arquero sin pedirle su libreta',
    texto: 'Lo que el alumno registra en la app llega a su ficha: dónde caen sus flechas, qué tan parejo tira y cómo va semana a semana.',
    puntos: ['Lista con buscador y filtros por estilo de arco y grupo', 'Diana con sus últimas flechas', 'Promedio, porcentaje de dieces y constancia', 'Gráfica de evolución semanal', 'Metas, notas y sesiones recientes'],
  },
  {
    id: 'entrenamientos',
    nombre: 'Entrenamientos',
    Icono: Dumbbell,
    titulo: 'Arma la clase una vez y llega a todos',
    texto: 'Calentamiento, técnica, tandas y físico, cada bloque con su tiempo. El alumno la ve en su teléfono y la marca como hecha.',
    puntos: ['Clases por bloques', 'Plantillas para no empezar de cero', 'Vista previa de cómo se ve en la app', 'Para uno o varios alumnos', 'Ves quién la hizo'],
  },
  {
    id: 'metas',
    nombre: 'Metas',
    Icono: Target,
    titulo: 'Metas claras que se miden solas',
    texto: 'Las metas de puntos y de flechas avanzan con lo que el alumno tira. Las de fuerza o libraje las anotas tú cuando hace la prueba.',
    puntos: ['Metas de puntos, flechas, distancia, fuerza y libraje', 'Avance automático o anotado a mano', 'En camino, cumplida o en riesgo'],
  },
  {
    id: 'torneos',
    nombre: 'Torneos',
    Icono: Trophy,
    titulo: 'Del equipo a los resultados, sin hojas sueltas',
    texto: 'Elige a quién llevar con su promedio a la vista, manda las invitaciones y sigue quién ya se inscribió y quién ya pagó.',
    puntos: ['Torneos internos y externos', 'Equipo según el promedio de cada arquero', 'Invitaciones e inscripciones', 'Resultados que llegan desde la app'],
  },
  {
    id: 'agenda',
    nombre: 'Agenda',
    Icono: CalendarDays,
    titulo: 'Todo el club en un calendario',
    texto: 'Las clases y todo lo que rodea al entrenamiento, en el mismo lugar y ligado a cada alumno.',
    puntos: ['Calendario del mes', 'Clases y juntas', 'Psicología deportiva, fisioterapia y nutrición', 'Capacitaciones'],
  },
  {
    id: 'pagos',
    nombre: 'Pagos',
    Icono: Wallet,
    titulo: 'Las cuentas del club, al día',
    texto: 'Mensualidades e inscripciones con su estado, los recordatorios a un clic y los ingresos de los últimos meses.',
    puntos: ['Estado de pago de cada alumno', 'Pagados, pendientes y atrasados', 'Registro de pagos', 'Recordatorios', 'Ingresos de los últimos seis meses'],
  },
]

// Por ahora las dos fichas y sus QR (public/qr/) llevan al Instagram; al publicar la app se cambian
// por los enlaces de cada tienda y se regeneran los QR.
const INSTAGRAM = 'https://www.instagram.com/utility.archery/'
const TIENDAS = [
  { id: 'android', sistema: 'Android', tienda: 'Google Play', arriba: 'Disponible en', Icono: Play, enlace: INSTAGRAM },
  { id: 'ios', sistema: 'iPhone', tienda: 'App Store', arriba: 'Descárgala en', Icono: Apple, enlace: INSTAGRAM },
]

// Pantallas reales de la app, recortadas de la ficha 0.1.0 de la tienda (publicacion/play-0.1.0).
const CAPTURAS = [
  { archivo: 'diana', titulo: 'Toca la diana', texto: 'Cada flecha donde cayó, con lupa para afinar.', alt: 'Registrar una tanda tocando en la diana donde cayó cada flecha' },
  { archivo: 'postura', titulo: 'Revisa la postura', texto: 'La cámara sigue sus articulaciones mientras tira.', alt: 'La cámara marca el esqueleto del arquero y mide la estabilidad del tiro' },
  { archivo: 'perfil', titulo: 'Su perfil de arquero', texto: 'Estilos, sesiones, flechas y equipo de un vistazo.', alt: 'El perfil del arquero con sus estilos, sesiones, flechas y equipo' },
  { archivo: 'flechas', titulo: 'Arco y flechas', texto: 'Puestas a punto y juegos de flechas guardados.', alt: 'Editar un juego de flechas con su spine, largo y peso de punta' },
]

// Precios en pesos mexicanos, por club y por mes. Pagando el año se regalan 2 meses.
// El plan Gratis tiene cupo: por ahora solo 5 clubes (se irán abriendo más lugares).
const LUGARES_GRATIS = 5
const PLANES = [
  {
    nombre: 'Gratis',
    para: 'Para empezar con un grupo pequeño',
    mensual: 0,
    alumnos: 'Hasta 5',
    entrenadores: '1',
    incluye: ['Panel, alumnos, entrenamientos y metas', 'Agenda del club', '1 torneo activo a la vez'],
    boton: 'Crear mi club gratis',
    cupo: true,
  },
  {
    nombre: 'Básico',
    para: 'Para entrenadores independientes',
    mensual: 399,
    alumnos: 'Hasta 40',
    entrenadores: 'Hasta 2',
    incluye: ['Todo lo del plan Gratis', 'Torneos sin límite', 'Pagos y recordatorios'],
    boton: 'Elegir Básico',
  },
  {
    nombre: 'Club',
    para: 'Para clubes pequeños y medianos',
    mensual: 849,
    alumnos: 'Hasta 100',
    entrenadores: 'Hasta 5',
    incluye: ['Todo lo del plan Básico', 'Ingresos del club', 'Varios grupos y entrenadores'],
    boton: 'Elegir Club',
    recomendado: true,
  },
  {
    nombre: 'Profesional',
    para: 'Para academias y clubes grandes',
    mensual: 1449,
    alumnos: 'Hasta 250',
    entrenadores: 'Hasta 10',
    incluye: ['Todo lo del plan Club', 'Más alumnos y entrenadores', 'Para varios grupos de competencia'],
    boton: 'Elegir Profesional',
  },
]

const PREGUNTAS = [
  ['¿El sistema funciona desde el celular?', 'Sí. La página se acomoda al celular, a la tableta y a la computadora, así que puedes revisar el panel desde la línea de tiro.'],
  ['¿Mis alumnos necesitan una aplicación?', 'Sí: la app Diario de Tiro, que es gratis. Ahí registran sus flechas, su equipo y su postura, y eso es lo que llega a tu panel. Está para Android y para iPhone.'],
  ['¿Puedo importar mis alumnos desde Excel?', 'Todavía no. Por ahora invitas a cada alumno desde la sección Alumnos. Importar una lista está entre lo que queremos agregar.'],
  ['¿Puedo administrar varios grupos?', 'Sí. Cada alumno va en un grupo y puedes filtrar por grupo o por estilo de arco en las listas, las metas y los pagos.'],
  ['¿Cómo se registran los pagos?', 'Los anotas tú cuando el alumno paga, y el panel te dice quién está pendiente o atrasado para mandarle un recordatorio. Cobrar con tarjeta desde la página queda para más adelante.'],
  ['¿Puedo cancelar mi suscripción?', 'Las condiciones para cancelar y qué pasa con los datos de tu club se publicarán con los términos del servicio, antes de empezar a cobrar.'],
  ['¿Qué sucede con mis datos?', 'Esta página es un prototipo: no guarda ni manda nada, y todos los datos son de un club inventado. Las reglas de privacidad del servicio se publicarán antes de abrirlo.'],
  ['¿Puedo probar el sistema antes de contratarlo?', 'Sí. Con el botón «Probar el sistema» entras al panel con un club de prueba de 40 arqueros, sin registrarte.'],
]

/** Muestra [children], que miden [ancho] × [alto], reducidos al ancho de su caja. */
function Miniatura({ ancho, alto, children }) {
  const caja = useRef(null)
  const [escala, setEscala] = useState(0.5)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setEscala(e.contentRect.width / ancho))
    ro.observe(caja.current)
    return () => ro.disconnect()
  }, [ancho])
  return (
    <div className="miniatura" ref={caja} style={{ height: alto * escala }}>
      <div className="miniatura-lienzo" style={{ width: ancho, height: alto, transform: `scale(${escala})` }} inert>{children}</div>
    </div>
  )
}

function useConsulta(consulta) {
  const [angosto, setAngosto] = useState(() => window.matchMedia(consulta).matches)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const cambio = () => setAngosto(m.matches)
    m.addEventListener('change', cambio)
    return () => m.removeEventListener('change', cambio)
  }, [consulta])
  return angosto
}

/**
 * Lo que la barra de arriba necesita saber del desplazamiento: si ya se dejó atrás el héroe (para
 * pasar de transparente a sólida), en qué sección está la persona y cuánto lleva recorrido.
 */
function useBarra(avance) {
  const [solida, setSolida] = useState(false)
  const [activa, setActiva] = useState('inicio')
  useEffect(() => {
    // Se mide en cada evento de desplazamiento: son pocas lecturas, y React solo vuelve a dibujar
    // cuando cambia la sección activa o el estado de la barra.
    const medir = () => {
      const y = window.scrollY
      let activa = 'inicio'
      for (const [id] of NAVEGACION.slice(1)) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) activa = id
      }
      const total = document.documentElement.scrollHeight - window.innerHeight
      setSolida(y > 24)
      setActiva(activa)
      // El avance cambia en cada cuadro: se pinta directo para no volver a dibujar toda la portada.
      avance.current?.style.setProperty('--avance', total > 0 ? Math.min(1, y / total) : 0)
    }
    medir()
    window.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
    }
  }, [avance])
  return { solida, activa }
}

/** Una flecha clavada que llega desde arriba a la derecha hasta el punto (x, y). */
function Flecha({ x, y, plumas = '#d7372f' }) {
  // Las plumas van junto al culatín, a los dos lados de la varilla: altas atrás y finas hacia la punta.
  const culatin = [58, 6]
  const largo = Math.hypot(x - culatin[0], y - culatin[1])
  const d = [(x - culatin[0]) / largo, (y - culatin[1]) / largo]
  const n = [-d[1], d[0]]
  // [a] avanza por la varilla desde el culatín hacia la punta; [b] se separa de ella hacia un lado.
  const punto = (a, b) => [culatin[0] + d[0] * a + n[0] * b, culatin[1] + d[1] * a + n[1] * b].map((v) => v.toFixed(1)).join(',')
  const pluma = (lado) => `M${punto(2.5, 0)} L${punto(3.5, 5.5 * lado)} L${punto(13, 1.6 * lado)} L${punto(14, 0)} Z`
  return (
    <g className="flecha-clavada">
      <line x1={x} y1={y} x2={culatin[0]} y2={culatin[1]} stroke="#3a2a1c" strokeWidth="2.2" strokeLinecap="round" />
      <path d={pluma(1)} fill={plumas} />
      <path d={pluma(-1)} fill={plumas} />
      <path d={`M${punto(-0.5, 0)} L${punto(2.5, 0)}`} stroke="#f2b705" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

/** El fallo: el círculo de la M con la flecha clavada en la orilla. */
function MarcaFallo() {
  return (
    <svg className="marca-tiro" viewBox="0 0 64 64" role="img" aria-label="Fallo">
      <circle cx="26" cy="38" r="20" className="fallo-fondo" />
      <text x="26" y="44.5" textAnchor="middle" className="fallo-letra">M</text>
      <Flecha x={40} y={24} plumas="#9aa3b2" />
    </svg>
  )
}

/** El diez: una diana con la flecha clavada en el centro. */
function MarcaDiez() {
  return (
    <svg className="marca-tiro" viewBox="0 0 64 64" role="img" aria-label="Diez">
      {[['#fafafa', 22], ['#1e1e1e', 17.6], ['#2462c6', 13.2], ['#d7372f', 8.8], ['#f2b705', 4.4]].map(([color, r]) => (
        <circle key={r} cx="26" cy="38" r={r} fill={color} />
      ))}
      <Flecha x={26} y={38} />
    </svg>
  )
}

/** La distancia de tiro que marca cada sección, como las marcas del campo. */
function Etiqueta({ distancia }) {
  return <p className="etiqueta-seccion"><span className="distancia">{distancia}</span></p>
}

/** Un teléfono con una pantalla real de la app (Estadísticas, de la ficha 0.1.0 de la tienda). */
function TelefonoHeroe() {
  return (
    <div className="heroe-telefono" aria-hidden="true">
      <div className="telefono-marco">
        <div className="movil-pantalla">
          <img src={`${BASE}capturas/estadisticas-0.1.0.jpg`} alt="" width="400" height="844" decoding="async" />
        </div>
      </div>
    </div>
  )
}

// ---------- Ilustraciones de cada módulo, hechas con los datos del club de prueba ----------

function VisualAlumnos() {
  const sesiones = sesionesEntre(MUESTRA, 30)
  const flechas = sesiones.flatMap((s) => s.flechas).slice(-220)
  const dieces = flechas.filter((f) => f.v >= 10).length
  const cons = constancia(sesiones)
  return (
    <div className="visual-alumno">
      <Diana flechas={flechas} tam={250} />
      <div className="visual-alumno-datos">
        <div className="visual-persona">
          <span className="avatar">{iniciales(MUESTRA.nombre)}</span>
          <div><strong>{MUESTRA.nombre}</strong><small>{MUESTRA.grupo}</small></div>
        </div>
        <dl>
          <div><dt>Promedio</dt><dd><Sello prom={promedio(sesiones)} /></dd></div>
          <div><dt>En el 10 o la X</dt><dd>{flechas.length ? Math.round((dieces / flechas.length) * 100) : 0} %</dd></div>
          <div><dt>Variación entre tandas</dt><dd>{cons == null ? '—' : `±${dec(cons, 1)}`}</dd></div>
        </dl>
      </div>
    </div>
  )
}

function VisualEntrenamientos() {
  const clase = useMemo(() => ({ ...PLANTILLAS[0], fecha: aISO(new Date()), hora: '16:00', bloques: PLANTILLAS[0].bloques.map((b, i) => ({ ...b, id: i })) }), [])
  return <div className="visual-telefono"><VistaApp clase={clase} /></div>
}

function VisualMetas() {
  return (
    <ul className="visual-metas">
      {METAS[MUESTRA.id].slice(0, 4).map((m, i) => (
        <li key={i}>
          <div><span className="chip">{m.tipo}</span><small>{m.auto ? 'Se mide sola con la app' : 'La anota el entrenador'}</small></div>
          <strong>{m.texto}</strong>
          <Barra valor={m.actual} max={m.objetivo} estado={m.actual >= m.objetivo ? 'bien' : ''} retardo={i * 90} />
        </li>
      ))}
    </ul>
  )
}

function VisualTorneos() {
  const torneo = TORNEOS.find((t) => diasDesde(t.fecha) <= 0 && t.tipo === 'Externo' && t.alumnos.length)
  const equipo = torneo.alumnos
    .map((id) => ({ a: alumnoPorId(id), prom: promedio(sesionesEntre(alumnoPorId(id), 30)), estado: torneo.estados[id] }))
    .sort((x, y) => (y.prom ?? 0) - (x.prom ?? 0))
    .slice(0, 5)
  return (
    <div className="visual-lista">
      <div className="visual-lista-cabeza">
        <strong>{torneo.nombre}</strong>
        <small>{fechaCorta(torneo.fecha)}, {torneo.sede}, {torneo.distancias}</small>
      </div>
      <ul>
        {equipo.map(({ a, prom, estado }) => (
          <li key={a.id}>
            <span className="avatar chico">{iniciales(a.nombre)}</span>
            <span className="nombre">{a.nombre}</span>
            <Sello prom={prom} />
            <span className={`estado-torneo ${estado.toLowerCase()}`}>{estado}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function VisualAgenda() {
  const eventos = [...AGENDA].sort((x, y) => x.fecha - y.fecha).slice(0, 5)
  const dia = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric' })
  return (
    <div className="visual-lista">
      <div className="visual-lista-cabeza"><strong>Esta semana</strong><small>Club y especialistas</small></div>
      <ul>
        {eventos.map((e) => (
          <li key={e.id}>
            <span className="visual-dia">{dia.format(e.fecha).replace('.', '')}</span>
            <span className="nombre">{e.titulo}<small>{e.hora}, {e.con}</small></span>
            <span className={`chip tipo-${e.tipo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}`}>{e.tipo}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function VisualPagos() {
  const maximo = Math.max(...INGRESOS.map((m) => m.esperado))
  const cuenta = (estado) => ALUMNOS.filter((a) => a.pago === estado).length
  return (
    <div className="visual-pagos">
      <ul className="visual-pagos-estados">
        <li className="bien"><b>{cuenta('Al corriente')}</b> al corriente</li>
        <li className="aviso"><b>{cuenta('Pendiente')}</b> pendientes</li>
        <li className="mal"><b>{cuenta('Atrasado')}</b> atrasados</li>
      </ul>
      <div className="visual-barras" role="img" aria-label="Ingresos de los últimos seis meses">
        {INGRESOS.map((m) => (
          <div key={m.mes} className="visual-barra">
            <span className="esperado" style={{ height: `${(m.esperado / maximo) * 100}%` }}>
              <span className="cobrado" style={{ height: `${(m.cobrado / m.esperado) * 100}%` }} title={pesos(m.cobrado)} />
            </span>
            <small>{m.mes.slice(0, 3)}</small>
          </div>
        ))}
      </div>
      <p className="ayuda">Lo cobrado contra lo esperado cada mes.</p>
    </div>
  )
}

const VISUALES = { alumnos: VisualAlumnos, entrenamientos: VisualEntrenamientos, metas: VisualMetas, torneos: VisualTorneos, agenda: VisualAgenda, pagos: VisualPagos }

// ---------- La portada ----------

export default function Landing({ sesion, tema, cambiarTema }) {
  // Las pantallas del panel cambian a su versión de celular en 860 px; la miniatura sigue eso.
  const angosto = useConsulta('(max-width: 860px)')
  const celular = useConsulta('(max-width: 600px)')
  const [menu, setMenu] = useState(false)
  const [modulo, setModulo] = useState(MODULOS[0].id)
  const [pedido, setPedido] = useState(null)
  const [plan, setPlan] = useState('Club')
  const formulario = useRef(null)
  const avance = useRef(null)
  const barra = useBarra(avance)

  // «Probar el sistema» entra directo al panel con el club de prueba (o al de la cuenta, si ya hay sesión).
  const abrirPanel = (ruta = ['']) => {
    if (!sesion) entrarDemo()
    window.location.hash = `#/${ruta.join('/')}`
  }
  const navegar = (id) => {
    setMenu(false)
    if (id === 'inicio') window.scrollTo({ top: 0, behavior: sinMovimiento() ? 'auto' : 'smooth' })
    else irA(id)
  }
  const pedirDemo = (nombrePlan) => {
    if (nombrePlan) setPlan(nombrePlan)
    irA('contacto')
    setTimeout(() => formulario.current?.querySelector('input')?.focus({ preventScroll: true }), 500)
  }
  const enviar = (e) => {
    e.preventDefault()
    setPedido(new FormData(e.target).get('nombre')?.toString().trim() || 'entrenador')
  }

  const actual = MODULOS.find((m) => m.id === modulo)
  const Visual = VISUALES[modulo]

  return (
    <div className="landing">
      <a className="saltar" href="#funciones" onClick={(e) => { e.preventDefault(); irA('funciones') }}>Saltar a las funcionalidades</a>

      <header className={`landing-barra ${barra.solida || menu ? 'solida' : ''} ${menu ? 'abierta' : ''}`}>
        <a className="landing-marca" href="#/inicio" onClick={(e) => { e.preventDefault(); navegar('inicio') }}>
          <Logo tam={34} />
          <span className="marca-nombre">Diario de Tiro</span>
          <span className="marca-para">Entrenadores</span>
        </a>
        <nav className="landing-nav" aria-label="Secciones de la página">
          {NAVEGACION.map(([id, t]) => (
            <button key={id} className={barra.activa === id ? 'activa' : ''} aria-current={barra.activa === id ? 'true' : undefined} onClick={() => navegar(id)}>{t}</button>
          ))}
        </nav>
        <div className="landing-cuenta">
          <button className="icono-barra" onClick={cambiarTema} aria-label={tema === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'} title={tema === 'dark' ? 'Modo día' : 'Modo noche'}>
            {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {sesion ? (
            <a className="l-boton oro" href="#/">Ir a mi panel</a>
          ) : (
            <>
              <a className="l-boton borde-claro chico entrar" href="#/entrar">Iniciar sesión</a>
              <a className="l-boton oro chico" href="#/registro">Probar gratis</a>
            </>
          )}
          <button className="icono-barra menu-movil" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}>
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {/* Lo recorrido de la página, como una flecha que avanza por la línea de tiro */}
        <span className="barra-avance" ref={avance} aria-hidden="true" />
        {menu && (
          <div className="menu-desplegado">
            {NAVEGACION.map(([id, t]) => (
              <button key={id} className={barra.activa === id ? 'activa' : ''} onClick={() => navegar(id)}>{t}</button>
            ))}
            {!sesion && (
              <div className="menu-cuenta">
                <a className="l-boton borde-claro" href="#/entrar">Iniciar sesión</a>
                <a className="l-boton oro" href="#/registro">Probar gratis</a>
              </div>
            )}
          </div>
        )}
      </header>

      <main>
        {/* 1. Héroe */}
        <section className="heroe" aria-labelledby="titulo-heroe" style={FOTO_CAMPO}>
          <svg className="heroe-anillos" viewBox="0 0 400 400" aria-hidden="true">
            {[196, 168, 140, 112, 84, 56, 28].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
          </svg>
          <div className="heroe-texto">
            <h1 id="titulo-heroe">Tu club de arquería. Bajo control.</h1>
            <p className="heroe-sub">Administra tus alumnos, organiza entrenamientos, mide el progreso de tus arqueros y lleva las cuentas de tu club desde un solo lugar.</p>
            <div className="acciones">
              <button className="l-boton oro grande" onClick={() => abrirPanel()}>{sesion ? 'Ir a mi panel' : 'Probar el sistema'}</button>
              <button className="l-boton borde-claro grande" onClick={() => irA('funciones')}>Ver funcionalidades</button>
            </div>
            <p className="heroe-app"><Smartphone size={17} aria-hidden="true" /> Con la app gratis para tus alumnos en <span className="insignia-so">Android</span> y <span className="insignia-so">iPhone</span></p>
            <p className="heroe-estilos">Para recurvo, compuesto, barebow y tradicional.</p>
          </div>
          <div className="heroe-visual">
            <div className="ventana-heroe" aria-hidden="true">
              <div className="demo-ventana-barra"><span /><span /><span /><p>entrenador.diariodetiro.app</p></div>
              <Miniatura ancho={celular ? 440 : angosto ? 760 : 1180} alto={celular ? 760 : angosto ? 900 : 820}>
                <div className="miniatura-panel"><Panel /></div>
              </Miniatura>
            </div>
            <TelefonoHeroe />
          </div>
          <div className="linea-de-tiro-heroe" aria-hidden="true">
            {[18, 30, 50, 70].map((m) => <span key={m} style={{ left: `${(m / 76) * 100}%` }}>{m} m</span>)}
          </div>
        </section>

        {/* 3. Problemas y soluciones */}
        <section className="l-seccion" id="beneficios" aria-labelledby="titulo-problemas">
          <div className="l-cabeza">
            <Etiqueta distancia="18 m" />
            <h2 id="titulo-problemas">De la flecha perdida al diez.</h2>
            <p>Lo que a cualquier entrenador se le escapa en una libreta, y cómo se ve aquí.</p>
          </div>
          <ol className="problemas">
            {PROBLEMAS.map((p) => (
              <li key={p.modulo}>
                <div className="problema">
                  <MarcaFallo />
                  <p>«{p.problema}»</p>
                </div>
                <ArrowRight className="flecha-problema" size={22} aria-hidden="true" />
                <div className="solucion">
                  <MarcaDiez />
                  <div>
                    <p>{p.solucion}</p>
                    <button className="enlace" onClick={() => abrirPanel(p.ruta)}>Verlo en {p.modulo}</button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. Funcionalidades */}
        <section className="l-seccion franja-suave" id="funciones" aria-labelledby="titulo-funciones">
          <div className="cabeza-mascota">
            <div className="l-cabeza">
              <Etiqueta distancia="30 m" />
              <h2 id="titulo-funciones">Seis herramientas, un mismo club.</h2>
              <p>Cada sección trabaja con lo que tus alumnos registran en la app. Nada se captura dos veces.</p>
            </div>
            <img className="mapache-tableta" src={`${BASE}mascota/tableta.png`} alt="El mapache entrenador señalando el panel en su tableta" width="437" height="520" loading="lazy" decoding="async" />
          </div>
          <div className="modulos">
            <div className="modulos-lista" role="tablist" aria-label="Funcionalidades">
              {MODULOS.map((m) => (
                <button key={m.id} role="tab" id={`tab-${m.id}`} aria-selected={modulo === m.id} aria-controls="modulo-detalle" className={modulo === m.id ? 'activo' : ''} onClick={() => setModulo(m.id)}>
                  <m.Icono size={20} strokeWidth={1.9} aria-hidden="true" /> {m.nombre}
                </button>
              ))}
            </div>
            <div className="modulo-detalle" id="modulo-detalle" role="tabpanel" aria-labelledby={`tab-${modulo}`} key={modulo}>
              <div className="modulo-texto">
                <h3>{actual.titulo}</h3>
                <p>{actual.texto}</p>
                <ul className="lista-check">
                  {actual.puntos.map((p) => <li key={p}><Check size={17} aria-hidden="true" /> {p}</li>)}
                </ul>
                <button className="l-boton borde" onClick={() => abrirPanel([modulo])}>Abrir {actual.nombre} en el panel</button>
              </div>
              <div className="modulo-visual"><Visual /></div>
            </div>
          </div>
        </section>

        {/* La app del alumno */}
        <section className="l-seccion app-seccion franja-oscura" id="app" aria-labelledby="titulo-app">
          <div className="app-cabeza">
            <div className="app-texto">
              <h2 id="titulo-app">La otra mitad está en el bolsillo de tus alumnos.</h2>
              <p>Diario de Tiro es una app gratis para Android y iPhone. Cada arquero anota ahí sus flechas, su equipo y su técnica, recibe las clases que tú le mandas, y todo llega solo a tu panel.</p>
            </div>
            <ul className="tiendas">
              {TIENDAS.map((t) => (
                <li key={t.id}>
                  <a className="tienda" href={t.enlace} target="_blank" rel="noreferrer" aria-label={`${t.tienda}: Diario de Tiro para ${t.sistema}`}>
                    <t.Icono size={24} aria-hidden="true" />
                    <span><small>{t.arriba}</small>{t.tienda}</span>
                  </a>
                  <img className="tienda-qr" src={`${BASE}qr/${t.id}.svg`} alt={`Código QR para bajar la app en ${t.sistema}`} width="96" height="96" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
          <ul className="app-telefonos" aria-label="Pantallas de la app">
            {CAPTURAS.map((c) => (
              <li key={c.archivo}>
                <div className="telefono-marco">
                  <div className="movil-pantalla">
                    <img src={`${BASE}capturas/app-${c.archivo}.jpg`} alt={c.alt} width="540" height="1140" loading="lazy" decoding="async" />
                  </div>
                </div>
                <strong>{c.titulo}</strong>
                <span>{c.texto}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 7. Planes y precios */}
        <section className="l-seccion franja-suave" id="planes" aria-labelledby="titulo-planes">
          <div className="l-cabeza">
            <Etiqueta distancia="50 m" />
            <h2 id="titulo-planes">Un plan para cada tamaño de club.</h2>
            <p>Precios en pesos mexicanos, por club y por mes. Tus alumnos usan la app gratis, y si pagas el año te regalamos 2 meses.</p>
          </div>
          <div className="planes">
            {PLANES.map((p) => (
              <article key={p.nombre} className={`plan ${p.recomendado ? 'recomendado' : ''} ${p.cupo ? 'con-cupo' : ''}`}>
                {p.recomendado && <span className="plan-insignia">Recomendado</span>}
                {p.cupo && <span className="plan-insignia cupo">Solo {LUGARES_GRATIS} lugares</span>}
                <h3>{p.nombre}</h3>
                <p className="plan-para">{p.para}</p>
                <div className="plan-precio">
                  <span className="precio">{p.mensual ? pesos(p.mensual) : '$0'}</span><small>al mes</small>
                </div>
                <p className="plan-anual">{p.mensual ? `o ${pesos(p.mensual * 10)} al año` : 'No pide tarjeta'}</p>
                <dl className="plan-limites">
                  <div><dt>Alumnos</dt><dd>{p.alumnos}</dd></div>
                  <div><dt>Entrenadores</dt><dd>{p.entrenadores}</dd></div>
                </dl>
                <ul className="lista-check">
                  {p.incluye.map((x) => <li key={x}><Check size={17} aria-hidden="true" /> {x}</li>)}
                </ul>
                {p.cupo ? (
                  <a className="l-boton oro" href="#/registro">{p.boton}</a>
                ) : (
                  <button className={`l-boton ${p.recomendado ? 'oro' : 'borde'}`} onClick={() => pedirDemo(p.nombre)}>{p.boton}</button>
                )}
              </article>
            ))}
          </div>
          <p className="nota-demo">El plan Gratis es para los primeros {LUGARES_GRATIS} clubes; iremos abriendo más lugares.</p>
        </section>

        {/* 9. Preguntas frecuentes */}
        <section className="l-seccion preguntas-seccion" id="preguntas" aria-labelledby="titulo-preguntas">
          <div className="preguntas-lado">
            <h2 id="titulo-preguntas">¿Dudas? Te las resolvemos.</h2>
            <img className="mapache" src={`${BASE}mascota/explicando.png`} alt="El mapache entrenador, la mascota de Diario de Tiro, explicando" width="354" height="520" loading="lazy" decoding="async" />
            <p className="ayuda">¿No está tu pregunta? <a href={CORREO_SOPORTE}>Escríbenos</a>.</p>
          </div>
          <div className="preguntas">
            {PREGUNTAS.map(([p, r]) => (
              <details key={p} className="pregunta">
                <summary>{p}<ChevronDown size={20} aria-hidden="true" /></summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 10. Cierre */}
        <section className="cierre" id="contacto" aria-labelledby="titulo-cierre" style={FOTO_CAMPO}>
          <svg className="heroe-anillos" viewBox="0 0 400 400" aria-hidden="true">
            {[196, 168, 140, 112, 84, 56, 28].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
          </svg>
          <div className="cierre-texto">
            <h2 id="titulo-cierre">Dedica más tiempo a entrenar. Menos tiempo a administrar.</h2>
            <p>Todo lo que necesitas para organizar tu club y llevar a tus arqueros al siguiente nivel.</p>
            <div className="acciones">
              <button className="l-boton oro grande" onClick={() => abrirPanel()}>{sesion ? 'Ir a mi panel' : 'Probar el sistema'}</button>
              <button className="l-boton borde-claro grande" onClick={() => pedirDemo()}>Solicitar demostración</button>
            </div>
            <img className="mapache-cierre" src={`${BASE}mascota/pulgar.png`} alt="" width="392" height="520" loading="lazy" decoding="async" />
          </div>
          <form className="pedido" ref={formulario} onSubmit={enviar} aria-labelledby="titulo-pedido">
            {pedido ? (
              <div className="pedido-listo" role="status">
                <MarcaDiez />
                <h3>¡Gracias, {pedido}!</h3>
                <p>Así se vería la confirmación. Como esto es un prototipo, no se mandó nada.</p>
                <button type="button" className="l-boton borde" onClick={() => setPedido(null)}>Llenar otra vez</button>
              </div>
            ) : (
              <>
                <h3 id="titulo-pedido">Solicita una demostración</h3>
                <label>Tu nombre<input name="nombre" required autoComplete="name" placeholder="Ej. Ana López" /></label>
                <label>Correo<input name="correo" type="email" required autoComplete="email" placeholder="tu@correo.com" /></label>
                <div className="pedido-fila">
                  <label>Club o academia<input name="club" placeholder="Ej. Arqueros del Valle" /></label>
                  <label>Alumnos<select name="alumnos" defaultValue="11 a 40"><option>1 a 10</option><option>11 a 40</option><option>41 a 100</option><option>Más de 100</option></select></label>
                </div>
                <fieldset className="pedido-planes">
                  <legend>Plan que te interesa</legend>
                  {PLANES.map((p) => (
                    <label key={p.nombre} className={plan === p.nombre ? 'activo' : ''}>
                      <input type="radio" name="plan" value={p.nombre} checked={plan === p.nombre} onChange={() => setPlan(p.nombre)} /> {p.nombre}
                    </label>
                  ))}
                </fieldset>
                <button className="l-boton oro grande" type="submit">Enviar solicitud</button>
                <small className="ayuda">Prototipo: el formulario no manda nada.</small>
              </>
            )}
          </form>
        </section>
      </main>

      <footer className="landing-pie">
        <div className="pie-marca">
          <span className="landing-marca"><Logo tam={26} /> <span>Diario de Tiro</span></span>
          <small>Prototipo con datos inventados.</small>
        </div>
        <nav className="pie-enlaces" aria-label="Enlaces del pie">
          {NAVEGACION.slice(1).map(([id, t]) => <button key={id} onClick={() => navegar(id)}>{t}</button>)}
        </nav>
        <div className="pie-enlaces">
          <a href={CORREO_SOPORTE}><LifeBuoy size={16} aria-hidden="true" /> Soporte</a>
          <a href="https://www.instagram.com/utility.archery/" target="_blank" rel="noreferrer"><Instagram size={16} aria-hidden="true" /> @utility.archery</a>
        </div>
      </footer>
    </div>
  )
}
