const mongoose = require('mongoose')

const storageSchema = new mongoose.Schema({

    items: {
        type: [Object],
        default: []
    },
    money: {
        type: Number,
        default: 0,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const Storage = mongoose.model('Storage', storageSchema)

module.exports = Storage