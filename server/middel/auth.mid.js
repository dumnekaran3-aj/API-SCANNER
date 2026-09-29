const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: "Access denied. No token provided or invalid format." });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_ENCRYPT);

        req.user = decoded;

        next(); 
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ msg: "Token has expired." });
        }
        return res.status(403).json({ msg: "Invalid token." });
    }
};

module.exports = verifyToken;