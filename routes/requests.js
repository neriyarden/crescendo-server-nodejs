const express = require('express');
const router = express.Router();
const api = require('../DAL/requestsApi');
const validations = require('../validations/validations')
const validateCookie = require('../auth/validateCookie')


// get requests data
router.get('/', async (req, res) => {
    const { error } = validations.searchParams.validate(req.query)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.getRequestsData(
        req.query.size,
        req.query.pageNum,
        req.query.artist,
        req.query.city,
    )
    if (!results)
        res.status(404).send({ error: 'No results were found.' })
    res.send(results);
});


// add new request
router.post('/', validateCookie, async (req, res) => {
    const { error } = validations.request.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.postNewRequest(req.body)
    if (!results)
        res.status(404).send({ error: 'No results were found.' })
    res.send(results);
})


// edit existing request
router.patch('/', validateCookie, async (req, res) => {
    const { error } = validations.request.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.updateRequestData(req.body)
    if (!results)
        res.status(404).send({ error: 'No results were found.' })
    res.send(results);
})


// delete existing request by request id
router.delete('/:request_id', validateCookie, async (req, res) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const deletedId = await api.deleteExistingRequest(req.params.request_id)
    if (!deletedId)
        res.status(404).send({ error: 'Failed to delete this request.' })
    res.send({ id: deletedId });
})


// add a vote to a request by user id & request id
router.post('/:request_id/vote/:user_id', validateCookie, async (req, res) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })
    const updatedRequestId = await api.castVote(
        req.params.request_id,
        req.params.user_id
    )
    await api.notifyArtistIfComplete(updatedRequestId)
    if (!updatedRequestId)
        res.status(404).send({ error: "There was a problem in casting your vote" })
    res.send({ msg: 'Vote submitted successfully.' });
})


// remove vote from a request by user id & request id
router.delete('/:request_id/vote/:user_id', validateCookie, async (req, res, next) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const updatedRequestId = await api.removeVote(
        req.params.request_id,
        req.params.user_id
    )
    if (!updatedRequestId)
        res.status(404).send({ error: "There was a problem in casting your vote" })
    res.send({ msg: 'Vote submitted successfully.' });
})

module.exports = router;
