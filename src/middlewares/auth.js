const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        // read the token from req
        const cookies = req?.cookies;
        const { token } = cookies;

        if(!token){
            return res.status(401).json({
                message: "Please log in!"
            });
        }

        // validate the token
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { id } = decodedToken;

        // find the user
        const user = await User.findById(id);
        if(!user){
            throw new Error("Invalid token!");
        }
        req.user = user;
        next();
    }
    catch(err){
        res.status(400).json({message: "Error: " + err?.message});
    }
}

module.exports = { userAuth };