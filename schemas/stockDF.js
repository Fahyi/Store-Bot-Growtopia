const mongoose = require('mongoose')

const stockInformation = mongoose.Schema({
    nameProduct: String, //name
    product: [String], //stock
    price: {
        type: Number,
    },
    code: {
        type: String,
        require: true

    },
    type: {
        type: String,
        require: true
    } //code
}
)

const Stock = mongoose.model('stock', stockInformation)
module.exports = Stock