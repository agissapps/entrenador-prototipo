// Sesión de prueba del prototipo: dura mientras la pestaña está abierta (cada visita nueva empieza
// en la página de inicio) y no se manda a ningún lado.
// Cualquier correo y contraseña sirven; cuando haya cuentas de verdad esto se cambia.

import { useEffect, useState } from 'react'
import { CLUB } from './datos.js'

let enMemoria = null

// La versión anterior guardaba la sesión para siempre; se borra para que se vea la página de inicio.
try {
  localStorage.removeItem('sesion')
} catch {
  // sin almacenamiento
}

export function leerSesion() {
  try {
    const guardada = sessionStorage.getItem('sesion')
    return guardada ? JSON.parse(guardada) : enMemoria
  } catch {
    return enMemoria
  }
}

function avisar() {
  window.dispatchEvent(new Event('sesion'))
}

export function iniciarSesion(datos) {
  enMemoria = datos
  try {
    sessionStorage.setItem('sesion', JSON.stringify(datos))
  } catch {
    // sin almacenamiento: la sesión dura mientras la página está abierta
  }
  avisar()
}

export function cerrarSesion() {
  enMemoria = null
  try {
    sessionStorage.removeItem('sesion')
  } catch {
    // nada que borrar
  }
  avisar()
}

/** Entra como el entrenador del club de prueba y abre el panel, para enseñar la página. */
export function entrarDemo() {
  iniciarSesion({ nombre: CLUB.entrenador, correo: 'demo@diariodetiro.app', club: CLUB.nombre, rol: 'Entrenador principal', demo: true })
  window.location.hash = '#/'
}

/** La sesión actual; se actualiza sola al entrar o salir. */
export function useSesion() {
  const [sesion, setSesion] = useState(leerSesion)
  useEffect(() => {
    const cambio = () => setSesion(leerSesion())
    window.addEventListener('sesion', cambio)
    return () => window.removeEventListener('sesion', cambio)
  }, [])
  return sesion
}
