const express = require('express');
const router = express.Router();
const api = require('../DAL/artistsApi');
const validations = require('../validations/validations')
const validateCookie = require('../auth/validateCookie')
const { multerStorage, uploader } = require('../utils/multer')

// setting multer for public/img/artists
const storage = multerStorage('artists')


// get artists data
router.get('/', async (req, res) => {
    const { error } = validations.searchParams.validate(req.query)
    if (error)
        return res.status(400).send({ error: error.details[0].message })
    const results = await api.getArtistsData(
        req.query.size,
        req.query.pageNum,
        req.query.startsWith,
        req.query.searchTerm
    )
    res.status(200).send(results);
});


// get a specific artist data
router.get('/:id', async (req, res,) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send(error.details[0].message)

    const results = await api.getArtistDataById(req.params.id)
    if (!results)
        res.status(404).send({ error: 'The artist with the given id was not found.' })
    res.status(200).send(results);
});


// edit artist data
router.patch('/', validateCookie, async (req, res) => {
    await uploader(req, res, storage)
    const { error } = validations.artist.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.updateArtistData({
        ...req.body,
        img_url: req.file ? `/img/artists/${req.file.filename}` : ''
    })
    res.status(200).send(results);
})




// get all the events of an artist by artist id
router.get('/:id/events', async (req, res,) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    let events = await api.getEventsOfArtist(req.params.id)
    if (events.length === 0) 
        return res.status(404).send({ error: 'No events were found for the given artist.' })

    res.status(200).send(events);
});


// get all the requests of an artist
router.get('/:id/requests', async (req, res,) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.getRequestsOfArtist(req.params.id)
    if (results.length === 0) 
        return res.status(404).send({ error: 'No requests were found for the given artist.' })
    res.status(200).send(results);
});


module.exports = router;


