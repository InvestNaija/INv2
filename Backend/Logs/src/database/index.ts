
import mongoose from "mongoose";
const start = async ()=>{
   try {
      await mongoose.connect(`mongodb://${process.env.DB_MONGO_HOST}:${process.env.DB_MONGO_PORT}/${process.env.DB_MONGO_DB_NAME}`);    
      console.log(`Connected to Logs MongoDB`)  
   } catch (error) {
      console.log(`Error connecting to our DB`);     
   }
}
start()