const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const userRouter = new express.Router();

userRouter.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

userRouter.post('/users/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.send({ user, token })

    } catch (e) {
        res.status(400).send(e)
    }
})


//logout from current session
userRouter.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

userRouter.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//wire up auth middleware to the specific path
userRouter.get('/users/me', auth, async (req, res) => {
    res.send(req.user)

})

userRouter.patch('/users/me', auth, async (req, res) => {
    const user = req.user
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isOpValid = updates.every(field => allowedUpdates.includes(field))

    if (!isOpValid) {
        return res.status(400).send({ error: 'Invalid update(s)' })
    }

    try {
        updates.forEach(update => user[update] = req.body[update])

        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})


userRouter.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne();
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error);
    }

})

module.exports = userRouter