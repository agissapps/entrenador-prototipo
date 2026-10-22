export default function Pronto({ nombre, Icono }) {
  return (
    <section className="pronto">
      <span className="pronto-icono" aria-hidden="true"><Icono size={34} strokeWidth={1.6} /></span>
      <h1>{nombre}</h1>
      <p>Esta sección se diseña en la siguiente vuelta del prototipo.</p>
      <a className="boton" href="#/">Volver al panel</a>
    </section>
  )
}
