const express = require("express");

const Auth = require("../controller/user.controller.js");
const {adminOnly} = require("../middel/veiryAdmin.js")

const {verifyToken} = require("../middel/veiryAdmin.js")

const router =  express.Router();




router.get("/dashboard", verifyToken, adminOnly,Auth.AuthAcOfuser, (req, res) => {
    return res.status(200).json({ msg: "Welcome Admin", user: req.user });
});