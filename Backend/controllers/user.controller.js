import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;

        // Check all fields
        if (!fullName || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                success: false,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        return res.status(201).json({
            message: `Account created successfully for ${newUser.fullName}`,
            success: true,
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });
    }
};


// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check fields
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        // Find user
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        // Check role
        if (user.role !== role) {
            return res.status(403).json({
                message: "You don't have permission to access this resource",
                success: false,
            });
        }

        // Generate token
        const tokenData = {
            userId: user._id,
        };

        const token = jwt.sign(
            tokenData,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send only required user data
        user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
            })
            .json({
                message: `Welcome ${user.fullName}`,
                user,
                success: true,
            });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


// ================= LOGOUT =================
export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", "", {
                maxAge: 0,
                httpOnly: true,
                sameSite: "strict",
            })
            .json({
                message: "Logged out successfully",
                success: true,
            });

    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phoneNumber,
            bio,
            skills
        } = req.body;

        const file = req.file;

        // Check required fields
        if (!fullName || !email || !phoneNumber || !bio || !skills) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        // Cloudinary upload will come here later


        // Convert skills string into array
        const skillsArray = skills.split(",");

        // Get user ID from authentication middleware
        const userId = req.userId;

        // Find user
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        // Update user information
        user.fullName = fullName;
        user.email = email;
        user.phoneNumber = phoneNumber;

        // Update profile information
        user.profile.bio = bio;
        user.profile.skills = skillsArray;

        // Resume upload will come here later


        await user.save();

        // Return updated user
        user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true,
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);

        return res.status(500).json({
            message: "Server error updating profile",
            error: error.message,
            success: false,
        });
    }
};