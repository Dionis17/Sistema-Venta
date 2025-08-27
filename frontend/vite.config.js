import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // expone en todas las interfaces de red
    port: 5173        // puedes cambiarlo si quieres otro puerto
  }
})
