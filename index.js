const express = require('express')
const path = require('path')
const crypto = require('crypto')
const db = require('./database') 

const app = express()
const port = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/test', (req, res) => {
  res.send('Hello World!')
})

app.post('/create', (req, res) => {
  const { service_name } = req.body

  if (!service_name) {
    return res.status(400).json({ error: 'Service name wajib diisi' })
  }

  const randomBytes = crypto.randomBytes(16).toString('hex').toUpperCase()
  const apiKey = `Hikmatyar-${randomBytes.slice(0, 8)}-${randomBytes.slice(8, 16)}-${randomBytes.slice(16, 24)}-${randomBytes.slice(24, 32)}`

  const sql = 'INSERT INTO apikeys (api_key, service_name) VALUES (?, ?)'
  db.query(sql, [apiKey, service_name], (err, result) => {
    if (err) {
      console.error('❌ Gagal menyimpan API key:', err)
      return res.status(500).json({ error: 'Gagal menyimpan ke database' })
    }

    console.log('✅ API Key baru disimpan ke database!')
    res.json({ apiKey, message: 'API Key berhasil dibuat dan disimpan!' })
  })
})


app.post('/cekapi', (req, res) => {
  const { api_key } = req.body

  if (!api_key) {
    return res.status(400).json({ error: 'API key wajib dikirim' })
  }

  const sql = 'SELECT * FROM apikeys WHERE api_key = ?'
  db.query(sql, [api_key], (err, results) => {
    if (err) {
      console.error('❌ Error cek API key:', err)
      return res.status(500).json({ error: 'Terjadi kesalahan server' })
    }

    if (results.length > 0) {
      res.json({ valid: true, service_name: results[0].service_name, created_at: results[0].created_at })
    } else {
      res.json({ valid: false, message: 'API key tidak ditemukan' })
    }
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`)
})
