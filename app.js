import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

import homerouter from './routes/home.routes.js'
import servicesRouter from './routes/services.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// motor de plantillas

app.engine('hbs', engine({
    extname: '.hbs',
    helpers: {
        formatPrice: (price) => {
            return new Intl.NumberFormat('es-CL').format(price)
        }
    }
}))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// middlewares

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// archivos estaticos

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// rutas principales

app.use('/', homerouter)
app.use('/services', servicesRouter)

// ruta productos

app.get('/products', (req, res) => {

    const productsPath = path.join(__dirname, 'data', 'products.json')

    const products = JSON.parse(
        fs.readFileSync(productsPath, 'utf-8')
    )

    res.render('products', {
        title: 'productos',
        products
    })
})

// error 404

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'pagina no encontrada'
    })
})

// servidor

app.listen(PORT, () => {
    console.log(`servidor escuchando en http://localhost:${PORT}`)
})