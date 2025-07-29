import {catchAsyncErrors} from "./catchasyncerrors.js";
import User from "../models/usermodels.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddlewares.js";
export const authenticate = catchAsyncErrors(async(req, res, next) => {
    let token = req.cookies.token;
    
    // If token is not in cookies, check Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decodedData.id);
        
        if (!req.user) {
            return next(new ErrorHandler("User not found", 404));
        }
        
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
})