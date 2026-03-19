import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'

// Mongo
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/products.js";
import Order from "./models/order.js";
import Cart from "./models/cart.js";

import homerouter from './routes/home.routes.js'
import servicesRouter from './routes/services.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// URI
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB conectado"))
    .catch(err => console.log("❌ Error Mongo:", err))

mongoose.connection.on('connected', () => {
    console.log("📡 DB NAME:", mongoose.connection.name);
});


let cartId;

// crear o reutilizar carrito
mongoose.connection.once('open', async () => {
    let existingCart = await Cart.findOne();

    if (!existingCart) {
        const newCart = await Cart.create({ products: [] });
        cartId = newCart._id;
        console.log("🛒 Carrito creado");
    } else {
        cartId = existingCart._id;
        console.log("🛒 Carrito existente");
    }
});

// SERVER + SOCKETS
const httpServer = http.createServer(app)
const io = new Server(httpServer)

// HANDLEBARS
app.engine('hbs', engine({
    extname: '.hbs',
    helpers: {
        formatPrice: (price) => {
            const num = Number(price);
            if (isNaN(num)) return "0";
            return new Intl.NumberFormat('es-CL').format(num);
        },
        multiply: (a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (isNaN(numA) || isNaN(numB)) return 0;
            return numA * numB;
        }
    }
}))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// MIDDLEWARES
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// STATIC
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ROUTES
app.use('/', homerouter)
app.use('/services', servicesRouter)

// CHAT
app.get('/chat', (req, res) => {
    res.render('chat', { title: 'Chat' })
})

//productos (mongo)

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find().lean();

        console.log("📦 PRODUCTS:", products.length);

        res.render('products', {
            title: 'productos',
            products
        })
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener productos");
    }
})

//carrito (mongo)

// Agregar producto
app.post('/api/cart', async (req, res) => {

    let { id, quantity } = req.body;

    id = Number(id);
    quantity = Number(quantity) || 1;

    const product = await Product.findOne({ id }).lean();

    if (!product) {
        console.log("❌ Producto no encontrado:", id);
        return res.status(404).json({ error: "No existe" });
    }

    const cart = await Cart.findById(cartId);

    const existing = cart.products.find(p => p.id === id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.products.push({
            id,
            name: product.name,
            price: product.price,
            quantity
        });
    }

    await cart.save();

    console.log("🛒 CART DB:", cart.products);

    res.json({ ok: true });
});

//  Ver carrito
app.get('/cart', async (req, res) => {

    const cart = await Cart.findById(cartId).lean();

    if (!cart || cart.products.length === 0) {
        return res.render('cart', {
            title: 'Carrito',
            cart: [],
            total: 0,
            hasProducts: false
        });
    }

    const total = cart.products.reduce(
        (acc, p) => acc + (p.price * p.quantity),
        0
    );

    res.render('cart', {
        title: 'Carrito',
        cart: cart.products,
        total,
        hasProducts: true
    });
});

//  Eliminar producto
app.delete('/api/cart/:id', async (req, res) => {

    const id = Number(req.params.id);

    const cart = await Cart.findById(cartId);

    cart.products = cart.products.filter(p => p.id !== id);

    await cart.save();

    res.json({ ok: true });
});

// Checkout
app.post('/api/checkout', async (req, res) => {

    const cart = await Cart.findById(cartId).lean();

    const total = cart.products.reduce(
        (acc, p) => acc + (p.price * p.quantity),
        0
    );

    await Order.create({
        products: cart.products,
        total
    });

    await Cart.findByIdAndUpdate(cartId, { products: [] });

    res.json({ ok: true });
});

//socket

io.on("connection", (socket) => {

    console.log("Usuario conectado")

    socket.on("chat:message", (data) => {
        io.emit("chat:message", data)
    })

    socket.on("disconnect", () => {
        console.log("Usuario desconectado")
    })
})

//404

app.use((req, res) => {
    res.status(404).render('404', {
        title: 'pagina no encontrada'
    })
})

httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})