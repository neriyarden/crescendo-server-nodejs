const sqlUtils = require('../utils/sqlUtils')


// validate user by email
const validateEmail = async (incomingEmail) => {
    const sql = `select * from users where email = ?`
    const data = [incomingEmail]
    const [result] = await sqlUtils.query(sql, data)
    return result
}

// validate user by password
const validatePassword = async (email, incomingPassword) => {
    const sql = `select id from users where email = ? and password = ?`
    const data = [email, incomingPassword]
    const [result] = await sqlUtils.query(sql, data)
    return result?.id
}


module.exports = {
    validateEmail,
    validatePassword
}