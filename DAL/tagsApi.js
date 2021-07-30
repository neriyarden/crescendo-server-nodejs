const sqlUtils = require('../utils/sqlUtils')


// get all tags
const getAllTags = async () => {
    const sql = `select * from tags`
    return await sqlUtils.query(sql, [])
}


module.exports = {
    getAllTags
}