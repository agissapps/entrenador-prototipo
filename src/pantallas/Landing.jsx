import { useMemo, useState } from 'react'
import {
  BarChart3, CalendarDays, Camera, Crosshair, Dumbbell, Globe, Instagram, LayoutDashboard, LifeBuoy, Moon,
  Smartphone, Sun, Target, Timer, Trophy, Users, Wallet, Wrench,
} from 'lucide-react'
import { ALUMNOS, METAS, PLANTILLAS, alumnoPorId, cambio, diasDesde, promedio, promedioSemanal, sesionesEntre, ultimaSesion } from '../datos.js'
import { Barra, Diana, LineaDeTiro, Sello } from '../graficas.jsx'
import { CORREO_SOPORTE } from '../comunes.jsx'
import { entrarDemo } from '../sesion.js'
import { dec, iniciales } from '../formato.js'
import { aISO } from '../selectores.jsx'
import { VistaApp } from './Entrenamientos.jsx'
import './landing.css'

export function Logo({ tam = 34 }) {
  return (
    <svg viewBox="0 0 32 32" width={tam} height={tam} aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#FAFAFA" /><circle cx="16" cy="16" r="12" fill="#1E1E1E" /><circle cx="16" cy="16" r="9" fill="#2462C6" />
      <circle cx="16" cy="16" r="6" fill="#D7372F" /><circle cx="16" cy="16" r="3" fill="#F2B705" />
    </svg>
  )
}

const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** Los puntos de la línea de tiro del club de prueba, igual que en el panel. */
function usePuntosClub() {
  return useMemo(
    () =>
      ALUMNOS.map((a) => {
        const dias = diasDesde(ultimaSesion(a)?.fecha ?? new Date(0))
        const c = cambio(a)
        return {
          id: a.id,
          nombre: a.nombre,
          grupo: a.grupo,
          iniciales: iniciales(a.nombre),
          prom: promedio(sesionesEntre(a, 30)),
          semanas: promedioSemanal(a, 12).map((s) => s.promedio),
          estado: dias >= 7 ? 'ausente' : c != null && c < -0.15 ? 'bajando' : '',
          nota: dias >= 7 ? `Lleva ${dias} días sin tirar` : c == null ? 'Sin datos para comparar' : c < 0 ? `Bajó ${dec(-c)} contra el mes anterior` : `Subió ${dec(c)} contra el mes anterior`,
        }
      }),
    [],
  )
}

const FUNCIONES_APP = [
  { Icono: Crosshair, titulo: 'Cada flecha en la diana', texto: 'Tocas donde cayó y la app guarda el valor y la posición. Sala, aire libre, NFAA, Worcester y campo.' },
  { Icono: BarChart3, titulo: 'Estadísticas que se entienden', texto: 'Promedio, constancia entre tandas y hacia dónde se te carga el grupo, sesión por sesión.' },
  { Icono: Camera, titulo: 'Postura con la cámara', texto: 'Graba tus tiros y la app marca el esqueleto: tensado, anclaje y suelta, para revisar tu técnica.' },
  { Icono: Wrench, titulo: 'Tu equipo, anotado', texto: 'Arcos, libraje, juegos de flechas y puestas a punto, ligados a cada sesión.' },
  { Icono: Timer, titulo: 'Cronómetro de competencia', texto: 'Tiempo de preparación y de tiro como en un torneo, sin otra app.' },
  { Icono: Globe, titulo: 'En tu idioma', texto: 'Español, inglés y francés. En Android, y pronto en iPhone.' },
]

/** Las capturas de la ficha de la Play Store (publicacion/play), reducidas para la web. */
const CAPTURAS = [
  { archivo: 'diario', alt: 'El diario: cada sesión con su distancia, flechas, puntos y el promedio del mes' },
  { archivo: 'diana', alt: 'Registrar una tanda marcando el impacto exacto en la diana con lupa' },
  { archivo: 'postura', alt: 'La cámara sigue las articulaciones del arquero mientras tira' },
  { archivo: 'video', alt: 'Videos en cámara lenta del tiro con el esqueleto marcado' },
  { archivo: 'perfil', alt: 'Mi perfil: puestas a punto del arco y juegos de flechas' },
]

