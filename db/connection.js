import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.DB_MODE === "atlas"
            ? process.env.MONGO_ATLAS
            : process.env.MONGO_LOCAL;

        await mongoose.connect(uri);

        console.log(`✅ MongoDB conectado a ${process.env.DB_MODE}`);
    } catch (error) {
        console.error("❌ Error Mongo:", error.message);
        process.exit(1);
    }
};