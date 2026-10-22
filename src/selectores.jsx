// Selectores de fecha y hora con su propio desplegable, en lugar de los del navegador. Guardan el
// valor en un input escondido con [name], así los formularios los leen igual que antes
// (fecha «aaaa-mm-dd», hora «hh:mm»). Funcionan controlados (value + onChange) o solos (defaultValue).

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Minus, Moon, Plus, Sun, Sunrise } from 'lucide-react'
import { HOY } from './datos.js'
import './selectores.css'

const SEMANA = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const nombreMes = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })
const fechaBoton = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
const fechaBotonAnio = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const fechaLarga = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

export const aISO = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`
const deISO = (s) => (s ? new Date(`${s}T00:00`) : null)
const mismoDia = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const sumarDias = (f, n) => new Date(f.getFullYear(), f.getMonth(), f.getDate() + n)

/** Valor controlado o propio, y un cerrar-al-tocar-fuera para el desplegable. */
function useDesplegable(value, defaultValue, onChange) {
  const [propio, setPropio] = useState(defaultValue)
  const [abierto, setAbierto] = useState(false)
  const [aDerecha, setADerecha] = useState(false)
  const caja = useRef(null)
  const valor = value !== undefined ? value : propio
  const poner = (v) => {
    if (value === undefined) setPropio(v)
    onChange?.(v)
  }
  useEffect(() => {
    if (!abierto) return
    // Si no cabe hacia la derecha, el desplegable se alinea al borde derecho del campo.
    setADerecha(caja.current.getBoundingClientRect().left + 340 > window.innerWidth)
    const fuera = (e) => !caja.current?.contains(e.target) && setAbierto(false)
    const tecla = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])
  return { valor, poner, abierto, setAbierto, caja, aDerecha }
}

export function CampoFecha({ name, value, defaultValue, onChange, etiqueta = 'Elegir fecha' }) {
  const { valor, poner, abierto, setAbierto, caja, aDerecha } = useDesplegable(value, defaultValue ?? aISO(HOY), onChange)
  const elegida = deISO(valor)
  const [mes, setMes] = useState(() => {
    const base = elegida ?? HOY
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  function abrir() {
    if (!abierto && elegida) setMes(new Date(elegida.getFullYear(), elegida.getMonth(), 1))
    setAbierto(!abierto)
  }
  function elegir(f) {
    poner(aISO(f))
    setAbierto(false)
  }

  const inicio = new Date(mes)
  inicio.setDate(1 - ((mes.getDay() + 6) % 7))
  const dias = Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i))
  const proximoLunes = sumarDias(HOY, ((8 - HOY.getDay()) % 7) || 7)
  const rapidos = [['Hoy', HOY], ['Mañana', sumarDias(HOY, 1)], ['Próximo lunes', proximoLunes], ['En una semana', sumarDias(HOY, 7)]]

  return (
    <span className="selector" ref={caja} onClick={(e) => e.preventDefault()}>
      {name && <input type="hidden" name={name} value={valor ?? ''} />}
      <button type="button" className={`selector-boton ${abierto ? 'abierto' : ''}`} onClick={abrir} aria-haspopup="dialog" aria-expanded={abierto} aria-label={`${etiqueta}: ${elegida ? fechaLarga.format(elegida) : 'sin elegir'}`}>
        <CalendarDays size={17} aria-hidden="true" />
        <span>{elegida ? (elegida.getFullYear() === HOY.getFullYear() ? fechaBoton : fechaBotonAnio).format(elegida).replace(/\./g, '') : 'Elegir fecha'}</span>
      </button>
      {abierto && (
        <div className={`selector-desplegable calendario-chico ${aDerecha ? 'a-derecha' : ''}`} role="dialog" aria-label={etiqueta}>
          <div className="rapidos">
            {rapidos.map(([t, f]) => (
              <button type="button" key={t} className={mismoDia(f, elegida) ? 'elegido' : ''} onClick={() => elegir(f)}>{t}</button>
            ))}
          </div>
          <div className="calendario-chico-cabeza">
            <button type="button" className="icono-chico" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
            <strong>{nombreMes.format(mes)}</strong>
            <button type="button" className="icono-chico" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
          </div>
          <div className="calendario-chico-rejilla">
            {SEMANA.map((d) => <span key={d} className="dia-semana">{d}</span>)}
            {dias.map((d) => (
              <button
                type="button"
                key={d.toISOString()}
                className={`dia-boton ${d.getMonth() !== mes.getMonth() ? 'fuera' : ''} ${mismoDia(d, HOY) ? 'hoy' : ''} ${mismoDia(d, elegida) ? 'elegido' : ''} ${d < HOY && !mismoDia(d, HOY) ? 'pasado' : ''}`}
                onClick={() => elegir(d)}
                aria-label={fechaLarga.format(d)}
                aria-pressed={mismoDia(d, elegida)}
              >
                {d.getDate()}
              </button>
            ))}
          </div>
          {elegida && <p className="selector-pie">{fechaLarga.format(elegida)}</p>}
        </div>
      )}
    </span>
  )
}

const FRANJAS = [
  { nombre: 'Mañana', Icono: Sunrise, desde: 6, hasta: 11 },
  { nombre: 'Tarde', Icono: Sun, desde: 12, hasta: 18 },
  { nombre: 'Noche', Icono: Moon, desde: 19, hasta: 22 },
]
const dosCifras = (n) => String(n).padStart(2, '0')
const partes = (v) => (v ? v.split(':').map(Number) : [17, 0])
const doce = (h, m) => `${((h + 11) % 12) + 1}:${dosCifras(m)} ${h < 12 ? 'a. m.' : 'p. m.'}`

export function CampoHora({ name, value, defaultValue, onChange, etiqueta = 'Elegir hora' }) {
  const { valor, poner, abierto, setAbierto, caja, aDerecha } = useDesplegable(value, defaultValue ?? '17:00', onChange)
  const [h, m] = partes(valor)
  const fijar = (hh, mm) => poner(`${dosCifras((hh + 24) % 24)}:${dosCifras((mm + 60) % 60)}`)

  return (
    <span className="selector" ref={caja} onClick={(e) => e.preventDefault()}>
      {name && <input type="hidden" name={name} value={valor ?? ''} />}
      <button type="button" className={`selector-boton ${abierto ? 'abierto' : ''}`} onClick={() => setAbierto(!abierto)} aria-haspopup="dialog" aria-expanded={abierto} aria-label={`${etiqueta}: ${doce(h, m)}`}>
        <Clock size={17} aria-hidden="true" />
        <span>{dosCifras(h)}:{dosCifras(m)}</span>
        <small>{h < 12 ? 'a. m.' : 'p. m.'}</small>
      </button>
      {abierto && (
        <div className={`selector-desplegable reloj ${aDerecha ? 'a-derecha' : ''}`} role="dialog" aria-label={etiqueta}>
          <div className="reloj-ajuste">
            <div className="girador">
              <button type="button" onClick={() => fijar(h + 1, m)} aria-label="Una hora más"><Plus size={16} /></button>
              <b>{dosCifras(h)}</b>
              <button type="button" onClick={() => fijar(h - 1, m)} aria-label="Una hora menos"><Minus size={16} /></button>
            </div>
            <span className="dos-puntos">:</span>
            <div className="girador">
              <button type="button" onClick={() => fijar(h, m + 5)} aria-label="Cinco minutos más"><Plus size={16} /></button>
              <b>{dosCifras(m)}</b>
              <button type="button" onClick={() => fijar(h, m - 5)} aria-label="Cinco minutos menos"><Minus size={16} /></button>
            </div>
            <span className="reloj-doce">{doce(h, m)}</span>
          </div>
          {FRANJAS.map(({ nombre, Icono, desde, hasta }) => (
            <div key={nombre} className="franja">
              <span className="franja-nombre"><Icono size={14} aria-hidden="true" /> {nombre}</span>
              <div className="franja-horas">
                {Array.from({ length: (hasta - desde + 1) * 2 }, (_, i) => {
                  const hh = desde + Math.floor(i / 2)
                  const mm = (i % 2) * 30
                  const texto = `${dosCifras(hh)}:${dosCifras(mm)}`
                  return (
                    <button type="button" key={texto} className={texto === valor ? 'elegido' : ''} onClick={() => { poner(texto); setAbierto(false) }}>
                      {texto}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <button type="button" className="boton chico listo" onClick={() => setAbierto(false)}>Listo</button>
        </div>
      )}
    </span>
  )
}
