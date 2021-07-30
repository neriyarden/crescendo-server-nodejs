const sqlUtils = require('../utils/sqlUtils')


// edit user data
const updateUserData = async ({ id, name, password }) => {
    const sql = `update users set`
        + ` ${name ? ` name = '${name}',` : ''}`
        + ` ${password ? ` password = '${password}'` : ''}`
        + ` where id = ?;`

    const data = [id]
    await sqlUtils.query(sql, data)
    const [results] = await sqlUtils.query(
        `select * from users where id = ?`, data
    )
    return results
}


// get all users data
const getAllUsersData = async () => {
    const sql = `select id, name, email, joined_at, is_artist from users`
    const results = await sqlUtils.query(sql, [])
    return results
}


// get 1 user data by id
const getUserDataByID = async (userId) => {
    const sql = `select id, name, email, joined_at, is_artist from users where id = ?`

    const data = [userId]
    const results = await sqlUtils.query(sql, data)
    if (results.length > 0)
        results[0].joined_at = sqlUtils.formatDateToDDMMYYYY(results[0].joined_at)
    return results
}


// post a new user's data
const postNewUser = async ({ name, email, password, is_artist }) => {
    const sql = `insert into users(name, email, password, joined_at, is_artist)`
        + ` values('${name}', '${email}', '${password}', now(), ?);`

    const response = await sqlUtils.query(sql, [is_artist])
    if (is_artist && response.insertId) {
        const sql2 = `insert into artists(user_id) values(?)`
        await sqlUtils.query(sql2, [response.insertId])
    }
    const results = await sqlUtils.query(
        `select id, name, email, joined_at, is_artist from users where id = ?`, [response.insertId]
    )
    return results
}


// get user's votes by id
const getUserVotes = async (userId) => {
    const sql = `select v.user_id, r.id 'request_id', r.tour,`
        + ` u.name 'artist', u.id 'artist_id', c.name 'city', r.cap, tv.votes`
        + ` from votes v`
        + ` join requests r on r.id = v.request_id `
        + ` join users u on u.id = r.artist_id`
        + ` join cities c on c.id = r.city_id`
        + ` join (select request_id, sum(voted) 'votes' `
        + ` from votes v`
        + ` group by request_id) tv on r.id = tv.request_id`
        + ` where v.user_id = ?`
        + ` and v.voted = 1`
        + ` group by v.request_id`

    const data = [userId]
    const results = await sqlUtils.query(sql, data)
    return results
}


// check if a user name is available 
const isUserAvailable = async (column, value) => {
    const sql = `select ${column} from users where ${column} = '${value}'`
    const existingValue = await sqlUtils.query(sql, []);
    return !existingValue[0]
}


module.exports = {
    updateUserData,
    getAllUsersData,
    getUserDataByID,
    postNewUser,
    getUserVotes,
    isUserAvailable,
}