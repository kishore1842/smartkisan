import { config } from "dotenv";
config({ path: "./config/config.env" });

console.log('Cloudinary ENV:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

import { app } from "./app.js";
app.listen(process.env.PORT,()=>{
    console.log(`server is running of ${process.env.PORT}`)
})

// above lines of code is same for all projects