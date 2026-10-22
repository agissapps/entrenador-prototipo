import { useEffect, useState } from 'react'
import { CalendarDays, Dumbbell, LayoutDashboard, LifeBuoy, LogOut, Menu, Moon, Sun, Target, Trophy, Users, Wallet } from 'lucide-react'
import { CLUB } from './datos.js'
import { CORREO_SOPORTE } from './comunes.jsx'
import Panel from './pantallas/Panel.jsx'
import Alumnos from './pantallas/Alumnos.jsx'
import Perfil from './pantallas/Perfil.jsx'
import Entrenamientos from './pantallas/Entrenamientos.jsx'
import Torneos from './pantallas/Torneos.jsx'
import Metas from './pantallas/Metas.jsx'
import Agenda from './pantallas/Agenda.jsx'
import Pagos from './pantallas/Pagos.jsx'
import Pronto from './pantallas/Pronto.jsx'
import SelectorVariante from './SelectorVariante.jsx'
import Landing from './pantallas/Landing.jsx'
import Acceso from './pantallas/Acceso.jsx'
import { cerrarSesion, useSesion } from './sesion.js'
import { iniciales } from './formato.js'

// Secciones del menú. Las que aún no se hacen muestran una página de «próximamente».
const SECCIONES = [
  { ruta: '', nombre: 'Panel', Icono: LayoutDashboard },
  { ruta: 'alumnos', nombre: 'Alumnos', Icono: Users },
  { ruta: 'entrenamientos', nombre: 'Entrenamientos', Icono: Dumbbell },
  { ruta: 'metas', nombre: 'Metas', Icono: Target },
  { ruta: 'torneos', nombre: 'Torneos', Icono: Trophy },
  { ruta: 'agenda', nombre: 'Agenda', Icono: CalendarDays },
  { ruta: 'pagos', nombre: 'Pagos', Icono: Wallet },
]

// Día es el modo principal; el botón cambia entre día y noche (ya no hay modo automático).
const TEMAS = {
  light: { siguiente: 'dark', nombre: 'Cambiar a modo noche', Icono: Moon },
  dark: { siguiente: 'light', nombre: 'Cambiar a modo día', Icono: Sun },
}

function rutaActual() {
  return window.location.hash.replace(/^#\/?/, '').split('/')
}

export default function App() {
  const [ruta, setRuta] = useState(rutaActual)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem('tema') === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    const cambio = () => {
      setRuta(rutaActual())
      setMenuAbierto(false)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', cambio)
    return () => window.removeEventListener('hashchange', cambio)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    try {
      localStorage.setItem('tema', tema)
    } catch {
      // sin almacenamiento: el tema solo dura mientras la página está abierta
    }
  }, [tema])

  const sesion = useSesion()
  const [seccion, id] = ruta

  // Sin sesión se ve la página de inicio; «inicio» la muestra siempre, también con sesión.
  if (seccion === 'entrar' || seccion === 'registro') return <Acceso modo={seccion} sesion={sesion} />
  if (!sesion || seccion === 'inicio') return <Landing sesion={sesion} tema={tema} cambiarTema={() => setTema(TEMAS[tema].siguiente)} />

  const actual = SECCIONES.find((s) => s.ruta === seccion) ?? SECCIONES[0]

  let pantalla
  if (seccion === 'alumnos' && id) pantalla = <Perfil id={id} />
  else if (seccion === 'alumnos') pantalla = <Alumnos />
  else if (seccion === 'entrenamientos') pantalla = <Entrenamientos />
  else if (seccion === 'torneos') pantalla = <Torneos />
  else if (seccion === 'metas') pantalla = <Metas />
  else if (seccion === 'agenda') pantalla = <Agenda />
  else if (seccion === 'pagos') pantalla = <Pagos />
  else if (actual.pronto) pantalla = <Pronto nombre={actual.nombre} Icono={actual.Icono} />
  else pantalla = <Panel />

  const t = TEMAS[tema]

  return (
    <div className={`marco ${menuAbierto ? 'menu-abierto' : ''}`}>
      <header className="barra-movil">
        <button className="boton-icono" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Abrir menú"><Menu size={22} /></button>
        <span className="marca-chica">Diario de Tiro</span>
      </header>

      <nav className="lateral" aria-label="Secciones">
        <a className="marca" href="#/inicio" title="Ir a la página de inicio">
          <span className="logo" aria-hidden="true">
            <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#FAFAFA" /><circle cx="16" cy="16" r="12" fill="#1E1E1E" /><circle cx="16" cy="16" r="9" fill="#2462C6" /><circle cx="16" cy="16" r="6" fill="#D7372F" /><circle cx="16" cy="16" r="3" fill="#F2B705" /></svg>
          </span>
          <div>
            <strong>Diario de Tiro</strong>
            <small>{sesion.club || CLUB.nombre}</small>
          </div>
        </a>
        <ul>
          {SECCIONES.map((s) => (
            <li key={s.ruta}>
              <a href={`#/${s.ruta}`} className={s === actual ? 'activo' : ''} aria-current={s === actual ? 'page' : undefined} title={s.nombre}>
                <s.Icono size={18} strokeWidth={1.9} aria-hidden="true" />
                <span className="texto-nav">{s.nombre}</span>
                {s.pronto && <span className="etiqueta-pronto">pronto</span>}
              </a>
            </li>
          ))}
        </ul>
        <div className="pie-lateral">
          <div className="botones-pie">
            <button className="boton-tema" onClick={() => setTema(t.siguiente)} title={t.nombre}>
              <t.Icono size={16} aria-hidden="true" /> <span className="texto-nav">{t.nombre}</span>
            </button>
            <a className="boton-tema" href={CORREO_SOPORTE} title="Escribir a soporte">
              <LifeBuoy size={16} aria-hidden="true" /> <span className="texto-nav">Soporte</span>
            </a>
          </div>
          <div className="usuario">
            <span className="avatar">{iniciales(sesion.nombre)}</span>
            <div>
              <strong>{sesion.nombre}</strong>
              <small>{sesion.rol || 'Entrenador principal'}</small>
            </div>
            <button className="boton-icono salir" onClick={() => { cerrarSesion(); window.location.hash = '#/' }} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17} /></button>
          </div>
          <p className="aviso-prototipo">Prototipo con datos inventados</p>
        </div>
      </nav>
      <div className="velo" onClick={() => setMenuAbierto(false)} />

      <main className="contenido">
        <div className="vista" key={ruta.join('/')}>{pantalla}</div>
      </main>
      <SelectorVariante />
    </div>
  )
}
