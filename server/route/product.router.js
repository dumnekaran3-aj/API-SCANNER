const express = require('express');



const {createproduct,
    updateproduct,
    myproducts,
    deletemyproduct
 } = require("../controller/product.controller.js");

const verifyToken = require("../middel/auth.mid.js");
const {verifyProductOwner} = require("../middel/verifyProductOwner.mid.js")



const router = express.Router();



router.post("/createproduct", verifyToken, createproduct);

router.put("/updateproduct/:id", verifyToken,  updateproduct);

router.get("/myproducts", verifyToken,  myproducts);

router.delete("/deletemyproduct/:id", verifyToken,  deletemyproduct);

module.exports = router;

