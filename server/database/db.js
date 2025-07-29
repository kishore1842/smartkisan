import mongoose from "mongoose";

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Kisan",
        });
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

export default connect;
