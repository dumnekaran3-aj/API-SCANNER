const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalname: {


        type: String,
        required: true,
        trim: true
    },
    key: { 
        type: String,

        required: true,
        unique: true,
        trim: true 
    },
    mimetype: {
        type: String,


        required: true,
        trim: true
    },
    
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true


    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'User',
        required: true,

        index: true
    },

    status: {
        type: String,
        enum: ['temporary', 'active', 'deleted'],

        default: 'temporary'
    }

}, 

{
    timestamps: true


}

);


module.exports = mongoose.model('File', fileSchema);