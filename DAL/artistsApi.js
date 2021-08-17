const sqlUtils = require('../utils/sqlUtils')
const utils = require('../utils/utils')
const mysql = require('mysql2/promise')


// get artists data
const getArtistsData = async (
    size = 50,
    pageNum = 1,
    startsWith = null,
    searchTerm = null
) => {
    const sql = `select u.name, a.* from artists a`
        + ` join users u on a.user_id = u.id`
        + `${startsWith || searchTerm ? ' where' : ''}`
        + `${startsWith ? ` u.name like ${mysql.escape(`${startsWith}%`)}` : ``}`
        + `${startsWith && searchTerm ? ' and' : ''}`
        + `${searchTerm ? ` u.name regexp ${mysql.escape(searchTerm)}` : ``}`
        + `${size > 0 ? ` limit ?` : ``}`
        + `${size > 0 && pageNum ? ` offset ?` : ``}`

    const data = []
    if (size > 0) data.push('' + size)
    if (size > 0 && pageNum) data.push('' + ((pageNum - 1) * size))
    const results = await sqlUtils.query(sql, data)
    return results
}


// get 1 artist data
const getArtistDataById = async (userId) => {
    const sql = `select u.name, u.joined_at, a.* from artists a`
        + ` join users u on a.user_id = u.id`
        + ` where a.user_id = ?`

    const data = [userId]
    const [results] = await sqlUtils.query(sql, data)
    if (results)
        results.joined_at = sqlUtils.formatDateToDDMMYYYY(results.joined_at)
    return results
}


// edit artist data
const updateArtistData = async ({
    user_id,
    img_url,
    bio,
    link_to_spotify,
    link_to_instagram,
    link_to_facebook,
    link_to_youtube
}) => {
    let sql = `update artists set`
        + `${img_url ? ` img_url = ${mysql.escape(img_url)},` : ''}`
        + `${bio ? ` bio = ${mysql.escape(bio.replace(/"/g, `'`))},` : ''}`
        + `${link_to_spotify ? ` link_to_spotify = ${mysql.escape(link_to_spotify)},` : ''}`
        + `${link_to_instagram ? ` link_to_instagram = ${mysql.escape(link_to_instagram)},` : ''}`
        + `${link_to_facebook ? ` link_to_facebook = ${mysql.escape(link_to_facebook)},` : ''}`
        + `${link_to_youtube ? ` link_to_youtube = ${mysql.escape(link_to_youtube)},` : ''}`
    sql = sql.slice(0, -1) + ` where user_id = ?;`

    const data = [user_id]
    await sqlUtils.query(sql, data)
    const [results] = await sqlUtils.query(
        `select * from artists where user_id = ?`, data
    )
    return results
}


// get all the events of an artist
const getEventsOfArtist = async (artistId) => {
    const sql = `select u.name 'artist', c.name 'city', v.name 'venue', e.*,`
        + ` t.id tag_id, t.name tag_name`
        + ` from events e`
        + ` join users u on u.id = e.artist_id`
        + ` join venues v on e.venue_id = v.id`
        + ` join cities c on c.id = v.city_id`
        + ` left join events_tags et on et.event_id = e.id`
        + ` left join tags t on t.id = et.tag_id`
        + ` where u.id = ? and e.deleted = 0;`

    const data = [artistId]
    const events = await sqlUtils.query(sql, data)
    const results = utils.parseResults(events)
    results.forEach(event => {
        event.date = sqlUtils.formatDateToDDMMYYYY(event.date)
    })
    return results
}


// get all the requests of an artist
const getRequestsOfArtist = async (artistId) => {
    const sql = `select u.name 'artist', a.img_url, c.name 'city', r.*, sum(v.voted) 'votes'`
        + ` from requests r`
        + ` join users u on u.id = r.artist_id`
        + ` join artists a on u.id = a.user_id`
        + ` join cities c on c.id = r.city_id`
        + ` left join votes v on r.id = v.request_id`
        + ` where r.deleted = 0 and u.id = ? group by r.id`

    const data = [artistId]
    const results = await sqlUtils.query(sql, data)
    return results
}


module.exports = {
    getArtistsData,
    getArtistDataById,
    updateArtistData,
    getEventsOfArtist,
    getRequestsOfArtist
}