const express = require('express');
const router = express.Router();

const { getUserById } = require('../controller/userController.js');
   
const verifyToken = require("../middel/auth.mid.js"); 

router.get('/user/:id', verifyToken, getUserById,(req, res) => {
   console.log("wellcome ", req.user.role )
});

module.exports = router;