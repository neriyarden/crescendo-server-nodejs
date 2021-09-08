const express = require('express');
const router = express.Router();
const api = require('../DAL/signInApi');
const validations = require('../validations/validations')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


// User sign in
router.post('/', async (req, res) => {
    const { error } = validations.signIn.validate(req.body)
    if (error)
        return res.send({ error: error.details[0].message })

    const userCredentials = await api.validateEmail(req.body.email)
    console.log('userCredentials', userCredentials);
    if (!userCredentials)
        return res.status(404).send({ error: `This email isn't registered` })
    const {
        password: existingPassword,
        id: user_id,
        name,
        joined_at,
        is_artist
    } = userCredentials

    let isValidPassword = false
    try {
        isValidPassword = await bcrypt.compare(req.body.password, existingPassword)
    } catch (err) {
        return res.status(500).send({ error: `Could not log you in, please try again.` })
    }

    if (!isValidPassword)
        return res.status(403).send({ error: `Incorrect password` })

    let token;
    try {
        token = jwt.sign(
            { user_id, name, joined_at, is_artist },
            process.env.TOKEN_SECRET,
            { expiresIn: '1h' }
        )

    } catch (err) {
        console.log(err);
        return res.status(500).send('Could not perform sign in. Please try again.');
    }

    res.status(200).send({ user_id, name, is_artist, joined_at, token })
});


module.exports = router;