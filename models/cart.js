import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: String,
            price: Number,
            quantity: Number
        }
    ]
});

export default mongoose.model("Cart", cartSchema);