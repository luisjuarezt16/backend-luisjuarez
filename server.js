const express = require("express")

const app = express()
const PORT = 3000

app.use(express.json())

// BASE DE DATOS LOCAL
let productos = require("./productos.json")

// ENRUTADORES
app.get("/", (req, res) => {
  res.status(200).json("Bienvenidos")
})

app.get("/productos", (req, res) => {
  res.status(200).json({
    title: "Lista de productos Forklift",
    productos: productos
  })
})

app.get("/productos/:id", (req, res) => {
  const id = parseInt(req.params.id)
  const producto = productos.find(p => p.id === id)

  if (!producto) {
    return res.status(404).json({ error: "Este producto no existe" })
  }

  res.status(200).json(producto)
})

//AFGREGANDO CON POST

app.post ("/productos" , (req,res) => {
    const { nombre, precio,stock , foto } = req.body
    const productonuevo = {
        id: productos.length ? productos[productos.length -1].id +1 : 1,
        nombre, 
        precio,
        stock, 
        foto }
    productos.push (productonuevo)
    res.status (201).json({message:"producto creado con exito", producto: productonuevo})
})



//MODIFICANDO CON PUT 
app.put ("/productos/:id", (req, res) => {
  const id = parseInt(req.params.id)
  const { nombre, precio,stock , foto } = req.body
  const producto = productos.find(p => p.id === id)

  if (!producto) {
    return res.status(404).json({ error: "Este producto no existe" })
  }

  producto.nombre = nombre ?? producto.nombre
  producto.precio = precio ?? producto.precio
  producto.stock = stock ?? producto.stock
  producto.foto = foto ?? producto.foto


  res.status(200).json({message: "producto actualizado!", producto: producto})
})



//ELIMINANDO CON DELETE

app.delete("/productos/:id", (req, res) => {
  const id = parseInt(req.params.id)
  const producto = productos.find(p => p.id === id)

  if (!producto) {
    return res.status(404).json({ error: "Este producto no existe" })
  }

  productos = productos.filter(p => p.id !== id)
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`Servidor express escuchando en http://localhost:${PORT}`)
})

