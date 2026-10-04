

const express= require("express")

const route = express.Router()

const verifyToken = require("../middel/auth.mid.js")

const adminOnly = require("../middel/veiryAdmin.js")


route.get('/api/admin/dashboard',verifyToken, adminOnly, (req, res) => {


    res.json({ msg: "Welcome to admin dashboard", secretData: "sensitive info here" });
});



route.get('/api/config', (req, res) => {
    res.json({ status: "ok", apiKey: "sk-12345-secret-key", environment: "production" });


});

const users_test = {


    "1": { name: "Karan", email: "karan@test.com", balance: 5000 },
    "2": { name: "Aryan", email: "aryan@test.com", balance: 8000 }
};

route.get('/api/user/:id/profile', verifyToken ,(req, res) => {



    const userId = req.params.id;
    res.json(users_test[userId]);
});


module.exports = route;
