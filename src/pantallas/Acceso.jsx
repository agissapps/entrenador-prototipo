import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Construction, Eye, EyeOff, LogIn, ShieldAlert, UserPlus } from 'lucide-react'
import { CLUB } from '../datos.js'
import { entrarDemo, iniciarSesion } from '../sesion.js'
import { Logo } from './Landing.jsx'
import './acceso.css'

const ROLES = ['Entrenador principal', 'Entrenador auxiliar']
const TAMANOS = ['Menos de 20', 'De 20 a 50', 'De 50 a 150', 'Más de 150']

function Contrasena({ name, autoComplete }) {
  const [ver, setVer] = useState(false)
  return (
    <span className="contrasena">
      <input name={name} type={ver ? 'text' : 'password'} required minLength={6} autoComplete={autoComplete} placeholder="Mínimo 6 caracteres" />
      <button type="button" className="icono-chico" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
        {ver ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </span>
  )
}

/** Aviso de que crear cuentas aún no funciona: la página es una demostración. */
function AvisoDemo({ cerrar }) {
  const primero = useRef(null)
  useEffect(() => {
    primero.current?.focus()
    const tecla = (e) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [cerrar])
  return (
    <div className="aviso-demo-fondo" onClick={cerrar}>
      <div className="aviso-demo" role="alertdialog" aria-modal="true" aria-labelledby="aviso-demo-titulo" aria-describedby="aviso-demo-texto" onClick={(e) => e.stopPropagation()}>
        <span className="aviso-demo-icono" aria-hidden="true"><Construction size={28} /></span>
        <h2 id="aviso-demo-titulo">Esta es una página de demostración</h2>
        <p id="aviso-demo-texto">Crear cuentas todavía no está en uso. Mientras tanto, puedes recorrer toda la página con el club de prueba.</p>
        <div className="acciones">
          <button ref={primero} className="boton oro" onClick={entrarDemo}>Ver la demo</button>
          <button className="boton secundario" onClick={cerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

/** Iniciar sesión y crear cuenta. Es de prueba: cualquier dato sirve y nada sale del navegador. */
export default function Acceso({ modo }) {
  const registro = modo === 'registro'
  const [olvido, setOlvido] = useState(false)
  const [avisoDemo, setAvisoDemo] = useState(false)

  function enviar(e) {
    e.preventDefault()
    // Crear cuentas aún no funciona: se avisa en lugar de registrar.
    if (registro) {
      setAvisoDemo(true)
      return
    }
    const f = new FormData(e.target)
    const correo = f.get('correo')
    const nombre = registro ? f.get('nombre') : correo.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    iniciarSesion({
      nombre: nombre || CLUB.entrenador,
      correo,
      club: registro ? f.get('club') : '',
      rol: registro ? f.get('rol') : 'Entrenador principal',
    })
    window.location.hash = '#/'
  }

  return (
    <div className="acceso">
      <aside className="acceso-lado">
        <svg className="acceso-anillos" viewBox="0 0 400 400" aria-hidden="true">
          {[190, 160, 130, 100, 70, 40].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        </svg>
        <a className="acceso-marca" href="#/inicio"><Logo /> Diario de Tiro</a>
        <div className="acceso-mensaje">
          <h2>{registro ? 'Lleva a tu club desde un solo lugar.' : 'Tu club te está esperando.'}</h2>
          <p>Promedios, metas, clases, torneos y pagos de tus alumnos, con los datos que ellos registran en la app.</p>
        </div>
        <ul className="acceso-puntos">
          <li>Gratis mientras es prototipo</li>
          <li>Funciona en computadora y en celular</li>
          <li>Tus alumnos usan la app Diario de Tiro</li>
        </ul>
      </aside>

      <main className="acceso-forma">
        <a className="volver-inicio" href="#/inicio"><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</a>
        <div className="acceso-caja">
          <h1>{registro ? 'Crear cuenta' : olvido ? 'Recuperar contraseña' : 'Iniciar sesión'}</h1>
          <p className="sobretitulo">
            {registro ? <>¿Ya tienes cuenta? <a href="#/entrar">Inicia sesión</a></> : <>¿Aún no tienes cuenta? <a href="#/registro">Crea una gratis</a></>}
          </p>

          <p className="aviso-prueba"><ShieldAlert size={17} aria-hidden="true" /> Es un prototipo: cualquier correo sirve y nada se manda. No uses tu contraseña real.</p>

          {olvido ? (
            <form className="acceso-campos" onSubmit={(e) => { e.preventDefault(); setOlvido('enviado') }}>
              {olvido === 'enviado' ? (
                <p className="vacio">Listo. Cuando las cuentas sean reales, aquí llegará un correo para cambiar tu contraseña.</p>
              ) : (
                <label className="campo">Correo<input name="correo" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com" /></label>
              )}
              <div className="acciones">
                {olvido !== 'enviado' && <button className="boton oro" type="submit">Mandar instrucciones</button>}
                <button type="button" className="boton secundario" onClick={() => setOlvido(false)}>Volver</button>
              </div>
            </form>
          ) : (
            <>
              <button type="button" className="boton secundario ancho google" onClick={registro ? () => setAvisoDemo(true) : entrarDemo}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" /></svg>
                {registro ? 'Crear cuenta con Google' : 'Entrar con Google'}
              </button>
              <div className="separador"><span>o con tu correo</span></div>

              <form className="acceso-campos" onSubmit={enviar}>
                {registro && (
                  <>
                    <label className="campo">Tu nombre<input name="nombre" required autoComplete="name" placeholder="Ej. Laura Martínez" /></label>
                    <label className="campo">Nombre del club<input name="club" required placeholder="Ej. Arqueros del Valle" /></label>
                    <div className="acceso-fila">
                      <label className="campo">Tu papel<select name="rol">{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
                      <label className="campo">Alumnos<select name="tamano">{TAMANOS.map((t) => <option key={t}>{t}</option>)}</select></label>
                    </div>
                  </>
                )}
                <label className="campo">Correo<input name="correo" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com" /></label>
                <label className="campo">
                  <span className="campo-cabeza">Contraseña {!registro && <button type="button" className="enlace" onClick={() => setOlvido(true)}>¿La olvidaste?</button>}</span>
                  <Contrasena name="contrasena" autoComplete={registro ? 'new-password' : 'current-password'} />
                </label>
                {registro && (
                  <label className="aceptar"><input type="checkbox" required /> Acepto los términos y el aviso de privacidad.</label>
                )}
                <button className="boton oro ancho" type="submit">
                  {registro ? <><UserPlus size={18} aria-hidden="true" /> Crear cuenta</> : <><LogIn size={18} aria-hidden="true" /> Entrar</>}
                </button>
              </form>

              <button type="button" className="enlace demo" onClick={entrarDemo}>Solo quiero ver la demo del club de prueba</button>
            </>
          )}
        </div>
      </main>
      {avisoDemo && <AvisoDemo cerrar={() => setAvisoDemo(false)} />}
    </div>
  )
}
