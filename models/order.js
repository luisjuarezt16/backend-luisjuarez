import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    products: [
        {
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    total: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Order", orderSchema);