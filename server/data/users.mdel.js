const mongoose = require("mongoose");

const allowedRoles = ["admin", "user", "tester"];

const userSchema = new mongoose.Schema({
    name: {


        type: String,
        
        required: true,

        trim: true
    },

    role: {
        type: String,
        enum: allowedRoles,
        default: "user"
    },

    password: {

        type: String, 
        required: true
    }
}, { timestamps: true }); 

const User = mongoose.model('testing_user', userSchema);

module.exports = User;