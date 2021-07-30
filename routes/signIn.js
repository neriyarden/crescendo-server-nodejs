const express = require('express');
const router = express.Router();
const api = require('../DAL/signInApi');
const validations = require('../validations/validations')


// User sign in
router.post('/', async (req, res) => {
    const { error } = validations.signIn.validate(req.body)
    if (error)
        return res.send({ error: error.details[0].message })

    const email = await api.validateEmail(req.body.email)
    if (!email)
        return res.send({ error: `This email isn't registered` })

    const userId = await api.validatePassword(email, req.body.password)
    if (!userId)
        return res.send({ error: `Incorrect password` })

    res.cookie('session_id', userId, { maxAge: 15_552_000_000 })
    res.send('Signing In..')
});


module.exports = router;