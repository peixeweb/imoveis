import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        if (!url.includes('.') && !url.startsWith('/api') && !url.startsWith('/@') && !url.startsWith('/node_modules')) {
          req.url = '/index.html'
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  base: '/',
  appType: 'spa'
})
