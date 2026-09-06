import jwt from "jsonwebtoken";

const authenticateToken = async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({ message: "Access denied. No token provided.", success: false });
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: "Access denied. Invalid token." }),
            success = false;
        }
        req.id = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

export default authenticateToken;