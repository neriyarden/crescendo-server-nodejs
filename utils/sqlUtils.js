const mysql = require('mysql2/promise')

const sqlParams = {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
}

const query = async (sql, data) => {
    const db = await mysql.createConnection(sqlParams)
    console.log('Query:', sql);
    console.log('Data:', [...data]);
    try {
        const [results] = await db.execute(sql, [data].flat())
        return results
    } catch (e) {
        console.log('Sql db.execute Error:', e.sqlMessage);
        console.log('Sql Error Details:', e);
        return e.sqlMessage
    } finally {
        db.end()
    }
}

const sqlSearchByTextInColumn = (queries) => {
    let queryText = queries.filter(termObj => termObj.searchTerm)
        .map((termObj, i) => {
            const prefix = i > 0 ? ' and ' : ''
            return (
                prefix
                + termObj.column
                + ' regexp '
                + mysql.escape(termObj.searchTerm)
            )
        }).join('')
    return queryText
}

const formatMMDDYYToSqlFormat = (date) => {
    const delimiter = date[2]
    const [mm, dd, yyyy] = date.split(delimiter)
    return `${yyyy}-${mm}-${dd}`
}

const formatDateToDDMMYYYY = (date) => {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}


module.exports = {
    query,
    sqlSearchByTextInColumn,
    formatMMDDYYToSqlFormat,
    formatDateToDDMMYYYY
}