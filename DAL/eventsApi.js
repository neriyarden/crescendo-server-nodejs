const sqlUtils = require('../utils/sqlUtils')
const api = require('./api')
const mysql = require('mysql2/promise')


// get events data 
const getEventsData = async (
    size = 14,
    pageNum = 1,
    artist = null,
    city = null,
    when = null,
    tags = []
) => {
    console.log('city:', typeof city, city);
    const searchQuery = artist || city ? sqlUtils.sqlSearchByTextInColumn([
        { column: 'u.name', searchTerm: artist },
        { column: 'c.name', searchTerm: city },
    ]) : ``
    const daysFromNow = { today: 1, thisWeek: 7, thisMonth: 30 }[when]
    const whenQuery = `datediff(e.date, now()) between ${when === 'past' ? '-1095 and -1' : `0 and ${daysFromNow || 365}`
        }`
    tags = [tags].flat()
    console.log('tags:', tags);
    const tagsQuery = tags.length
        ? ` t.id in (${mysql.escape(tags)})` : ``

    const sql = `select u.name 'artist', e.*, v.name 'venue', c.name 'city'`
        + ` from users u`
        + ` join events e on u.id = e.artist_id`
        + ` join venues v on e.venue_id = v.id`
        + ` join cities c on c.id = v.city_id`
        + ` ${tags.length ? `join events_tags et on e.id = et.event_id` : ''}`
        + ` ${tags.length ? `join tags t on t.id = et.tag_id` : ''}`
        + ` where e.deleted = 0 and ${whenQuery}`
        + `${searchQuery ? ` and ${searchQuery}` : ``}`
        + `${tagsQuery ? ` and ${mysql.escape(tagsQuery)}` : ``}`
        + ` group by e.id`
        + `${tagsQuery ? ` having count(tag_id) = ${[tags].flat().length}` : ``}`
        + ` order by featured desc, date`
        + ` ${size > 0 ? ` limit ?` : ``}`
        + ` ${size > 0 && pageNum ? ` offset ${mysql.escape((pageNum - 1) * size)}` : ``}`

    const data = [size]
    const events = await sqlUtils.query(sql, data)
    events.forEach(event => {
        event.date = sqlUtils.formatDateToDDMMYYYY(event.date)
    })
    const featuredEvent = events.find(event => event.featured)

    return { featured: featuredEvent, events: events }
}


// get 1 event data by id
const getEventDataById = async (eventId) => {
    const sql = `select e.*, u.name 'artistName', v.name 'venueName'`
        + ` from events e`
        + ` join users u on u.id = e.artist_id`
        + ` join venues v on v.id = e.venue_id`
        + ` where e.id = ? and e.deleted = 0;`

    const data = [eventId]
    const [results] = await sqlUtils.query(sql, data)
    if (results)
        results.date = sqlUtils.formatDateToDDMMYYYY(results.date)
    results.time = results.time ? results.time.slice(0, 5) : ''
    return results
}


// get tags of event by eventId
const getEventTags = async (eventId) => {
    const sql = `select et.tag_id id, t.name name
    from events_tags et
    join tags t on et.tag_id = t.id 
    where event_id = ?`

    const data = [eventId]
    const results = await sqlUtils.query(sql, data)

    return results
}


// add new event
const postNewEvent = async ({
    user_id,
    date,
    venueName,
    cityName,
    ticketseller_url,
    time = null,
    duration = `''`,
    tour = `''`,
    description = `''`,
    img_url = null,
    came_from_request_id = 0,
    tags = [],
}) => {
    const userExists = await sqlUtils.query(
        `select * from artists where user_id = ?`, [user_id]
    )
    if (!userExists[0]) return `Can't create event of unknown artist.`
    const [results] = await sqlUtils.query(
        `select id from venues where name = ?`, [venueName]
    )
    let venue_id = results?.id
    if (!venue_id) {
        const cityId = await api.addNewCity(cityName)
        venue_id = await api.addNewVenue(venueName, cityId)
    }

    const sql = `insert into events(artist_id, date, venue_id, ticketseller_url,`
        + ` time, duration, tour, description, img_url, came_from_request_id)`
        + ` values(?,?,?,?,?,?,?,?,?,?)`
    await sqlUtils.query(sql, [
            user_id, date, venue_id, ticketseller_url, time,
            duration, tour, description, img_url, came_from_request_id
    ])

    const [newEvent] = await sqlUtils.query(
        `select id, tour, time, date, duration, venue_id, description, img_url,`
        + `  artist_id, ticketseller_url from events order by id desc limit 1`, []
    )
    if (tags.length) {
        const tagsIds = await sqlUtils.query(
            `select id tagId from tags where id in(${'?'.repeat(tags.length).split('').join(',')})`,
            tags
        )
        if (tagsIds.length > 0) {
            let tagsEventsSql = `insert into events_tags(event_id, tag_id) values`
                + ` ${tagsIds.map(idObj => idObj.tagId).map(tagId => (
                    ` ( ${mysql.escape(newEvent.id)}, ${mysql.escape(tagId)} )`
                ))}`
            await sqlUtils.query(tagsEventsSql, [])
        }
        if (came_from_request_id) {
            await sqlUtils.query(
                `update requests set deleted = 1 where id = ?`, [came_from_request_id]
            )
        }
    }
    return newEvent
}


// edit existing event
const updateEventData = async ({
    id,
    date,
    venueName,
    cityName,
    ticketseller_url,
    time = `''`,
    duration = `''`,
    tour = `''`,
    description = `''`,
    img_url = `''`,
    came_from_request_id = 0,
    sold_out = 0,
    tags = []
}) => {
    let venue_id = await sqlUtils.query(`select id from venues where name = ?`, [venueName])
    venue_id = venue_id[0]?.id
    if (!venue_id) {
        const cityId = await api.addNewCity(cityName)
        venue_id = await api.addNewVenue(venueName, cityId)
    }
    const sql = `update events set`
        + ` date = ?, venue_id = ?,`
        + ` ticketseller_url = ?, time = ?,`
        + ` duration = ?, tour = ?, description = ?,`
        + ` ${img_url ? `img_url = ${mysql.escape(img_url)},` : ''}`
        + ` came_from_request_id = ?, sold_out = ?`
        + ` where id = ? and deleted = 0;`


    const data = [
        date,
        venue_id,
        ticketseller_url,
        time,
        duration,
        tour,
        description,
        came_from_request_id,
        sold_out,
        id
    ]
    const results = await sqlUtils.query(sql, data)

    if (tags.length) {
        const tagsIds = await sqlUtils.query(
            `select id tagId from tags where id in(${'?'.repeat(tags.length).split('').join(',')})`,
            tags
        )
        if (tagsIds.length > 0) {
            await sqlUtils.query(`delete from events_tags where event_id = ?`, [id])

            let tagsEventsSql = `insert into events_tags(event_id, tag_id) values`
                + ` ${tagsIds.map(idObj => idObj.tagId).map(tagId => (
                    ` ( ${mysql.escape(id)}, ${mysql.escape(tagId)} )`
                ))}`
            await sqlUtils.query(tagsEventsSql, [])
        }
    }
    return results
}


// delete existing event
const deleteExistingEvent = async (eventId) => {
    const sql = `update events set deleted = 1 where id = ?`

    const data = [eventId]
    await sqlUtils.query(sql, data)
    const [{ id }] = await sqlUtils.query(
        `select id from events where id = ?`, [eventId]
    )
    return id
}


module.exports = {
    getEventsData,
    getEventDataById,
    getEventTags,
    postNewEvent,
    updateEventData,
    deleteExistingEvent
}