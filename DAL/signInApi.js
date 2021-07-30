const sqlUtils = require('../utils/sqlUtils')


// validate user by email
const validateEmail = async (incomingEmail) => {
    const sql = `select email from users u where u.email = ?`
    const data = [incomingEmail]
    const [result] = await sqlUtils.query(sql, data)
    return result?.email
}

// validate user by password
const validatePassword = async (email, incomingPassword) => {
    const sql = `select u.id from users u where u.email = ? and u.password = ?`
    const data = [email, incomingPassword]
    const [result] = await sqlUtils.query(sql, data)
    return result?.id
}


module.exports = {
    validateEmail,
    validatePassword
}