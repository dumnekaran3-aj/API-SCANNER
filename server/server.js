require('dotenv').config(); 

const express = require('express');
const connectDB = require("./config/db.js");
//const users = require('./route/data.route.js');

const public_route = require("./route/public.route.js")
const login =  require("./route/login.router.js")
const AdminDashboard = require("./route/Admin.router.js")

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

app.listen(PORT, () => {


    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);


    console.log(`Users endpoint: http://localhost:${PORT}/api/users`);
});




