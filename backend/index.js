const express = require('express')
const compression = require('compression')
const { join } = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const hpp = require('hpp')
const dotenv = require('dotenv')
const logger = require('morgan')

const moviesRoutes = require('./routes/movies')
const actorsRoutes = require('./routes/actors')
const genresRoutes = require('./routes/genres')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const isDev = process.env.NODE_ENV !== 'production'

app.disable('x-powered-by')
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1)
}

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }),
)

// const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : null

// app.use(cors(corsOrigins ? { origin: corsOrigins, credentials: true } : { origin: true }))
app.use(
  cors({
    origin: '*',
  }),
)

// Compress responses; place before route handlers
app.use(compression())

// Prefer Express built-in parsers over body-parser (same behavior, one less indirection)
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }))
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '1mb' }))

// HPP: sanitize query/params (after body parsing)
app.use(hpp())

if (isDev) {
  app.use(logger('dev'))
} else {
  app.use(logger('combined'))
}

// Static assets: before API rate limit so image traffic is not throttled
app.use(
  '/images',
  express.static(join(__dirname, 'images'), {
    maxAge: '30d',
    immutable: true,
  }),
)

// const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
// const max = Number(process.env.RATE_LIMIT_MAX) || 2000
// app.use(
//   rateLimit({
//     windowMs,
//     max,
//     standardHeaders: true,
//     legacyHeaders: false,
//     skip: req => req.path.startsWith('/images'),
//   }),
// )

// Routes
app.use(moviesRoutes)
app.use(actorsRoutes)
app.use(genresRoutes)

app.get('/api', (req, res) => {
  res.status(200).json({ ok: true, service: 'fru-api' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500
  const message = isDev ? err.message : 'Internal server error'
  if (status >= 500) {
    console.error(err)
  }
  res.status(status).json({ error: message })
})

/** Tunable via env if Mongo is distant or behind slow links. */
function mongooseConnectOptions() {
  const n = (key, fallback) => {
    const v = process.env[key]
    if (v === undefined || v === '') return fallback
    const num = Number(v)
    return Number.isFinite(num) ? num : fallback
  }
  return {
    maxPoolSize: n('MONGODB_MAX_POOL_SIZE', 10),
    // Server monitor / selection — "connection <monitor> timed out" means the API host often cannot reach DB:PORT in time (firewall, bindIp, wrong IP, or DB down).
    serverSelectionTimeoutMS: n('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 30_000),
    connectTimeoutMS: n('MONGODB_CONNECT_TIMEOUT_MS', 20_000),
    socketTimeoutMS: n('MONGODB_SOCKET_TIMEOUT_MS', 45_000),
  }
}

async function start() {
  if (!process.env.DB_URL) {
    console.error('[!] DB_URL is not set')
    process.exit(1)
  }
  mongoose.connection.on('error', err => {
    console.error('[!] MongoDB:', err.message)
  })
  try {
    await mongoose.connect(process.env.DB_URL, mongooseConnectOptions())
  } catch (err) {
    console.error('[!] MongoDB connection failed:', err.message)
    process.exit(1)
  }
  console.log('Connected to MongoDB')
  app.listen(port, () => {
    console.log(`App is up on port ${port}`)
  })
}

start()
