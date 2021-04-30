const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const taskRouter = new express.Router;


taskRouter.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

taskRouter.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    const queryDone = req.query.done
    if (queryDone) {
        match.done = (queryDone === 'true' ? true : false)
    }

    if(req.query.sortBy){
        const [key, value] = req.query.sortBy.split(":")
        sort[key] = (value === 'desc' ? -1 : 1)
    }

    try {
        const tasks = await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(tasks.tasks)
    } catch (e) {
        res.status(400).send(e)
    }

})

taskRouter.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;


    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})

taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'done']
    const isOpValid = updates.every(field => allowedUpdates.includes(field))

    if (!isOpValid) {
        return res.status(400).send({ error: 'Invalid update(s)' })
    }

    try {
        const updatedTask = await Task.findOne({ _id, owner: req.user._id })
        updates.forEach(update => updatedTask[update] = req.body[update])

        if (!updatedTask) {
            return res.status(404).send()
        }
        res.send(updatedTask)
    } catch (e) {
        res.status(404).send(e)
    }
})

taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        let task = await Task.findOneAndDelete({ _id, owner: req.user._id })

        if (!task) {
            res.status(404).send({ error: 'task not found' })
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})


module.exports = taskRouter