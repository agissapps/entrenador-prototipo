import { useEffect, useState } from 'react'
import { LifeBuoy, Palette, X } from 'lucide-react'
import { CORREO_SOPORTE } from './comunes.jsx'

// Solo para el prototipo: prueba en vivo combinaciones de color para el menú y las portadas en
// modo día y de noche. La base (valor vacío) es la diana: menú azul y portada negra.
const BOSQUE = { id: 'bosque', nombre: 'Verde bosque', muestra: 'linear-gradient(160deg, #1f4d36, #163a29)' }
const PASTO = { id: 'pasto', nombre: 'Verde pasto', muestra: 'linear-gradient(160deg, #4aa24c, #2c6e2f)' }
const MENU = [
  { id: '', nombre: 'Azul de la diana', muestra: 'linear-gradient(160deg, #2a6bd3, #173a80)' },
  { id: 'negro', nombre: 'Negro de la diana', muestra: 'linear-gradient(160deg, #2b2b2b, #141414)' },
  BOSQUE,
  PASTO,
]
const MADERA = { id: 'madera', nombre: 'Madera de arco', muestra: 'linear-gradient(160deg, #6b4428, #2e1d12)' }
const CARBONO = { id: 'carbono', nombre: 'Carbono', muestra: 'repeating-linear-gradient(45deg, #2a2e35 0 3px, #15171b 3px 6px)' }
const ATARDECER = { id: 'atardecer', nombre: 'Atardecer de torneo', muestra: 'linear-gradient(180deg, #f08a4b, #c84b6a 45%, #5a2f7a)' }
MENU.push(MADERA, CARBONO, { id: 'petrol', nombre: 'Petrol Forest', muestra: '#203b36' }, { id: 'pizarra', nombre: 'Azul pizarra', muestra: '#28374a' }, { ...ATARDECER, muestra: 'linear-gradient(160deg, #4a2a63, #2b1b45)' })
const PORTADA = [
  { id: '', nombre: 'Negro de la diana', muestra: 'linear-gradient(160deg, #2b2b2b, #141414)' },
  { id: 'azul', nombre: 'Azul de la diana', muestra: 'linear-gradient(160deg, #2a6bd3, #173a80)' },
  BOSQUE,
  PASTO,
  { id: 'cielo', nombre: 'Cielo y pasto', muestra: 'linear-gradient(180deg, #4d9be0, #2f79c8 60%, #3b8a3e)' },
  MADERA,
  { id: 'paja', nombre: 'Paja de la diana', muestra: 'repeating-linear-gradient(78deg, #c9a45a 0 2px, #8a6a2f 2px 6px)' },
  ATARDECER,
  CARBONO,
  { id: 'cherry', nombre: 'Dark Cherry', muestra: 'linear-gradient(160deg, #a5153a, #6a0b20)' },
  { id: 'terra', nombre: 'Terra queimada', muestra: 'linear-gradient(160deg, #8a5242, #5b3329)' },
  { id: 'sala', nombre: 'Campo de sala', muestra: 'linear-gradient(180deg, #3d4e66, #2b394d 70%, #6b5a45)' },
]

// Combinaciones pensadas para la arquería: un clic pone el menú y la portada.
const COMBINACIONES = [
  { nombre: 'Diana (base)', menu: '', portada: '' },
  { nombre: 'Campo abierto', menu: 'negro', portada: 'cielo' },
  { nombre: 'Arco de madera', menu: 'madera', portada: 'paja' },
  { nombre: 'Torneo al atardecer', menu: 'atardecer', portada: 'atardecer' },
  { nombre: 'Flechas de carbono', menu: 'carbono', portada: 'sala' },
  { nombre: 'Bosque', menu: 'bosque', portada: 'bosque' },
  { nombre: 'Cherry Arrow', menu: 'petrol', portada: 'cherry', paleta: 'cherry' },
  { nombre: 'Wine Arrow', menu: 'pizarra', portada: 'terra', paleta: 'wine' },
]

function useAtributo(nombre) {
  const [valor, setValor] = useState(() => {
    try {
      return localStorage.getItem(nombre) ?? ''
    } catch {
      return ''
    }
  })
  useEffect(() => {
    if (valor) document.documentElement.setAttribute(`data-${nombre}`, valor)
    else document.documentElement.removeAttribute(`data-${nombre}`)
    try {
      localStorage.setItem(nombre, valor)
    } catch {
      // sin almacenamiento: la elección dura mientras la página está abierta
    }
  }, [nombre, valor])
  return [valor, setValor]
}

function Fila({ titulo, opciones, valor, elegir }) {
  const actual = opciones.find((o) => o.id === valor) ?? opciones[0]
  return (
    <>
      <span>{titulo}: {actual.nombre}</span>
      <ul>
        {opciones.map((o) => (
          <li key={o.id}>
            <button style={{ '--muestra': o.muestra }} aria-pressed={o.id === valor} title={o.nombre} aria-label={`${titulo}: ${o.nombre}`} onClick={() => elegir(o.id)} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default function SelectorVariante() {
  const [menu, setMenu] = useAtributo('menu')
  const [portada, setPortada] = useAtributo('portada')
  const [paleta, setPaleta] = useAtributo('paleta')
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const tecla = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierto])

  return (
    <div className="selector-raiz">
      {abierto && (
        <div className="selector-variante" role="dialog" aria-label="Probar colores">
          <div className="selector-cabeza">
            <p>Probar colores (día y noche)</p>
            <button className="selector-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar"><X size={16} /></button>
          </div>
          <div className="combinaciones">
            {COMBINACIONES.map((c) => (
              <button key={c.nombre} className={menu === c.menu && portada === c.portada && paleta === (c.paleta ?? '') ? 'activa' : ''} onClick={() => { setMenu(c.menu); setPortada(c.portada); setPaleta(c.paleta ?? '') }}>
                {c.nombre}
              </button>
            ))}
          </div>
          <Fila titulo="Menú" opciones={MENU} valor={menu} elegir={setMenu} />
          <Fila titulo="Portada" opciones={PORTADA} valor={portada} elegir={setPortada} />
        </div>
      )}
      {!abierto && (
        <a className="boton-paleta boton-soporte" href={CORREO_SOPORTE} aria-label="Escribir a soporte" data-etiqueta="Escribir a soporte">
          <LifeBuoy size={22} strokeWidth={1.9} />
        </a>
      )}
      <button className={`boton-paleta ${abierto ? 'abierto' : ''}`} onClick={() => setAbierto(!abierto)} aria-expanded={abierto} aria-label="Probar colores" data-etiqueta={abierto ? 'Cerrar colores' : 'Probar colores'}>
        <Palette size={22} strokeWidth={1.9} />
      </button>
    </div>
  )
}
