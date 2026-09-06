import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }, 
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }, 
    role: {
        type: String,
        enum: ['Student', 'Recruiter'],
        default: 'Student',
        required: true,
    },
    profile:{
        bio:{
            type: String,
            default: '',
        },
        skills: [{
            type: String,
        }], 
        resume: {
            type: String, // URL or path to the resume file
        },
        resumeOriginalname:{
            type: String // original name of resume file
        },
        company:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        },
        profilePhoto: {
            type: String,
            default: '',
        },

    }
  }, {timestamps: true});

const User = mongoose.model("User",userSchema);
export default User;