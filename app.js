import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'

import homerouter from './routes/home.routes.js'
import servicesRouter from './routes/services.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

/** ===============================
 *  MOTOR DE PLANTILLAS
 * =============================== */

app.engine('hbs', engine({ extname: '.hbs' }))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

/** ===============================
 *  MIDDLEWARES
 * =============================== */

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/** ===============================
 *  ARCHIVOS ESTÁTICOS
 * =============================== */

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/** ===============================
 *  RUTAS
 * =============================== */

app.use('/', homerouter)
app.use('/services', servicesRouter)

/** ===============================
 *  ERROR 404
 * =============================== */

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'PAGINA NO ENCONTRADA'
    })
})

/** ===============================
 *  SERVIDOR
 * =============================== */

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})