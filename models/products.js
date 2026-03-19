import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    image: String,
    stock: Number
});

export default mongoose.model("Product", productSchema);