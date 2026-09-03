import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
    try {
        const{fullName, email, phoneNumber, password, role} = req.body;
        if(!fullName || !email || !phoneNumber || !password || !role){
            return res.status(404).json({
                message: "All fields are required",
                success: false,
            });
        }
        let user = await User.findOne({email});
        if(user){  
            return res.status(404).json({
                message: "User already exists",
                success: false,
            });
        }
        
        // convert passwords to hashs
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role
        });
        await newUser.save();
        return res.status(200).json({
            message: `Account created successfully for ${newUser.fullname}`,
            success: true,
        });
    }
    
    catch (error) {}
}

export const login = async (req, res) => {
    try{
        const {email, password, role} = req.body;
        if(!email || !password || !role){
            return res.status(404).json({
                message: "All fields are required",
                success: false,
            });
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(404).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        // check role correctly or not
        if(user.role !== role){ 
            return res.status(403).json({
                message: "You don't have permission to access this resource",
                success: false,
            });
        }

        // generate token
        const tokenData = {
            userId: user._id,
        };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: "1d"});

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phonenumber: user.phonenumber,
            role: user.role,
            profile: user.profile,
        }

        return res
        .status(200)
        .cookie("token", token, {
            maxAge: 1 *24 * 60 * 60 * 1000, 
            httpOnly: true,
            sameSite: strict,
        })
        .json({
            message: `Welcome ${user.fullname}`,
            user,
            success: true,
        });
            
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const logout = async (req, res) => {
    try{
        return res.status(200).cookie("token", "", { maxAge: 0}).json({
            message: "Logged out successfully",
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const updateProfile = async (req, res) => {
    try{
        const{fullname, email, phoneNumber, bio, skills} = req.body;
        const file = req.file; // Assuming you're using multer for file uploads
        if(!fullname || !email || !phoneNumber || !bio || !skills){
            return res.status(404).json({
                message: "All fields are required",
                success: false,
            });
        }


        //cloudinary upload


        const skillsArray = skills.split(",");
        const userId = req.userId; // middleware authentication
        let user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        user.fullname = fullname;
        user.email = email;
        user.phonenumber = phoneNumber;
        user.bio = bio;
        user.skills = skillsArray;

        //resume

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phonenumber: user.phonenumber,
            role: user.role,
            profile: user.profile,
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error updating profile",
            success: false,
        });
    }
}