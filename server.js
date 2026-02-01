const express = require("express")

const app = express()
const PORT = 3000

app.use(express.json())


//BASE DE DATOS PRODUCTOS

let productos = [
  {
    id: 1,
    nombre: "Grúa Horquilla Eléctrica 1.5 Ton",
    precio: 12500000,
    stock: 3,
    foto: "grua_horquilla_electrica_1_5t.jpg"
  },
  {
    id: 2,
    nombre: "Grúa Horquilla Eléctrica 2 Ton",
    precio: 14800000,
    stock: 2,
    foto: "grua_horquilla_electrica_2t.jpg"
  },
  {
    id: 3,
    nombre: "Apilador Eléctrico Hombre Caminando",
    precio: 7200000,
    stock: 5,
    foto: "apilador_hombre_caminando.jpg"
  },
  {
    id: 4,
    nombre: "Apilador Eléctrico Hombre a Bordo",
    precio: 9800000,
    stock: 4,
    foto: "apilador_hombre_a_bordo.jpg"
  },
  {
    id: 5,
    nombre: "Transpaleta Eléctrica 2 Ton",
    precio: 4200000,
    stock: 6,
    foto: "transpaleta_electrica_2t.jpg"
  },
  {
    id: 6,
    nombre: "Transpaleta Eléctrica Hombre a Bordo",
    precio: 5900000,
    stock: 3,
    foto: "transpaleta_hombre_a_bordo.jpg"
  },
  {
    id: 7,
    nombre: "Reach Truck Eléctrico 9 Metros",
    precio: 19800000,
    stock: 2,
    foto: "reach_truck_9m.jpg"
  },
  {
    id: 8,
    nombre: "Grúa Horquilla Combustión 2.5 Ton",
    precio: 16500000,
    stock: 2,
    foto: "grua_horquilla_combustion_2_5t.jpg"
  },
  {
    id: 9,
    nombre: "Grúa Horquilla Todo Terreno",
    precio: 24500000,
    stock: 1,
    foto: "grua_horquilla_todo_terreno.jpg"
  },
  {
    id: 10,
    nombre: "Order Picker Eléctrico",
    precio: 18200000,
    stock: 2,
    foto: "order_picker_electrico.jpg"
  }
]

// ENRUTADORES
app.get("/", (req, res) => {
  res.status(200).json("Bienvenidos")
})


app.get("/productos", (req, res) => {
  res.status(200).json({title: "Lista de productos Forklift", productos: productos})
})  


// INICIALIZACIÓN DEL SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor express escuchando en http://localhost:${PORT}`)
})

