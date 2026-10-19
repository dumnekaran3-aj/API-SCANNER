


const verifyProductOwner = (req, res, next) => {
  

        try{
            

    if (!req.user | !req.user.sellerid ){
        
       return res.status(403).json({ msg :" acess denied please verify product"})

    }
        }
        catch(err){

            next(err)
        }



};

module.exports = verifyProductOwner;