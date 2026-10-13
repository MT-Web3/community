import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'

const canonicalBase: Plugin = {
  name: 'canonical-community-base',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req as { url?: string }).url
      if (url === '/community' || (url && url.indexOf('/community?') === 0)) {
        res.writeHead(302, { Location: url.replace('/community', '/community/') }); res.end()
      } else next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req as { url?: string }).url
      if (url === '/community' || (url && url.indexOf('/community?') === 0)) {
        res.writeHead(302, { Location: url.replace('/community', '/community/') }); res.end()
      } else next()
    })
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  const proxy = env.VITE_SUPABASE_URL ? {
    '/backend/functions/v1': {
      target: env.VITE_SUPABASE_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/backend/, ''),
    },
  } : undefined
  return {
  plugins: [react(), canonicalBase],
  base: '/community/',
  server: { proxy },
  preview: { proxy },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', include: ['src/**/*.test.ts'] }
  }
})
