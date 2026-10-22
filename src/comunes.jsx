// Piezas que comparten varias pantallas.

import { useRef, useState } from 'react'
import { Check } from 'lucide-react'

/** Abre el correo del usuario con el soporte de la app ya puesto (el mismo de los términos y la privacidad). */
export const CORREO_SOPORTE = `mailto:agiss.apps@gmail.com?subject=${encodeURIComponent('Soporte: Diario de Tiro Entrenador')}`

/** Aviso que sale abajo unos segundos para confirmar algo («Pago registrado»). */
export function useAviso() {
  const [texto, setTexto] = useState(null)
  const reloj = useRef(null)
  const avisar = (t) => {
    clearTimeout(reloj.current)
    setTexto(t)
    reloj.current = setTimeout(() => setTexto(null), 3200)
  }
  const aviso = texto && (
    <div className="aviso-flotante" role="status">
      <Check size={18} aria-hidden="true" /> {texto}
    </div>
  )
  return [aviso, avisar]
}

/** Pestañas de una pantalla: una fila de botones que dejan ver una sección a la vez. */
export function Pestanas({ opciones, valor, cambiar }) {
  return (
    <div className="segmentos" role="tablist">
      {opciones.map(([id, nombre]) => (
        <button key={id} role="tab" aria-selected={valor === id} className={valor === id ? 'activo' : ''} onClick={() => cambiar(id)}>
          {nombre}
        </button>
      ))}
    </div>
  )
}

/** Hasta [max] avatares encimados y un «+N» con los que no caben. */
export function Avatares({ nombres, max = 5 }) {
  return (
    <span className="avatares">
      {nombres.slice(0, max).map((n) => (
        <span key={n} className="avatar chico" title={n}>{n.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span>
      ))}
      {nombres.length > max && <span className="avatar chico mas">+{nombres.length - max}</span>}
    </span>
  )
}
