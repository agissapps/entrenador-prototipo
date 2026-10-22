import { useEffect, useState } from 'react'
import { CalendarDays, Dumbbell, LayoutDashboard, Menu, Moon, Sun, SunMoon, Target, Trophy, Users, Wallet } from 'lucide-react'
import { CLUB } from './datos.js'
import Panel from './pantallas/Panel.jsx'
import Alumnos from './pantallas/Alumnos.jsx'
import Perfil from './pantallas/Perfil.jsx'
import Entrenamientos from './pantallas/Entrenamientos.jsx'
import Pronto from './pantallas/Pronto.jsx'
import SelectorVariante from './SelectorVariante.jsx'

// Secciones del menú. Las que aún no se hacen muestran una página de «próximamente».
const SECCIONES = [
  { ruta: '', nombre: 'Panel', Icono: LayoutDashboard },
  { ruta: 'alumnos', nombre: 'Alumnos', Icono: Users },
  { ruta: 'entrenamientos', nombre: 'Entrenamientos', Icono: Dumbbell },
  { ruta: 'metas', nombre: 'Metas', Icono: Target, pronto: true },
  { ruta: 'torneos', nombre: 'Torneos', Icono: Trophy, pronto: true },
  { ruta: 'agenda', nombre: 'Agenda', Icono: CalendarDays, pronto: true },
  { ruta: 'pagos', nombre: 'Pagos', Icono: Wallet, pronto: true },
]

const TEMAS = {
  auto: { siguiente: 'dark', nombre: 'Tema automático', Icono: SunMoon },
  dark: { siguiente: 'light', nombre: 'Tema de noche', Icono: Moon },
  light: { siguiente: 'auto', nombre: 'Tema de día', Icono: Sun },
}

function rutaActual() {
  return window.location.hash.replace(/^#\/?/, '').split('/')
}

export default function App() {
  const [ruta, setRuta] = useState(rutaActual)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem('tema') ?? 'auto'
    } catch {
      return 'auto'
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
    if (tema === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', tema)
    try {
      localStorage.setItem('tema', tema)
    } catch {
      // sin almacenamiento: el tema solo dura mientras la página está abierta
    }
  }, [tema])

  const [seccion, id] = ruta
  const actual = SECCIONES.find((s) => s.ruta === seccion) ?? SECCIONES[0]

  let pantalla
  if (seccion === 'alumnos' && id) pantalla = <Perfil id={id} />
  else if (seccion === 'alumnos') pantalla = <Alumnos />
  else if (seccion === 'entrenamientos') pantalla = <Entrenamientos />
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
        <div className="marca">
          <span className="logo" aria-hidden="true">
            <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#FAFAFA" /><circle cx="16" cy="16" r="12" fill="#1E1E1E" /><circle cx="16" cy="16" r="9" fill="#2462C6" /><circle cx="16" cy="16" r="6" fill="#D7372F" /><circle cx="16" cy="16" r="3" fill="#F2B705" /></svg>
          </span>
          <div>
            <strong>Diario de Tiro</strong>
            <small>{CLUB.nombre}</small>
          </div>
        </div>
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
          <button className="boton-tema" onClick={() => setTema(t.siguiente)}>
            <t.Icono size={16} aria-hidden="true" /> <span className="texto-nav">{t.nombre}</span>
          </button>
          <div className="usuario">
            <span className="avatar">ER</span>
            <div>
              <strong>{CLUB.entrenador}</strong>
              <small>Entrenador principal</small>
            </div>
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
