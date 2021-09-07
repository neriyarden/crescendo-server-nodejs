const express = require('express');
const router = express.Router();
const api = require('../DAL/eventsApi');
const validations = require('../validations/validations')
const validateToken = require('../middleware/validateToken')
const { multerStorage, uploader } = require('../utils/multer')

// setting multer for public/img/events
const storage = multerStorage('events')


// get events data
router.get('/', async (req, res) => {
    const { error } = validations.searchParams.validate(req.query)
    if (error) {
        return res.status(400).send({ error: error.details[0].message })
    }

    const results = await api.getEventsData(
        '' + req.query.size,
        '' + req.query.pageNum,
        req.query.artist,
        req.query.city,
        req.query.when,
        req.query.tags
    )
        if (results.events.length === 0)
        return res.status(200).send({ error: 'End of results' })
        res.status(200).send(results);
});


// get a specific event data
router.get('/:id', async (req, res) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send(error.details[0].message)

    const results = await api.getEventDataById(req.params.id)
    if (results.length === 0)
        return res.status(200).send(
            { error: 'No results were found for the given event' }
            )
    res.status(200).send(results);
});


// TODO: check -> is this used?
// get a specific event tags
router.get('/:id/tags', async (req, res) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send(error.details[0].message)

    const results = await api.getEventTags(req.params.id)
    if (results.length === 0)
        res.status(200).send({ error: 'No results were found for the given event' })
    res.status(200).send(results);
});


// add new event
router.post('/', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.body.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

    await uploader(req, res, storage)
    req.body.tags = req.body.tags.split(',')
    const { error } = validations.event.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.postNewEvent({
        ...req.body,
        img_url: req.file ? `/img/events/${req.file.filename}` : ''
    })
    if (!results)
        res.status(404).send({ error: 'No results were found' })
    res.status(201).send(results);
})


// edit existing event
router.patch('/', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.body.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

    await uploader(req, res, storage)
    req.body.tags = req.body.tags.split(',')
    const { error } = validations.event.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.updateEventData({
        ...req.body,
        img_url: req.file ? `/img/events/${req.file.filename}` : ''
    })
    res.status(200).send(results);
})


// delete existing event by event id
router.delete('/:event_id', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.params.user_id))
    return res.status(401).send({ error: 'Un-Authorized Access' })
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send(error.details[0].message)

    const deletedId = await api.deleteExistingEvent(req.params.event_id)
    if (!deletedId)
        res.status(404).send({ error: 'Failed to delete this event' })
    res.status(200).send({ eventId: deletedId });
})


module.exports = router; 
