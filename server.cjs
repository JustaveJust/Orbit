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

const server = createServer((req, res) => {
  let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url)

  if (!existsSync(filePath) || !extname(filePath)) {
    filePath = join(DIST, 'index.html')
  }

  try {
    const data = readFileSync(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  } catch {
    const html = readFileSync(join(DIST, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT)
})
