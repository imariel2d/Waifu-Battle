const mongoose = require('mongoose');

//Store model for database
const purchasableSchema = {

    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },
}

const PurchasableModel = mongoose.model('Purchasable', purchasableSchema)

const purchasable = new PurchasableModel({
    name: 'health',
    description: "Increases your waifu's health!",
    price: 2000,
})

const getPurchasables = (callback) => {

    PurchasableModel.find({}, (error, purchasables) => {

        if (error)
            callback(error, undefined)
        else
            callback(null, purchasables)

    })
}

module.exports = {
    getPurchasables: getPurchasables
}


