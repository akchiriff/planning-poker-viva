import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// ⚠️ Cambia 'planning-poker-viva' por el nombre exacto de tu repo en GitHub
export default defineConfig({ plugins: [react()], base: '/planning-poker-viva/' })
export default {
  base: '/planning-poker-viva/',
}

