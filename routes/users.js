const express = require('express');
const router = express.Router();
const api = require('../DAL/usersApi');
const validations = require('../validations/validations')
const validateCookie = require('../middleware/validateCookie')



// get all users data
router.get('/', async (req, res) => {
    res.send(await api.getAllUsersData());
});


// get user data by id
router.get('/:id', validateCookie, async (req, res) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send(error.details[0].message)

    const [results] = await api.getUserDataByID(req.params.id)
    if (!results)
        return res.status(404).send({ error: 'The user with the given id was not found.' })
    res.send(results);
});


// register new user
router.post('/', async (req, res) => {
    const { error } = validations.user.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })
    if (!(await api.isUserAvailable('name', req.body.name)))
        return res.status(400).send(
            { error: `The name '${req.body.name}' is already taken.` }
            )
    if (!(await api.isUserAvailable('email', req.body.email)))
        return res.status(400).send(
            { error: `We already have a user with the email '${req.body.email}'.` }
        )

    const [results] = await api.postNewUser(req.body)

    res.status(201).send(results);
})

// edit user data
router.patch('/', async (req, res) => {
    const { error } = validations.user.validate(req.body)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.updateUserData(req.body)
    res.status(200).send(results);
})


// get user's votes by id
router.get('/:id/votes', validateCookie, async (req, res) => {
    const { error } = validations.id.validate(req.params)
    if (error)
        return res.status(400).send({ error: error.details[0].message })

    const results = await api.getUserVotes(req.params.id)
    if (results.length === 0)
        return res.status(404).send({ error: 'No Votes were found.' })
    res.status(200).send(results);
});

module.exports = router;

