// Movimiento compartido. Todo respeta «reducir movimiento» del sistema: ahí los números y las
// gráficas aparecen ya completos.

import { useEffect, useState } from 'react'

export const sinMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Cuenta de 0 a [valor] en [ms], frenando al final. */
export function Numero({ valor, decimales = 0, ms = 900, retardo = 0 }) {
  const [actual, setActual] = useState(sinMovimiento() ? valor : 0)
  useEffect(() => {
    if (sinMovimiento() || valor == null) {
      setActual(valor)
      return
    }
    let cuadro
    let inicio
    const paso = (t) => {
      inicio ??= t + retardo
      const p = Math.min(1, Math.max(0, (t - inicio) / ms))
      setActual(valor * (1 - (1 - p) ** 3))
      if (p < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [valor, ms, retardo])
  if (valor == null) return '—'
  return decimales ? actual.toFixed(decimales) : Math.round(actual).toLocaleString('es-MX')
}
