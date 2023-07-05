const mongoose = require("mongoose")

const sugesti = mongoose.Schema({
    userId: [],
    saran: String
})

const Suggest = mongoose.model("suggestions", sugesti)
module.exports = Suggest