const mongoose = require("mongoose")

const buyHistory = mongoose.Schema({
    buyyer :String,
    product: [String],
    totalProduct: Number,
    totalPrice: Number
}, {timestamps: true})

const History = mongoose.model("history", buyHistory)
module.exports = History