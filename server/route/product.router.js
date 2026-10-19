const express = require('express');



const {    createproduct,
    updateproduct,
    myproducts,
    deletemyproduct
 } = require("../data/product.model.js");

const verifyToken = require("../middel/auth.mid.js");
const {verifyProductOwner} = require("../middel/verifyProductOwner.mid.js")



const router = express.Router();



router.post("/createproduct", verifyToken, verifyProductOwner, createproduct);

router.put("/updateproduct/:id", verifyToken, verifyProductOwner, updateproduct);

router.get("/myproducts", verifyToken, verifyProductOwner, myproducts);

module.exports = router;

