const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    productname: {


        type: String,
        
        required: true,

        trim: true


    },
    email:{
         type: String,

        trim: true

    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


    price: {
        type: Number,
        required: true
    },

    quantity: {

        type: Number,
        required: true
    }

}, { timestamps: true }); 

const Product = mongoose.model('testing_product', productSchema);

module.exports = Product;