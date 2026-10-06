const User = require("../data/users.mdel.js");




const AuthAcOfuser =  async (req, res) =>{


    try{

 
        const data = await User.find({ ID: req.user.ID });

        return res.status(200).json({ msg: `data is :: ${data}` });

    }catch(err){
        return res.status(500).json({ msg: "server error" });
    }
}




module.exports = AuthAcOfuser;