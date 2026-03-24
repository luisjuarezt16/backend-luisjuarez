import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'

// MONGO
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

dotenv.config()

let cartId = null

//SERVER
const httpServer = http.createServer(app)
const io = new Server(httpServer)

//HANDLEBAR
app.engine('hbs', engine({
    extname: '.hbs',
    helpers: {
        formatPrice: (price) => new Intl.NumberFormat('es-CL').format(Number(price) || 0),
        multiply: (a, b) => Number(a) * Number(b)
    }
}))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

//MIDDLEWARES
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//STATIC
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//ROUTES
app.use('/', homerouter)
app.use('/services', servicesRouter)

//PRODUCTOS
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find().lean();

        res.render('products', {
            title: 'Productos',
            products: products || []
        });

    } catch (error) {
        console.error("🔥 ERROR PRODUCTOS:", error);
        res.status(500).send("Error al obtener productos");
    }
});

//AGREGAR AL CARRITO
app.post('/api/cart', async (req, res) => {
    try {
        const { id, quantity } = req.body;

        if (!cartId) {
            return res.status(500).json({ error: "Carrito no listo" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Producto no existe" });
        }

        const cart = await Cart.findById(cartId);

       
        const existing = cart.products.find(
            p => p.productId && p.productId.equals(product._id)
        );

        if (existing) {
            existing.quantity += Number(quantity) || 1;
        } else {
            cart.products.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: Number(quantity) || 1
            });
        }

        await cart.save();

        console.log("🛒 CART:", cart.products);

        res.json({ ok: true });

    } catch (error) {
        console.error("🔥 ERROR CART:", error);
        res.status(500).json({ error: "Error en carrito" });
    }
});

// VER CARRITO
app.get('/cart', async (req, res) => {
    try {
        if (!cartId) {
            return res.render('cart', {
                title: 'Carrito',
                cart: [],
                total: 0,
                hasProducts: false
            });
        }

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

    } catch (error) {
        console.error("🔥 ERROR CART VIEW:", error);
        res.status(500).send("Error cargando carrito");
    }
});

//ELIMINAR
app.delete('/api/cart/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const cart = await Cart.findById(cartId);

        cart.products = cart.products.filter(
            p => p.productId && !p.productId.equals(id)
        );

        await cart.save();

        res.json({ ok: true });

    } catch (error) {
        console.error("🔥 ERROR DELETE:", error);
        res.status(500).json({ error: "Error eliminando producto" });
    }
});

//CHECKOUT
app.post('/api/checkout', async (req, res) => {
    try {
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

    } catch (error) {
        console.error("🔥 ERROR CHECKOUT:", error);
        res.status(500).json({ error: "Error en checkout" });
    }
});

//SOCKET
io.on("connection", socket => {
    console.log("Usuario conectado");
});

//404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página no encontrada'
    })
});

//START
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB conectado");
        console.log("📡 DB:", mongoose.connection.name);


        await Cart.deleteMany();

        const newCart = await Cart.create({ products: [] });
        cartId = newCart._id;

        console.log("🛒 Carrito listo");

        httpServer.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ ERROR CONEXIÓN:", error);
    }
};

startServer();