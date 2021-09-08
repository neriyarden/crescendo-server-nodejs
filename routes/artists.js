const express = require('express');
const router = express.Router();
const api = require('../DAL/artistsApi');
const validations = require('../validations/validations')
const validateToken = require('../middleware/validateToken')
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
router.get('/:user_id', async (req, res,) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send(error.details[0].message)

    const results = await api.getArtistDataById(req.params.user_id)
    if (!results)
        res.status(404).send({ error: 'The artist with the given id was not found.' })
    res.status(200).send(results);
});


// edit artist data
router.patch('/', validateToken, async (req, res) => {
    await uploader(req, res, storage)
    console.log('req.tokenData.user_id', req.tokenData.user_id);
    console.log('req.params.user_id', req.body.user_id);
    if (req.tokenData.user_id !== parseInt(req.body.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

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
router.get('/:user_id/events', async (req, res,) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    let events = await api.getEventsOfArtist(req.params.user_id)
    if (events.length === 0) 
        return res.status(404).send({ error: 'No events were found for the given artist.' })

    res.status(200).send(events);
});


// get all the requests of an artist
router.get('/:user_id/requests', async (req, res,) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.getRequestsOfArtist(req.params.user_id)
    if (results.length === 0) 
        return res.status(404).send({ error: 'No requests were found for the given artist.' })
    res.status(200).send(results);
});


module.exports = router;


