const express = require('express');
const router = express.Router();
const api = require('../DAL/requestsApi');
const validations = require('../validations/validations')
const validateToken = require('../middleware/validateToken')


// get requests data
router.get('/', async (req, res) => {
    const { error } = validations.searchParams.validate(req.query)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.getRequestsData(
        parseInt(req.query.size),
        parseInt(req.query.pageNum),
        req.query.artist,
        req.query.city,
    )
    if (!results)
        res.status(404).send({ error: 'No results were found.' })
    res.status(200).send(results);
});


// add new request
router.post('/', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.body.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

    const { error } = validations.request.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.postNewRequest(req.body)
    if (!results)
        res.status(404).send({ error: `Can't create request of unknown artist.` })
    res.status(201).send(results);
})


// edit existing request
router.patch('/', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.body.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

    const { error } = validations.request.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.updateRequestData(req.body)
    if (!results)
        res.status(404).send({ error: 'No results were found.' })
    res.status(200).send(results);
})


// delete existing request by request id
router.delete('/:request_id', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.params.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const deletedId = await api.deleteExistingRequest(req.params.request_id)
    if (!deletedId)
        res.status(424).send({ error: 'Failed to delete this request.' })
    res.status(200).send({ id: deletedId });
})


// add a vote to a request by user id & request id
router.post('/:request_id/vote/:user_id', validateToken, async (req, res) => {
    if (req.tokenData.user_id !== parseInt(req.params.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })
    const updatedRequestId = await api.castVote(
        req.params.request_id,
        req.params.user_id
    )
    await api.notifyArtistIfComplete(updatedRequestId)
    if (!updatedRequestId)
        res.status(424).send({ error: "There was a problem in casting your vote" })
    res.status(201).send({ msg: 'Vote submitted successfully.' });
})


// remove vote from a request by user id & request id
router.delete('/:request_id/vote/:user_id', validateToken, async (req, res, next) => {
    if (req.tokenData.user_id !== parseInt(req.params.user_id))
        return res.status(401).send({ error: 'Un-Authorized Access' })

    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const updatedRequestId = await api.removeVote(
        req.params.request_id,
        req.params.user_id
    )
    if (!updatedRequestId)
        res.status(424).send({ error: "There was a problem in casting your vote" })
    res.status(200).send({ msg: 'Vote submitted successfully.' });
})

module.exports = router;
