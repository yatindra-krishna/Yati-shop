import mongoose from "mongoose";
import colors from "colors";

const connectDB=async()=>{
    try {
       const conn=await mongoose.connect(process.env.MONGO_URL);
       console.log(`connected to MongoDB Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(error.bgRed);
    }
}

export default connectDB;