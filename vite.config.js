import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function localUploadPlugin() {
  let publicDir
  return {
    name: 'local-upload',
    configResolved(config) {
      publicDir = path.resolve(config.publicDir)
    },
    configureServer(server) {
      // Upload image → save to public/images/jerseys/<imageFolder>/<index+1>.jpg
      server.middlewares.use('/api/upload-local', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const { imageFolder, index, data } = JSON.parse(body)
            const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
            const dir = path.join(publicDir, 'images', 'jerseys', imageFolder)
            fs.mkdirSync(dir, { recursive: true })
            const ext = data.startsWith('data:image/png') ? '.png' : '.jpg'
            fs.writeFileSync(path.join(dir, `${index + 1}${ext}`), buffer)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, url: `/images/jerseys/${imageFolder}/${index + 1}${ext}` }))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // Delete single image
      server.middlewares.use('/api/delete-image-local', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const { imageFolder, index } = JSON.parse(body)
            const dir = path.join(publicDir, 'images', 'jerseys', imageFolder)
            for (const ext of ['.jpg', '.png', '.webp']) {
              const filePath = path.join(dir, `${index + 1}${ext}`)
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // List images for a jersey (check filesystem)
      server.middlewares.use('/api/images-local', (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        const imageFolder = url.searchParams.get('imageFolder')
        if (!imageFolder) { res.statusCode = 400; res.end(); return }
        const dir = path.join(publicDir, 'images', 'jerseys', imageFolder)
        const images = []
        const MAX = 5;
        if (fs.existsSync(dir)) {
          for (let i = 0; i < MAX; i++) {
            for (const ext of ['.jpg', '.png', '.webp']) {
              const filePath = path.join(dir, `${i + 1}${ext}`)
              if (fs.existsSync(filePath)) {
                images.push({ index: i, url: `/images/jerseys/${imageFolder}/${i + 1}${ext}` })
                break
              }
            }
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ images }))
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  base: process.env.GHPAGES ? '/Michael-Thompson-Jersey/' : '/',
  plugins: [react(), tailwindcss(), localUploadPlugin()],
}))
