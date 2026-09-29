


const adminOnly = (req, res, next) => {


try{
        if (!req.user || req.user.role !== "admin") {

        return res.status(403).json({ msg: "access denied, admin only" });
    }

    next();


}catch(err){
    res.status(403).sjon({msg :"some went wrong....."})}

};

module.exports = adminOnly;