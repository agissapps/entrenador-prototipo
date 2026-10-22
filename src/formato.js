import { diasDesde } from './datos.js'

const corta = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const larga = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

export const fechaCorta = (f) => corta.format(f)
export const fechaLarga = (f) => larga.format(f)
export const pesos = (n) => `$${n.toLocaleString('es-MX')}`
export const dec = (n, d = 2) => (n == null ? '—' : n.toFixed(d))

/** «hoy», «ayer», «hace 5 días» (o «en 3 días» si es a futuro). */
export function relativo(fecha) {
  const d = diasDesde(fecha)
  if (d === 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d === -1) return 'mañana'
  return d > 0 ? `hace ${d} días` : `en ${-d} días`
}

export function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map((p) => p[0]).join('')
}
