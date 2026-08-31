import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './routes/api.router.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ---- REST API ----
app.use('/api', router)

app.get('/api', (req, res) => {
  res.json({
    author: 'Xiaozie_Modz',
    routes: {
      home: '/api/home',
      schedule: '/api/schedule',
      ongoing: '/api/ongoing/page/:page',
      completed: '/api/completed/page/:page',
      genreList: '/api/genres',
      genre: '/api/genre/:id/page/:page',
      search: '/api/search/:query',
      getAnimeProfile: '/api/anime/:id',
      detailEpisode: '/api/episode/:id',
      batch: '/api/batch/:id',
    },
  })
})

// ---- Frontend (index.html) ----
// Jangan cache frontend saat aplikasi diperbarui. Cache satu jam membuat browser
// tetap menjalankan JavaScript lama meskipun paket di server sudah diganti.
app.use(express.static(publicDir, {
  maxAge: 0,
  etag: false,
  index: 'index.html',
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store, max-age=0'),
}))

// SPA fallback: everything non-API serves index.html
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      status: 'not found path',
      message: 'read the docs here https://github.com/Kaede-No-Ki/otakudesu-rest-api',
    })
  }
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.sendFile(path.join(publicDir, 'index.html'))
})

// Vercel imports the app; local/Termux listens on a port
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`✓ AKIRA running on http://localhost:${port}`))
}

export default app
