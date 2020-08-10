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




