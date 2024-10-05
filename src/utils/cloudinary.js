import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import fs from "fs";
dotenv.config(); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




const uploadOnCloudinary = async (localFilePath) => {
    try {
    
        if (!localFilePath) return null
    
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

try {
    fs.unlinkSync(localFilePath); 
} catch (error) {
    console.error(`Error removing file: ${localFilePath}. File might not exist.`, error);
}

        return response;
  }  catch(error)  {
    try {
        fs.unlinkSync(localFilePath); 
    } catch (unlinkError) {
        console.error(`Error removing file during catch: ${localFilePath}`, unlinkError);
    }
    console.error("Error uploading to Cloudinary:", error);                  
        return null;
  }

 
}


export { uploadOnCloudinary };
