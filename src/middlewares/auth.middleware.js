
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/Apierror.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

export const isAdmin = (req, res, next) => {
 
    if (req.user.role !== "admin") {
        throw new ApiError(400, "Unable to access contact the admin")
        
    }
    next()
    
}