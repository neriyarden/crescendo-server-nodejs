const api = require('../DAL/usersApi');
const jwt = require('jsonwebtoken')

const validateToken = async (req, res, next) => {
    if(req.method === 'OPTIONS') return next()
    try {
        const token = req.headers.authorization.split(' ')[1]
        if(!token) {
            throw new Error('Access Denied. Authentication failed.')
        }
        const { user_id } = jwt.verify(token, process.env.TOKEN_SECRET)
        req.tokenData = { user_id }
        next()
    } catch (err) {
        console.log('err',err);
        return res.status(403).send({ error: 'Access Denied. Authentication failed.' })
    }
}

module.exports = validateToken