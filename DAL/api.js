const sqlUtils = require('../utils/sqlUtils')


// add a new city
const addNewCity = async (cityName) => {
    const city = await sqlUtils.query(
        `select id from cities where name = ?`, [cityName]
    )
    if (city[0]?.id)
        return city[0].id
    await sqlUtils.query(
        `insert into cities(name) values(?)`, [cityName]
    )
    const [{ id: cityId }] = await sqlUtils.query(
        `select id from cities where name = ?`, [cityName]
    )
    return cityId
}


// add a new venue
const addNewVenue = async (venueName, city_id, address = '') => {
    const venue = await sqlUtils.query(
        `select id from venues where name = ?`, [venueName]
    )
    if (venue[0]?.id)
        return venue[0].id
    await sqlUtils.query(
        `insert into venues(name, city_id, address)`
        + ` values('${venueName}', ?, '${address}')`, [city_id]
    )
    const [{ id: venueId }] = await sqlUtils.query(
        `select id from venues where name = ? and city_id = ?`, [venueName, city_id]
    )
    return venueId
}


module.exports = {
    addNewCity,
    addNewVenue,
}
