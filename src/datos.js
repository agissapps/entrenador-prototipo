// Datos inventados de un club de prueba. Todo sale de una semilla fija: cada vez que se abre la
// página se ven los mismos alumnos, con las fechas contadas desde hoy.

let semilla = 20261021
function azar() {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296
  return semilla / 4294967296
}
const entre = (a, b) => a + azar() * (b - a)
const entero = (a, b) => Math.floor(entre(a, b + 1))
const elegir = (lista) => lista[Math.floor(azar() * lista.length)]
function normal() {
  const u = Math.max(azar(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * azar())
}

export const HOY = new Date()
HOY.setHours(0, 0, 0, 0)
const DIA = 86400000
export const haceDias = (n) => new Date(HOY.getTime() - n * DIA)
export const enDias = (n) => new Date(HOY.getTime() + n * DIA)
export const diasDesde = (fecha) => Math.round((HOY - fecha) / DIA)

export const CLUB = { nombre: 'Club Arqueros del Valle', entrenador: 'Entrenador Ramírez' }

export const ESTILOS = { RECURVO: 'Recurvo', COMPUESTO: 'Compuesto', BAREBOW: 'Barebow', TRADICIONAL: 'Tradicional' }
export const GRUPOS = ['Iniciación', 'Intermedio', 'Avanzado', 'Equipo de competencia']

const NOMBRES = [
  'Sofía', 'Mateo', 'Valentina', 'Santiago', 'Regina', 'Diego', 'Camila', 'Emiliano', 'Ximena', 'Leonardo',
  'Renata', 'Sebastián', 'Mariana', 'Daniel', 'Fernanda', 'Andrés', 'Isabella', 'Iker', 'Natalia', 'Gael',
  'Paula', 'Rodrigo', 'Daniela', 'Tomás', 'Victoria', 'Julián', 'Andrea', 'Pablo', 'Lucía', 'Carlos',
  'Ana Paula', 'Joaquín', 'Elena', 'Bruno', 'Abril', 'Hugo', 'Ivanna', 'Marco', 'Julieta', 'Óscar',
]
const APELLIDOS = [
  'García', 'Hernández', 'López', 'Martínez', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Torres',
  'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Ortiz', 'Castillo', 'Mendoza',
]

// Puntos de una flecha según dónde cae, en una diana de 10 anillos (radio 1 = borde exterior).
export function valorFlecha(x, y) {
  const r = Math.hypot(x, y)
  if (r <= 0.05) return 11 // X
  if (r > 1) return 0 // M
  return 10 - Math.floor(r * 10)
}
export const puntosDe = (valor) => (valor === 11 ? 10 : valor)
export const etiqueta = (valor) => (valor === 11 ? 'X' : valor === 0 ? 'M' : String(valor))

function categoriaPorEdad(edad) {
  if (edad < 13) return 'Sub-13'
  if (edad < 15) return 'Sub-15'
  if (edad < 18) return 'Sub-18'
  if (edad < 21) return 'Sub-21'
  if (edad >= 50) return 'Master'
  return 'Abierta'
}

function crearAlumno(i) {
  const nombre = NOMBRES[i]
  const apellido = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`
  const edad = entero(10, 55)
  const estilo = elegir(['RECURVO', 'RECURVO', 'RECURVO', 'COMPUESTO', 'COMPUESTO', 'BAREBOW', 'TRADICIONAL'])
  const nivel = azar() // 0 = empieza, 1 = muy bueno
  const grupo = nivel > 0.78 ? 'Equipo de competencia' : nivel > 0.5 ? 'Avanzado' : nivel > 0.25 ? 'Intermedio' : 'Iniciación'
  const distancia = estilo === 'COMPUESTO' ? (nivel > 0.5 ? 50 : 30) : nivel > 0.78 ? 70 : nivel > 0.5 ? 50 : nivel > 0.25 ? 30 : 18
  const libraje = estilo === 'COMPUESTO' ? entero(40, 60) : Math.round(18 + nivel * 22 + (edad > 16 ? 4 : 0))

  // Cómo tira: dispersión (más chica = mejor), hacia dónde se le cargan las flechas y si mejora o empeora.
  const dispersion = 0.42 - nivel * 0.3
  const sesgo = { x: normal() * 0.08, y: normal() * 0.08 }
  const tendencia = elegir([-1, 0, 1, 1]) * entre(0.0004, 0.0016) // cambio de dispersión por día
  const diasSinTirar = azar() < 0.18 ? entero(8, 30) : entero(0, 4)
  const frecuencia = 2 + Math.round(nivel * 3) // sesiones por semana

  const sesiones = []
  for (let d = 120; d >= diasSinTirar; d--) {
    if (azar() > frecuencia / 7) continue
    const fecha = haceDias(d)
    const competencia = azar() < 0.08
    const tandas = competencia ? 12 : entero(6, 12)
    const porTanda = distancia === 18 ? 3 : 6
    const disp = Math.max(0.08, dispersion + tendencia * (d - 60))
    const flechas = []
    for (let t = 0; t < tandas * porTanda; t++) {
      const x = sesgo.x + normal() * disp
      const y = sesgo.y + normal() * disp
      flechas.push({ x: +x.toFixed(3), y: +y.toFixed(3), v: valorFlecha(x, y) })
    }
    const total = flechas.reduce((s, f) => s + puntosDe(f.v), 0)
    sesiones.push({
      id: `${i}-${d}`,
      fecha,
      tipo: competencia ? 'Competencia' : 'Entrenamiento',
      distancia,
      diana: distancia === 18 ? '40 cm triple' : distancia >= 50 ? '122 cm' : '80 cm',
      porTanda,
      flechas,
      total,
      maximo: flechas.length * 10,
      promedio: total / flechas.length,
      duracionMin: entero(40, 120),
    })
  }

  const pagoAzar = azar()
  const pago = pagoAzar < 0.14 ? 'Atrasado' : pagoAzar < 0.3 ? 'Pendiente' : 'Al corriente'
  const menor = edad < 18

  return {
    id: String(i + 1),
    nombre: `${nombre} ${apellido}`,
    nombreCorto: `${nombre} ${apellido.split(' ')[0]}`,
    edad,
    categoria: categoriaPorEdad(edad),
    menor,
    tutor: menor ? `${elegir(['Mamá', 'Papá'])}: ${elegir(NOMBRES)} ${apellido.split(' ')[0]}` : null,
    telefono: `55 ${entero(1000, 9999)} ${entero(1000, 9999)}`,
    estilo,
    mano: azar() < 0.88 ? 'Diestro' : 'Zurdo',
    grupo,
    distancia,
    libraje,
    arco: estilo === 'COMPUESTO' ? elegir(['Hoyt RX-7', 'Mathews TRX 38', 'PSE Dominator']) : elegir(['Hoyt Formula Xi', 'Win&Win Wiawis ATF-X', 'Kinetic Sovren', 'Samick Sage']),
    flechas: elegir(['Easton X10 · spine 600', 'Easton ACE · spine 720', 'Gold Tip Pierce · spine 500', 'Easton Inspire · spine 1000']),
    pago,
    mensualidad: 850,
    alta: haceDias(entero(150, 900)),
    sesiones,
  }
}

export const ALUMNOS = NOMBRES.map((_, i) => crearAlumno(i))
export const alumnoPorId = (id) => ALUMNOS.find((a) => a.id === id)

// ---------- Cálculos sobre las sesiones ----------

export function sesionesEntre(alumno, desde, hasta = 0) {
  return alumno.sesiones.filter((s) => {
    const d = diasDesde(s.fecha)
    return d < desde && d >= hasta
  })
}

export function promedio(sesiones) {
  const flechas = sesiones.reduce((s, x) => s + x.flechas.length, 0)
  if (!flechas) return null
  return sesiones.reduce((s, x) => s + x.total, 0) / flechas
}

export const flechasDe = (sesiones) => sesiones.reduce((s, x) => s + x.flechas.length, 0)

export function ultimaSesion(alumno) {
  return alumno.sesiones[alumno.sesiones.length - 1] ?? null
}

/** Diferencia de promedio: últimos 30 días contra los 30 anteriores. */
export function cambio(alumno) {
  const ahora = promedio(sesionesEntre(alumno, 30))
  const antes = promedio(sesionesEntre(alumno, 60, 30))
  if (ahora == null || antes == null) return null
  return ahora - antes
}

/** Promedio de cada una de las últimas [semanas] semanas (null si no tiró). */
export function promedioSemanal(alumno, semanas = 16) {
  const r = []
  for (let w = semanas - 1; w >= 0; w--) {
    const s = sesionesEntre(alumno, (w + 1) * 7, w * 7)
    r.push({ semana: w, promedio: promedio(s), flechas: flechasDe(s) })
  }
  return r
}

/** Qué tan pareja es: desviación de los totales por tanda (más bajo = más constante). */
export function constancia(sesiones) {
  const tandas = []
  for (const s of sesiones) {
    for (let i = 0; i < s.flechas.length; i += s.porTanda) {
      tandas.push(s.flechas.slice(i, i + s.porTanda).reduce((a, f) => a + puntosDe(f.v), 0) / s.porTanda)
    }
  }
  if (tandas.length < 2) return null
  const m = tandas.reduce((a, b) => a + b, 0) / tandas.length
  return Math.sqrt(tandas.reduce((a, b) => a + (b - m) ** 2, 0) / tandas.length)
}

// ---------- Metas ----------

function crearMetas(a) {
  const prom = promedio(sesionesEntre(a, 30)) ?? 6
  const metas = [
    { tipo: 'Puntos', texto: `Promedio de ${(Math.min(9.6, prom + 0.6)).toFixed(1)} por flecha`, actual: prom, objetivo: Math.min(9.6, prom + 0.6), unidad: 'pts', auto: true, vence: enDias(entero(5, 60)) },
    { tipo: 'Volumen', texto: 'Tirar 600 flechas este mes', actual: flechasDe(sesionesEntre(a, 30)), objetivo: 600, unidad: 'flechas', auto: true, vence: enDias(entero(3, 25)) },
  ]
  if (a.distancia < 70 && a.estilo !== 'COMPUESTO') {
    const siguiente = { 18: 30, 30: 50, 50: 70 }[a.distancia]
    metas.push({ tipo: 'Distancia', texto: `Pasar de ${a.distancia} m a ${siguiente} m`, actual: a.distancia, objetivo: siguiente, unidad: 'm', auto: true, vence: enDias(entero(30, 120)) })
  }
  metas.push({ tipo: 'Libraje', texto: `Subir a ${a.libraje + 2} lb`, actual: a.libraje, objetivo: a.libraje + 2, unidad: 'lb', auto: true, vence: enDias(entero(20, 90)) })
  const seg = entero(10, 28)
  metas.push({ tipo: 'Fuerza', texto: 'Sostener el anclaje 30 s (3 series)', actual: seg, objetivo: 30, unidad: 's', auto: false, vence: enDias(entero(10, 50)) })
  const rep = entero(6, 18)
  metas.push({ tipo: 'Resistencia', texto: 'Remo con mancuerna 5 kg: 20 repeticiones', actual: rep, objetivo: 20, unidad: 'rep', auto: false, vence: enDias(entero(10, 50)) })
  return metas
}
export const METAS = Object.fromEntries(ALUMNOS.map((a) => [a.id, crearMetas(a)]))

// ---------- Notas del entrenador ----------

const TEXTOS_NOTA = [
  'Se le baja el codo del brazo de arco al final del tensado. Trabajar con banda elástica.',
  'Muy buena actitud en la clase. Le cuesta mantener el ritmo en las últimas tandas.',
  'Las flechas se le cargan a la izquierda: revisar la mano del arco y el plunger.',
  'Comentó molestia en el hombro derecho. Bajar volumen esta semana y valorar con fisio.',
  'Mejoró mucho el anclaje. Ya puede probar a la siguiente distancia.',
  'Se pone nervioso en competencia. Platicar con la psicóloga antes del próximo torneo.',
  'Cambió el reposaflechas; volver a ajustar la mira.',
  'Le cuesta la suelta limpia: practicar con los ojos cerrados a 5 m.',
]
export const NOTAS = Object.fromEntries(
  ALUMNOS.map((a) => [a.id, Array.from({ length: entero(1, 3) }, () => ({ fecha: haceDias(entero(1, 60)), texto: elegir(TEXTOS_NOTA) })).sort((x, y) => y.fecha - x.fecha)]),
)

// ---------- Pagos ----------

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const PAGOS = Object.fromEntries(
  ALUMNOS.map((a) => {
    const lista = []
    for (let m = 0; m < 4; m++) {
      const fecha = new Date(HOY.getFullYear(), HOY.getMonth() - m, 5)
      const pagado = m > 0 || a.pago === 'Al corriente'
      const atrasado = m === 1 && a.pago === 'Atrasado'
      lista.push({ concepto: `Mensualidad de ${MESES[fecha.getMonth()]}`, monto: a.mensualidad, fecha, estado: atrasado ? 'Atrasado' : pagado ? 'Pagado' : 'Pendiente' })
    }
    if (a.grupo === 'Equipo de competencia') lista.splice(1, 0, { concepto: 'Inscripción Copa Regional', monto: 600, fecha: haceDias(12), estado: 'Pagado' })
    return [a.id, lista]
  }),
)

// ---------- Torneos ----------

const equipo = ALUMNOS.filter((a) => a.grupo === 'Equipo de competencia')
export const TORNEOS = [
  { id: 't1', nombre: 'Copa Regional de Sala', fecha: enDias(9), sede: 'Polideportivo Norte', tipo: 'Externo', distancias: '18 m', inscripcionHasta: enDias(3), costo: 600, alumnos: equipo.slice(0, 5).map((a) => a.id) },
  { id: 't2', nombre: 'Torneo interno de otoño', fecha: enDias(16), sede: 'Campo del club', tipo: 'Interno', distancias: '18, 30 y 50 m', inscripcionHasta: enDias(12), costo: 0, alumnos: ALUMNOS.slice(0, 22).map((a) => a.id) },
  { id: 't3', nombre: 'Campeonato Estatal al Aire Libre', fecha: enDias(37), sede: 'Unidad Deportiva Sur', tipo: 'Externo', distancias: '50 y 70 m', inscripcionHasta: enDias(20), costo: 900, alumnos: equipo.map((a) => a.id) },
]

// ---------- Agenda: citas, eventos y clases ----------

const psico = ALUMNOS.filter((a) => a.grupo === 'Equipo de competencia').slice(0, 3)
export const AGENDA = [
  { id: 'c1', tipo: 'Psicología', titulo: 'Manejo de nervios en competencia', fecha: enDias(1), hora: '17:00', con: 'Psic. Laura Méndez', alumnos: psico.map((a) => a.id) },
  { id: 'c2', tipo: 'Fisioterapia', titulo: 'Revisión de hombro', fecha: enDias(2), hora: '10:30', con: 'Ft. Jorge Salas', alumnos: [ALUMNOS[3].id] },
  { id: 'c3', tipo: 'Capacitación', titulo: 'Clínica de afinación de arco', fecha: enDias(4), hora: '09:00', con: 'Club', alumnos: ALUMNOS.filter((a) => a.grupo !== 'Iniciación').map((a) => a.id) },
  { id: 'c4', tipo: 'Clase', titulo: 'Clase de técnica: anclaje y suelta', fecha: enDias(0), hora: '16:00', con: 'Entrenador Ramírez', alumnos: ALUMNOS.filter((a) => a.grupo === 'Intermedio').map((a) => a.id) },
  { id: 'c5', tipo: 'Fisioterapia', titulo: 'Valoración de espalda', fecha: enDias(6), hora: '12:00', con: 'Ft. Jorge Salas', alumnos: [ALUMNOS[11].id, ALUMNOS[20].id] },
  { id: 'c6', tipo: 'Junta', titulo: 'Junta con padres del equipo', fecha: enDias(5), hora: '19:00', con: 'Club', alumnos: ALUMNOS.filter((a) => a.menor && a.grupo !== 'Iniciación').map((a) => a.id) },
]

// ---------- Entrenamientos: plantillas y clases programadas ----------

/** Tipos de bloque de una clase, en el orden en que suelen ir. */
export const TIPOS_BLOQUE = {
  calentamiento: 'Calentamiento',
  tecnica: 'Técnica',
  tiro: 'Tiro',
  fisico: 'Físico',
  enfriamiento: 'Enfriamiento',
}

export const PLANTILLAS = [
  {
    id: 'p1',
    nombre: 'Técnica de anclaje',
    objetivo: 'Anclaje firme y el mismo en cada flecha',
    bloques: [
      { tipo: 'calentamiento', texto: 'Movilidad de hombros y banda elástica', minutos: 10 },
      { tipo: 'tecnica', texto: 'Tensado con banda frente al espejo, pausa de 3 s en el anclaje', minutos: 15 },
      { tipo: 'tiro', distancia: 18, tandas: 10, flechas: 3, texto: 'Sin mirar la diana las primeras 3 tandas' },
      { tipo: 'enfriamiento', texto: 'Estiramientos', minutos: 5 },
    ],
  },
  {
    id: 'p2',
    nombre: 'Volumen para competencia',
    objetivo: 'Aguantar 72 flechas con la misma calidad',
    bloques: [
      { tipo: 'calentamiento', texto: 'Movilidad y 2 tandas de calentamiento a 18 m', minutos: 15 },
      { tipo: 'tiro', distancia: 70, tandas: 12, flechas: 6, texto: 'Ronda completa con cronómetro de 4 min' },
      { tipo: 'fisico', texto: 'Sostener el anclaje con el arco', series: 3, repeticiones: '30 s' },
    ],
  },
  {
    id: 'p3',
    nombre: 'Fuerza y resistencia',
    objetivo: 'Subir libraje sin perder técnica',
    bloques: [
      { tipo: 'calentamiento', texto: 'Movilidad de hombros', minutos: 10 },
      { tipo: 'fisico', texto: 'Remo con mancuerna 5 kg', series: 4, repeticiones: '15' },
      { tipo: 'fisico', texto: 'Plancha', series: 3, repeticiones: '45 s' },
      { tipo: 'tiro', distancia: 30, tandas: 6, flechas: 6, texto: 'Con el libraje nuevo' },
    ],
  },
  {
    id: 'p4',
    nombre: 'Primera clase',
    objetivo: 'Seguridad en la línea y postura básica',
    bloques: [
      { tipo: 'tecnica', texto: 'Reglas de seguridad y postura en T', minutos: 20 },
      { tipo: 'tiro', distancia: 10, tandas: 6, flechas: 3, texto: 'Con arco de 18 lb' },
    ],
  },
]

/** Clases de dos días atrás a cinco días adelante; las pasadas traen quién la marcó como hecha. */
function crearClases() {
  const plan = [
    [-2, 'Intermedio', 'p1'], [-2, 'Equipo de competencia', 'p2'],
    [-1, 'Iniciación', 'p4'], [-1, 'Avanzado', 'p3'],
    [0, 'Intermedio', 'p1'], [0, 'Equipo de competencia', 'p2'],
    [1, 'Avanzado', 'p1'], [2, 'Equipo de competencia', 'p3'], [2, 'Iniciación', 'p4'],
    [3, 'Intermedio', 'p3'], [4, 'Equipo de competencia', 'p2'], [5, 'Avanzado', 'p2'],
  ]
  return plan.map(([dia, grupo, plantilla], i) => {
    const alumnos = ALUMNOS.filter((a) => a.grupo === grupo).map((a) => a.id)
    const hechos = dia < 0 ? alumnos.filter(() => azar() < 0.72) : dia === 0 ? alumnos.filter(() => azar() < 0.3) : []
    return { id: `k${i}`, fecha: enDias(dia), hora: grupo === 'Equipo de competencia' ? '07:00' : '16:00', grupo, plantilla, alumnos, hechos, mandada: dia <= 0 }
  })
}
export const CLASES = crearClases()
export const plantillaPorId = (id) => PLANTILLAS.find((p) => p.id === id)
