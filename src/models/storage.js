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
    waifuEquipments: {
        type: [Object],
        default: []
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const getStorage = async (user) => {

    const response = {}

    try {
        const discordId = user._id
        const storageExists = await Storage.findOne({
            owner: discordId
        })

        if (storageExists) {
            response.storage = storageExists

        } else {
            const newStorage = new Storage({
                owner: discordId
            })

            await newStorage.save()
            response.storage = newStorage
        }

    } catch (e) {
        console.log(e)
        response.error = true
        response.message = `There's been an error, please try again later`

    }

    return response
}

const formatItemsFromStorage = (listItems) => {
    let message = ""

    if (listItems.length <= 0) {
        message = 'You have 0 items.'
    } else {
        listItems.forEach((item) => {
            message += ` ${item.name} x${item.count}\n`
        })
    }

    return message
}

const formatEquipmentsFromStrorage = (listEquipments) => {
    let message = ""

    if (listEquipments.length <= 0) {
        message = 'You have 0 equipments.'
    } else {
        listEquipments.forEach((equipment) => {
            message += `${equipment.name} (Attack +${equipment.bonusStats.attack} / Defense +${equipment.bonusStats.defense} / Health + ${equipment.bonusStats.health})\n`
        })
    }

    return message
}

const Storage = mongoose.model('Storage', storageSchema)

module.exports = {
    Storage,
    getStorage,
    formatItemsFromStorage,
    formatEquipmentsFromStrorage
}