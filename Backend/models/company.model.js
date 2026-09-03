import mongoose from "mongoose";
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        
    },
    location: {
        type: String,
        
    },
    logo: {
        type: String,  // URL for logo
    },
    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],


}, {timestamps: true});

const Company = mongoose.model("Company", companySchema);
export default Company;