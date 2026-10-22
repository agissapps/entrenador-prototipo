import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas: así la página funciona igual en GitHub Pages (que la sirve dentro de
  // /entrenador-prototipo/) que en la computadora.
  base: './',
})
