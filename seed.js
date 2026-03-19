import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/products.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cargarDatos = async () => {
    try {
        // conectar a Mongo
        await mongoose.connect(process.env.MONGO_URI);

        // leer JSON
        const productsPath = path.join(__dirname, "data", "products.json");

        const products = JSON.parse(
            fs.readFileSync(productsPath, "utf-8")
        );

        // borrar datos anteriores
        await Product.deleteMany();

        // insertar datos nuevos
        await Product.insertMany(products);

        console.log("🔥 Productos cargados a Mongo");

        process.exit();

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

cargarDatos();