const MODULOS = [
  { Icono: LayoutDashboard, titulo: 'Panel', texto: 'Todo el club en la línea de tiro: quién va bien, quién baja y quién no ha venido.' },
  { Icono: Users, titulo: 'Alumnos', texto: 'La ficha de cada arquero con su diana, su promedio semanal, notas y citas.' },
  { Icono: Dumbbell, titulo: 'Entrenamientos', texto: 'Armas la clase por bloques y la mandas a la app de un grupo o de un alumno.' },
  { Icono: Target, titulo: 'Metas', texto: 'Puntos, distancia, libraje, fuerza y resistencia, con avance que se actualiza solo.' },
  { Icono: Trophy, titulo: 'Torneos', texto: 'Calendario, equipo de competencia y torneos internos con resultados en vivo.' },
  { Icono: CalendarDays, titulo: 'Agenda', texto: 'Clases, psicólogo, fisioterapia y capacitaciones en un mismo calendario.' },
  { Icono: Wallet, titulo: 'Pagos', texto: 'Mensualidades e inscripciones, quién debe y recordatorios al alumno o a su tutor.' },
]

const ESTILOS_ARCO = [
  { nombre: 'Recurvo', texto: 'El arco olímpico. Las puntas se curvan hacia adelante; se tira con mira, estabilizadores y clicker.', color: 'azul' },
  { nombre: 'Compuesto', texto: 'Usa poleas que reducen la fuerza al anclar y se suelta con disparador. Es el más preciso.', color: 'rojo' },
  { nombre: 'Barebow', texto: 'Un recurvo sin mira ni estabilizadores: se apunta con la punta de la flecha y la técnica.', color: 'negro' },
  { nombre: 'Tradicional', texto: 'Longbow y arcos de madera, sin accesorios. La arquería en su forma más antigua.', color: 'oro' },
]

const ANILLOS_DIANA = [
  ['oro', 'Amarillo', '10 y 9', 'El centro. La X, dentro del 10, sirve para desempatar.'],
  ['rojo', 'Rojo', '8 y 7', ''],
  ['azul', 'Azul', '6 y 5', ''],
  ['negro', 'Negro', '4 y 3', ''],
  ['blanco', 'Blanco', '2 y 1', 'Fuera de la diana es fallo: la M.'],
]

/** Distancias de las rondas más comunes, para dibujarlas sobre una regla de 0 a 70 m. */
const DISTANCIAS = [
  { metros: 18, donde: 'Sala', texto: 'Diana de 40 cm. La temporada de invierno.' },
  { metros: 50, donde: 'Compuesto', texto: 'Diana de 80 cm con solo los anillos del 5 al 10.' },
  { metros: 70, donde: 'Recurvo', texto: 'Diana de 122 cm. La distancia de los Juegos Olímpicos.' },
]

