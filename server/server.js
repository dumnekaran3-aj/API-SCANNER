require('dotenv').config(); 

const express = require('express');
const connectDB = require("./config/db.js");
//const users = require('./route/data.route.js');

const public_route = require("./route/public.route.js")
const login =  require("./route/login.router.js")
const AdminDashboard = require("./route/Admin.router.js")

const verifyToken = require("./middel/auth.mid.js")

const app = express();
const PORT = process.env.PORT || 8000; 

app.use(express.json());


connectDB();



app.get('/api/health', (req, res) => {
    try {
        return res.status(200).json({ msg: "server is healthy and runn.." });
    } catch (err) {
        return res.status(500).json({ msg: "server is not healthy" });
    }
});
    
app.use("/" ,public_route )





//app.use('/api', users);
app.use('/api/auth' , login)
app.use("/api/Admin" , AdminDashboard)

app.use('/api/public', public_route);




app.use((err, req, res, next) => {
    console.error(err);  // server-ke-apne-console-mein-poora-detail
    res.status(500).json({ msg: "Something went wrong" });  // client-ko-sirf-generic
});




app.get("/api/user" ,verifyToken, async (req, res) => {
    res.json({ msg: "Welcome to user dashboard.... with verified token", secretData: "sensitive info here" });
});


app.listen(PORT, () => {


    console.log(`Server is running on port ${PORT}`);
    console.log("--------------------------------------------------------------")
    console.log("---------------------endpoints--------------------------------")
    console.log(`Health check endpoint GET : http://localhost:${PORT}/api/health`);
    console.log(`Users endpoint GET : http://localhost:${PORT}/api/users`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/auth/signin`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/signup`);
    console.log(`Users endpoint GET : http://localhost:${PORT}/api/public/user`);
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/public/api/user/:id/profile`) 
    console.log(`Users endpoint POST : http://localhost:${PORT}/api/public/api/admin/dashboard`) 
    console.log(`Users endpoint GET : http://localhost:${PORT}/api/Admin/dashboard`);

console.log("-------------------------------------------------------------------------------------------------")
    
});




