const api = require('../DAL/usersApi');

const validateCookie = async (req, res, next) => {
    const { cookies } = req
    const userId = await api.getUserDataByID(cookies.session_id)
    if ('session_id' in cookies && userId) next();
    else res.status(403).send({ error: 'Un-authorized User' })
}


module.exports = validateCookie





