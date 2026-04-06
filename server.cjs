const { createServer } = require('http')
const { readFileSync, existsSync } = require('fs')
const { join, extname } = require('path')

const PORT = process.env.PORT || 3000
const DIST = join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
}

const indexHtml = readFileSync(join(DIST, 'index.html'))

const server = createServer((req, res) => {
  const url = req.url.split('?')[0]

  // API requests should NOT fall through to SPA — return proper error
  if (url.startsWith('/api')) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Backend API not available. Deploy the backend service.' }))
    return
  }

  const filePath = join(DIST, url)

  if (url !== '/' && existsSync(filePath) && extname(filePath)) {
    try {
      const data = readFileSync(filePath)
      const ext = extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(data)
      return
    } catch { /* fall through to SPA */ }
  }

  // SPA fallback for all non-API, non-file routes
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(indexHtml)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT)
})
