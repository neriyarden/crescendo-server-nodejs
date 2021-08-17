const sqlUtils = require('../utils/sqlUtils')
const api = require('./api')
const sendEmail = require('../utils/emails')
const mysql = require('mysql2/promise')


// get requests data 
const getRequestsData = async (
    size = 0,
    pageNum = 1,
    artist = null,
    city = null,
) => {
    const searchQuery = artist || city ? sqlUtils.sqlSearchByTextInColumn([
        { column: 'u.name', searchTerm: artist },
        { column: 'c.name', searchTerm: city },
    ]) : ``
    const sql = `select r.id, u.name artist, a.img_url, c.name city, r.cap, ifnull(sum(v.voted), 0) votes`
        + ` from requests r`
        + ` join users u on r.artist_id = u.id`
        + ` join artists a on r.artist_id = a.user_id`
        + ` join cities c on c.id = r.city_id`
        + ` left join votes v on v.request_id = r.id`
        + ` where r.deleted = 0`
        + `${searchQuery ? ` and ${searchQuery}` : ``}`
        + ` group by r.id`
        + ` order by votes desc`
        + ` ${size > 0 ? ` limit ${mysql.escape(size)}` : ``}`
        + ` ${size > 0 && pageNum ? ` offset ${mysql.escape((pageNum - 1) * size)}` : ``}`

    const data = []
    const requests = await sqlUtils.query(sql, data)

    return requests 
}


// add new request
const postNewRequest = async ({ user_id, tour, city, cap }) => {
    const userExists = await sqlUtils.query(
        `select * from artists where user_id = ?`, [user_id]
    )
    if (!userExists[0]) return `Can't create event of unknown artist.`

    let cityId = await sqlUtils.query(`select id from cities where name = ?`, [city])
    cityId = cityId[0]?.id
    if (!cityId) cityId = await api.addNewCity(city)

    const sql = `insert into requests(artist_id, tour, city_id, cap)`
        + ` values(?,?,?,?)`

    const results = await sqlUtils.query(sql, [user_id, tour, cityId, cap])
    return results
}


// edit existing request
const updateRequestData = async ({ request_id, tour, city, cap }) => {
    let cityId = await sqlUtils.query(`select id from cities where name = ?`, [city])
    cityId = cityId[0]?.id
    if (!cityId) cityId = await api.addNewCity(city)

    const sql = `update requests set`
        + ` tour = ?, city_id = ?, cap =?`
        + ` where id = ? and deleted = 0;`

    const data = [tour, cityId, cap, request_id]
    const results = await sqlUtils.query(sql, data)
    return results
}


// delete existing request
const deleteExistingRequest = async (requestId) => {
    const sql = `update requests set deleted = 1 where id = ?`

    const data = [requestId]
    await sqlUtils.query(sql, data)
    const [{ id }] = await sqlUtils.query(
        `select id from requests where id = ?`, [requestId]
    )
    return id
}


// cast a vote by a user
const castVote = async (requestId, user_id) => {
    const sql = `update votes set voted = 1 where request_id = ?`
        + ` and user_id = ? and voted = 0`
    const data = [requestId, user_id]
    const result = await sqlUtils.query(sql, data)

    if (result.affectedRows === 0) {
        const sql = `insert into votes(request_id, user_id, voted) values(?, ?, 1)`
        const data = [requestId, user_id]
        const result = await sqlUtils.query(sql, data)
        return requestId
    }
    if(result.affectedRows)
        return requestId
    return false
}

// send an email to artist stating the completion of a request
const notifyArtistIfComplete = async (requestId) => {
    const [{ name, email_recipient }] = await sqlUtils.query(
        `select u.name name, u.email email from users u`
        + ` join requests r on r.artist_id = u.id where r.id = ?`, [requestId]
    )
    const msg = {
        subject: `${name}, Your Request has reached it's goal!`,
        html: `<h2>Your Request has reached it's goal!</h2>
            <a href='http://localhost:3000/User/Requests'>
            <h5>Go to Crescendo.com for more Details</h5>
            </a>`
    }
    sendEmail(email_recipient, msg);
}


// remove a vote of a user
const removeVote = async (requestId, user_id) => {
    const sql = `update votes set voted = 0 where request_id = ? and user_id = ?`

    const data = [requestId, user_id]
    const result = await sqlUtils.query(sql, data)
    return result.affectedRows
}


module.exports = {
    getRequestsData,
    postNewRequest,
    updateRequestData,
    deleteExistingRequest,
    castVote,
    notifyArtistIfComplete,
    removeVote
}