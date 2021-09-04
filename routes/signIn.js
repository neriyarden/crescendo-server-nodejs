const express = require('express');
const router = express.Router();
const api = require('../DAL/signInApi');
const validations = require('../validations/validations')
const bcrypt = require('bcryptjs');


// User sign in
router.post('/', async (req, res) => {
    const { error } = validations.signIn.validate(req.body)
    if (error)
        return res.send({ error: error.details[0].message })

    const userCredentials = await api.validateEmail(req.body.email)
    if (!userCredentials)
        return res.status(404).send({ error: `This email isn't registered` })
    const { id, password: existingPassword } = userCredentials
    
    let isValidPassword = false
    try {
        isValidPassword = await bcrypt.compare(req.body.password, existingPassword)
    } catch (err) {
        return res.status(500).send({ error: `Could not log you in, please try again.` })
    }

    if (!isValidPassword)
        return res.status(403).send({ error: `Incorrect password` })

    res.cookie('session_id', id, { maxAge: 15_552_000_000 })
    res.status(200).send('Signing In..')
});


module.exports = router;