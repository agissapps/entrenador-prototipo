import { useMemo, useState } from 'react'
import { ALUMNOS, ESTILOS, GRUPOS, cambio, diasDesde, promedio, promedioSemanal, sesionesEntre, ultimaSesion } from '../datos.js'
import { Mini, Sello } from '../graficas.jsx'
import { dec, iniciales, relativo } from '../formato.js'

const ORDENES = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  promedio: (a, b) => (b.prom ?? -1) - (a.prom ?? -1),
  ultimo: (a, b) => a.dias - b.dias,
  cambio: (a, b) => (a.cambio ?? 0) - (b.cambio ?? 0),
}

export default function Alumnos() {
  const [busqueda, setBusqueda] = useState('')
  const [grupo, setGrupo] = useState('')
  const [estilo, setEstilo] = useState('')
  const [orden, setOrden] = useState('nombre')

  const filas = useMemo(
    () =>
      ALUMNOS.map((a) => ({
        a,
        nombre: a.nombre,
        prom: promedio(sesionesEntre(a, 30)),
        dias: diasDesde(ultimaSesion(a)?.fecha ?? new Date(0)),
        cambio: cambio(a),
        semanas: promedioSemanal(a, 12).map((s) => s.promedio),
      })),
    [],
  )

  const texto = busqueda.trim().toLowerCase()
  const visibles = filas
    .filter(({ a }) => (!texto || a.nombre.toLowerCase().includes(texto)) && (!grupo || a.grupo === grupo) && (!estilo || a.estilo === estilo))
    .sort(ORDENES[orden])

  return (
    <>
      <header className="encabezado">
        <div>
          <h1>Alumnos</h1>
          <p className="sobretitulo">{ALUMNOS.length} en el club, {visibles.length} en la lista</p>
        </div>
        <button className="boton" onClick={() => alert('En el prototipo no se agregan alumnos todavía.')}>Invitar alumno</button>
      </header>

      <div className="filtros">
        <input type="search" placeholder="Buscar por nombre" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar alumno" />
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)} aria-label="Grupo">
          <option value="">Todos los grupos</option>
          {GRUPOS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={estilo} onChange={(e) => setEstilo(e.target.value)} aria-label="Estilo">
          <option value="">Todos los arcos</option>
          {Object.entries(ESTILOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
          <option value="nombre">Ordenar por nombre</option>
          <option value="promedio">Mejor promedio</option>
          <option value="ultimo">Tiró más reciente</option>
          <option value="cambio">Los que más bajan</option>
        </select>
      </div>

      <div className="tabla-envoltura">
        <table className="tabla tabla-alumnos">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Arco</th>
              <th>Distancia</th>
              <th>Último tiro</th>
              <th className="num">Promedio 30 días</th>
              <th>12 semanas</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(({ a, prom, dias, cambio: c, semanas }, i) => (
              <tr key={a.id} style={{ '--i': Math.min(i, 12) * 30 }} onClick={() => (window.location.hash = `#/alumnos/${a.id}`)}>
                <td>
                  <a className="celda-alumno" href={`#/alumnos/${a.id}`}>
                    <span className="avatar chico">{iniciales(a.nombre)}</span>
                    <span>
                      <strong>{a.nombre}</strong>
                      <small>{a.grupo}, {a.categoria}</small>
                    </span>
                  </a>
                </td>
                <td>{ESTILOS[a.estilo]}<small className="bloque">{a.libraje} lb</small></td>
                <td>{a.distancia} m</td>
                <td className={dias >= 14 ? 'mal' : dias >= 7 ? 'aviso' : ''}>{relativo(ultimaSesion(a)?.fecha)}</td>
                <td className="num">
                  <span className="promedio-celda">
                    <Sello prom={prom} />
                    {c != null && Math.abs(c) >= 0.05 && <small className={c > 0 ? 'bien' : 'mal'}>{c > 0 ? '+' : '−'}{dec(Math.abs(c))}</small>}
                  </span>
                </td>
                <td><Mini valores={semanas} /></td>
                <td><span className={`estado ${a.pago === 'Al corriente' ? 'bien' : a.pago === 'Atrasado' ? 'mal' : 'aviso'}`}>{a.pago}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibles.length && <p className="vacio">Ningún alumno coincide con la búsqueda.</p>}
      </div>
    </>
  )
}