function Demo() {
  const [vista, setVista] = useState('linea')
  const puntos = usePuntosClub()
  const alumno = alumnoPorId('4')
  const flechas = useMemo(() => sesionesEntre(alumno, 30).flatMap((s) => s.flechas).slice(-300), [alumno])
  const clase = useMemo(() => ({ ...PLANTILLAS[0], fecha: aISO(new Date()), hora: '16:00', bloques: PLANTILLAS[0].bloques.map((b, i) => ({ ...b, id: i })) }), [])

  const vistas = [
    ['linea', 'Línea de tiro del club'],
    ['diana', 'Diana de un alumno'],
    ['clase', 'Clase en el teléfono'],
    ['metas', 'Metas'],
  ]

  return (
    <div className="demo">
      <div className="segmentos demo-pestanas" role="tablist">
        {vistas.map(([id, t]) => (
          <button key={id} role="tab" aria-selected={vista === id} className={vista === id ? 'activo' : ''} onClick={() => setVista(id)}>{t}</button>
        ))}
      </div>
      <div className="demo-escena" key={vista}>
        {vista === 'linea' && (
          <div className="portada demo-linea">
            <p className="demo-nota">40 arqueros de un club de prueba, cada uno en su promedio de 30 días. Pasa el mouse sobre uno.</p>
            <LineaDeTiro puntos={puntos} />
          </div>
        )}
        {vista === 'diana' && (
          <div className="demo-diana">
            <Diana flechas={flechas} tam={320} />
            <div>
              <p className="demo-nombre">{alumno.nombre}</p>
              <Sello prom={promedio(sesionesEntre(alumno, 30))} grande />
              <p className="ayuda">Sus últimas {flechas.length} flechas. La cruz verde es el centro del grupo: si se aleja del centro, hay algo que corregir.</p>
            </div>
          </div>
        )}
        {vista === 'clase' && (
          <div className="demo-clase">
            <VistaApp clase={clase} />
            <div>
              <h3>Lo que el entrenador arma, el alumno lo ve en la app</h3>
              <p className="ayuda">Calentamiento, técnica, tandas y físico con su tiempo. Al terminar, el alumno la marca como hecha y sus flechas quedan ligadas a la clase.</p>
            </div>
          </div>
        )}
        {vista === 'metas' && (
          <ul className="demo-metas">
            {METAS[alumno.id].slice(0, 5).map((m, i) => (
              <li key={i}>
                <span className="meta-tipo">{m.tipo}</span>
                <strong>{m.texto}</strong>
                <Barra valor={m.actual} max={m.objetivo} estado={m.actual >= m.objetivo ? 'bien' : ''} retardo={i * 90} />
                <small>{m.auto ? 'Se actualiza sola con la app' : 'La anota el entrenador'}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function Landing({ sesion, tema, cambiarTema }) {
  const puntos = usePuntosClub()
  const navegacion = [['app', 'La app'], ['entrenadores', 'Para entrenadores'], ['demo', 'Demo'], ['arqueria', 'Arquería']]

  return (
    <div className="landing">
      <header className="landing-barra">
        <a className="landing-marca" href="#/inicio" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <Logo /> Diario de Tiro
        </a>
        <nav className="landing-nav" aria-label="Secciones de la página">
          {navegacion.map(([id, t]) => <button key={id} onClick={() => irA(id)}>{t}</button>)}
        </nav>
        <div className="landing-cuenta">
          <button className="icono-chico" onClick={cambiarTema} aria-label={tema === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}>
            {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {sesion ? (
            <a className="boton oro" href="#/">Ir a mi panel</a>
          ) : (
            <>
              <a className="boton secundario" href="#/entrar">Iniciar sesión</a>
              <a className="boton oro" href="#/registro">Crear cuenta</a>
            </>
          )}
        </div>
      </header>

      <section className="landing-portada">
        <svg className="portada-diana-grande" viewBox="0 0 400 400" aria-hidden="true">
          {[190, 160, 130, 100, 70, 40, 14].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        </svg>
        <div className="portada-texto">
          <p className="portada-etiqueta"><Smartphone size={15} aria-hidden="true" /> App para arqueros + web para entrenadores</p>
          <h1>Cada flecha cuenta. Ahora también para tu club.</h1>
          <p className="portada-sub">Tus alumnos registran sus tiros en la app Diario de Tiro y tú ves todo el club en un solo lugar: promedios, técnica, metas, clases, torneos y pagos.</p>
          <div className="acciones">
            <a className="boton oro grande" href={sesion ? '#/' : '#/registro'}>{sesion ? 'Ir a mi panel' : 'Crear cuenta gratis'}</a>
            <button className="boton fantasma grande" onClick={() => (sesion ? (window.location.hash = '#/') : entrarDemo())}>Ver la demo en vivo</button>
          </div>
        </div>
        <div className="portada-visual" aria-hidden="true">
          <div className="ventana">
            <div className="ventana-barra"><span /><span /><span /></div>
            <div className="ventana-cuerpo portada">
              <strong className="ventana-titulo">La línea de tiro</strong>
              <LineaDeTiro puntos={puntos} />
            </div>
          </div>
          <div className="telefono-portada">
            <div className="telefono-portada-pantalla">
              <small>Sesión de hoy, 18 m</small>
              <Diana flechas={alumnoPorId('7') ? sesionesEntre(alumnoPorId('7'), 30).flatMap((s) => s.flechas).slice(-60) : []} tam={150} />
              <Sello prom={promedio(sesionesEntre(alumnoPorId('7'), 30))} />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-seccion" id="app">
        <div className="seccion-cabeza">
          <h2>La app para el arquero</h2>
          <p>Un diario de entrenamiento que entiende de arquería. Sirve solo, sin entrenador, y es gratis.</p>
        </div>
        <ul className="capturas" aria-label="Capturas de la app">
          {CAPTURAS.map((c) => (
            <li key={c.archivo}>
              <img src={`${import.meta.env.BASE_URL}capturas/${c.archivo}.webp`} alt={c.alt} width="600" height="1067" loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
        <ul className="funciones">
          {FUNCIONES_APP.map(({ Icono, titulo, texto }) => (
            <li key={titulo}>
              <span className="funcion-icono"><Icono size={22} aria-hidden="true" /></span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-seccion oscura" id="entrenadores">
        <div className="seccion-cabeza">
          <h2>La web para el entrenador</h2>
          <p>Lo que tus alumnos registran en la app llega solo. Tú decides con datos y les mandas lo que sigue.</p>
        </div>
        <ul className="modulos">
          {MODULOS.map(({ Icono, titulo, texto }) => (
            <li key={titulo}>
              <Icono size={20} aria-hidden="true" />
              <div><h3>{titulo}</h3><p>{texto}</p></div>
            </li>
          ))}
        </ul>
        <ol className="pasos">
          <li><b>El alumno tira</b><span>Registra sus flechas, su postura y su equipo en la app.</span></li>
          <li><b>Tú lo ves</b><span>Promedios, constancia y metas de todo el club se actualizan solos.</span></li>
          <li><b>Le mandas lo que sigue</b><span>Clases, metas, citas y torneos le llegan a su teléfono.</span></li>
        </ol>
      </section>

      <section className="landing-seccion" id="demo">
        <div className="seccion-cabeza">
          <h2>Pruébalo aquí mismo</h2>
          <p>Esto no es una imagen: es la página de verdad con un club de prueba. Toca las pestañas.</p>
        </div>
        <Demo />
        <div className="acciones centro-acciones">
          <button className="boton oro grande" onClick={() => (sesion ? (window.location.hash = '#/') : entrarDemo())}>Entrar a la demo completa</button>
        </div>
      </section>

      <section className="landing-seccion" id="arqueria">
        <div className="seccion-cabeza">
          <h2>La arquería en pocas palabras</h2>
          <p>Uno de los deportes más antiguos y de los más mentales: gana quien repite el mismo tiro, flecha tras flecha. Se practica a cualquier edad, solo o en equipo.</p>
        </div>

        <h3 className="sub-arqueria">Los arcos</h3>
        <ul className="estilos-arco">
          {ESTILOS_ARCO.map((e) => (
            <li key={e.nombre} className={`estilo-${e.color}`}>
              <h4>{e.nombre}</h4>
              <p>{e.texto}</p>
            </li>
          ))}
        </ul>

        <div className="diana-explicada">
          <svg viewBox="0 0 200 200" className="diana-colores" aria-label="Diana de diez anillos">
            {['#FAFAFA', '#FAFAFA', '#1E1E1E', '#1E1E1E', '#2462C6', '#2462C6', '#D7372F', '#D7372F', '#F2B705', '#F2B705'].map((c, i) => (
              <circle key={i} cx="100" cy="100" r={96 * (1 - i / 10)} fill={c} stroke={i < 2 ? '#1E1E1E' : i < 4 ? '#FAFAFA' : '#1E1E1E33'} strokeWidth={0.8} />
            ))}
            <circle cx="100" cy="100" r="4.8" fill="none" stroke="#1E1E1E88" />
          </svg>
          <div>
            <h3 className="sub-arqueria">Cómo se puntúa la diana</h3>
            <p className="ayuda">Diez anillos en cinco colores. Cada color tiene dos anillos: el de adentro vale uno más.</p>
            <ul className="anillos-lista">
              {ANILLOS_DIANA.map(([clase, color, puntos, nota]) => (
                <li key={clase}><span className={`sello ${clase}`}>{puntos}</span><b>{color}</b>{nota && <small>{nota}</small>}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="sub-arqueria">Las distancias</h3>
        <div className="regla" role="img" aria-label="Distancias: sala a 18 metros, compuesto a 50 y recurvo a 70">
          <div className="regla-linea">
            {[0, 10, 20, 30, 40, 50, 60, 70].map((m) => <span key={m} className="regla-marca" style={{ left: `${(m / 70) * 100}%` }}><small>{m} m</small></span>)}
          </div>
          {DISTANCIAS.map((d) => (
            <div key={d.metros} className="regla-parada" style={{ left: `${(d.metros / 70) * 100}%` }}>
              <span className="regla-punto" />
              <b>{d.metros} m</b>
              <strong>{d.donde}</strong>
              <p>{d.texto}</p>
            </div>
          ))}
        </div>
        <p className="ayuda regla-nota">Además están el campo y el 3D: recorridos por el bosque con blancos a distancias distintas, muchas veces sin medir.</p>
      </section>

      <section className="landing-cierre">
        <svg className="portada-diana-grande" viewBox="0 0 400 400" aria-hidden="true">
          {[190, 160, 130, 100, 70, 40, 14].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        </svg>
        <h2>Lleva a tu club al centro de la diana.</h2>
        <p>Crea tu cuenta de entrenador y pide a tus alumnos que bajen la app.</p>
        <div className="acciones">
          <a className="boton oro grande" href={sesion ? '#/' : '#/registro'}>{sesion ? 'Ir a mi panel' : 'Crear cuenta gratis'}</a>
          <a className="boton fantasma grande" href={sesion ? '#/' : '#/entrar'}>Iniciar sesión</a>
        </div>
      </section>

      <footer className="landing-pie">
        <span className="landing-marca"><Logo tam={26} /> Diario de Tiro</span>
        <div className="pie-enlaces">
          <a href={CORREO_SOPORTE}><LifeBuoy size={16} aria-hidden="true" /> Soporte</a>
          <a href="https://www.instagram.com/utility.archery/" target="_blank" rel="noreferrer"><Instagram size={16} aria-hidden="true" /> @utility.archery</a>
        </div>
        <small>Prototipo con datos inventados.</small>
      </footer>
    </div>
  )
}
