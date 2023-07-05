const mongoose = require("mongoose")

const depoWorld = mongoose.Schema({
    world: {
        type: String,
        require: true
    },
    owner: {
        type: String,
        require: true   
    },
    bot: {
        type: String,
        require: true
    }
    
})

const Depo = mongoose.model('depo', depoWorld)
module.exports = Depo