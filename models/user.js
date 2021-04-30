const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(pass) {
            if (pass.length < 6 || validator.isEmail(pass)) {
                throw new Error('password is invalid')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    //add auth token
    user.tokens = user.tokens.concat({ token })
    //save token to database
    await user.save()

    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    let userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    //check password with the compare password
    const matchPass = await bcrypt.compare(password, user.password)

    if (!matchPass) {
        throw new Error('Unable to login')
    }

    return user
}



//hash password
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//delete tasks when user is deleted
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const user = this

    try {
        await Task.deleteMany({ owner: user._id })
        next()
    } catch (e) {

    }

})


const User = mongoose.model('User', userSchema)

module.exports = User