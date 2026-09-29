const User = require("../data/users.mdel.js");




const AuthAcOfuser =  async (req, res) =>{


    try{


        const PIPELINE = [{
            $project:{
                name,
                password,
                role
            }
        }]
 
        const data = User.find(PIPELINE)

        return res.status(200).json({msg : `data is :: ${data}`})

    }catch(err){
        return res.status(500).json({ msg :"server error "})
    }
}

module.exports = AuthAcOfuser;