const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function auth(req, res, next) {
    try {
        //get token that comes with header and clean it
        const token = req.header('Authorization').replace('Bearer ', '')
        //verify token against "secret" (hardcoded right now)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //find user with given id and token (could have many, for each auth)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        //cache token
        req.token = token
        //add a property to request, so it can be accessed inside the 
        // routes that handle user instances
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

module.exports = auth