const parseResults = (events) => {
    const results = []
    const eventsIds = []
    events.forEach(event => {
        if(!eventsIds.includes(event.id)) {
            event.tags = []
            results.push(event)
            eventsIds.push(event.id)
        }
        results[results.length - 1].tags.push({tag_id: event.tag_id, tag_name: event.tag_name})
    })
    return results
}

module.exports = {
    parseResults
}