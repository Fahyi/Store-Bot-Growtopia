const mongoose = require('mongoose')

const userInformation = mongoose.Schema({
    userId: {
        type: String,
    },
    growID: {
        type: String,
        require: true
    },
    balance: {
        type: Number,
        default: 0
    },
    isPremium: {
        type: Boolean,
        default: false
    }},
    {timestamps: true}
)

const User = mongoose.model('user', userInformation)
module.exports = User