


const express = require("express");
const Auth = require("../controller/user.controller.js");
const adminOnly = require("../middel/veiryAdmin.js");     // bina {}, aur sahi file se
const verifyToken = require("../middel/auth.mid.js");      // bina {}, aur sahi file se (yeh file pehle galat the)

const router = express.Router();

router.get("/dashboard", verifyToken, adminOnly, (req, res) => {
    return res.status(200).json({ msg: "Welcome Admin", user: req.user });
});


module.exports = router;