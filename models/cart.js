
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {
            id: Number,
            name: String,
            price: Number,
            quantity: Number
        }
    ]
});

export default mongoose.model("Cart", cartSchema);