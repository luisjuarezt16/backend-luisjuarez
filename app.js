import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import http from 'http'
import { Server } from 'socket.io'

import homerouter from './routes/home.routes.js'
import servicesRouter from './routes/services.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// Crear servidor HTTP y Socket.IO
const httpServer = http.createServer(app)
const io = new Server(httpServer)

// Configuración de Handlebars
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

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Archivos estáticos
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rutas principales
app.use('/', homerouter)
app.use('/services', servicesRouter)

// Ruta chat
app.get('/chat', (req, res) => {
    res.render('chat', { title: 'Chat' })
})

// Ruta productos
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

// Socket.IO
io.on("connection", (socket) => {

    console.log("Usuario conectado")

    socket.on("chat:message", (data) => {
        io.emit("chat:message", data)
    })

    socket.on("disconnect", () => {
        console.log("Usuario desconectado")
    })
})

// 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'pagina no encontrada'
    })
})

// Iniciar servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})