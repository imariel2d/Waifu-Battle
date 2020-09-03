const mongoose = require("mongoose")

const waifuNamesModel = {
    name: String,
}

const waifuLastNamesModel = {
    lastName: String,
}

const WaifuNamesModel = mongoose.model("Names", waifuNamesModel)
const WaifuLastNamesModel = mongoose.model("Lastnames", waifuLastNamesModel)

const attackBuff = 1 // Always one
const defenseBuff = Math.floor(Math.random() * 2) + 1 // 1 - 3
const healthkBuff = Math.floor(Math.random() * 3) + 1 // 1 - 4

const waifuSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },

    lastName: {
        type: String,
        default: "",
    },

    attack: {
        type: Number,
        default: 55,
    },

    defense: {
        type: Number,
        default: 55,
    },

    health: {
        type: Number,
        default: 55,
    },

    weapon: {
        type: Object,
        default: null,
    },

    armor: {
        type: Object,
        default: null,
    },

    master: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
})

const getWaifuName = async () => {
    try {
        const waifuNames = await WaifuNamesModel.find({})
        const waifuLastNames = await WaifuLastNamesModel.find({})

        const positionName = Math.floor(Math.random() * waifuNames.length)
        const randomName = waifuNames[positionName]

        const positionLastName = Math.floor(
            Math.random() * waifuLastNames.length
        )
        const randomLastName = waifuLastNames[positionLastName]

        const waifuName = {
            name: randomName.name,
            lastName: randomLastName.lastName,
        }

        return waifuName
    } catch (e) {
        console.log(e)
    }
}

const increaseWaifuStats = async (user) => {
    const randomOption = Math.floor(Math.random() * 10)
    let messageResponse = undefined
    let statMessage = undefined
    let waifuReponse = undefined

    try {
        const waifu = await Waifu.findOne({
            master: user._id,
        })

        if (randomOption >= 1 && randomOption <= 3) {
            waifu.attack = waifu.attack + attackBuff
            statMessage = "`+" + attackBuff + " Attack`"
        } else if (randomOption >= 4 && randomOption <= 6) {
            waifu.defense = waifu.defense + defenseBuff
            statMessage = "`+" + defenseBuff + " Defense`"
        } else {
            waifu.health = waifu.health + healthkBuff
            statMessage = "`+" + healthkBuff + " Health`"
        }

        await waifu.save()
        messageResponse = "Your waifu is now " + statMessage + " stronger"
    } catch (e) {
        messageResponse = `${user.at}, somethin went wrong, try again later!`
    }

    waifuReponse = {
        message: messageResponse,
    }

    return waifuReponse
}

const equipWaifu = async (user, storage, item) => {
    let response = ""

    try {
        const waifu = await Waifu.findOne({
            master: user._id,
        })

        const equipmentIndex = storage.waifuEquipments.findIndex((equipment) => equipment.name === item.name)
        const equipment = storage.waifuEquipments[equipmentIndex]

        storage.waifuEquipments.splice(equipmentIndex, 1)

        if (item.type.toLowerCase() === 'sword' && !item.equiped) {
            if (waifu.weapon) {
                const oldWeapon = waifu.weapon
                oldWeapon.equiped = false

                waifu.weapon = equipment
                reduceStatsWithEquipment(waifu, oldWeapon)
                increaseStatsWithEquipment(waifu, equipment)

                storage.waifuEquipments.push(oldWeapon)
            } else {
                // no? hmm then equip it!
                equipment.equiped = true
                waifu.weapon = equipment

                increaseStatsWithEquipment(waifu, equipment)
            }

            response = `${user.at}, You waifu has equiped ${item.name}!`

        } else if (item.type.toLowerCase() === 'armor' && !item.equiped) {
            if (waifu.armor) {
                const oldArmor = waifu.armor
                oldArmor.equiped = false

                waifu.armor = equipment

                reduceStatsWithEquipment(waifu, oldArmor)
                increaseStatsWithEquipment(waifu, equipment)

                storage.waifuEquipments.push(oldArmor)

            } else {
                equipment.equiped = true
                waifu.armor = equipment

                increaseStatsWithEquipment(waifu, equipment)
            }

            response = `${user.at}, You waifu has equiped ${item.name}!`

        } else {
            response = `${user.at}, You cannot equip that!`
        }

        await storage.save()
        await waifu.save()

    } catch (e) {
        console.log(e)
        response = `${user.at}, There's been an error, please try again later!`
    }

    return response
}

const increaseStatsWithEquipment = (waifu, equipment) => {
    waifu.attack += equipment.bonusStats.attack
    waifu.defense += equipment.bonusStats.defense
    waifu.health += equipment.bonusStats.health
}

const reduceStatsWithEquipment = (waifu, equipment) => {
    waifu.attack -= equipment.bonusStats.attack
    waifu.defense -= equipment.bonusStats.defense
    waifu.health -= equipment.bonusStats.health
}

const formatEquipment = (equipment) => {
    let message = ""

    if (!equipment) {
        message = `Nothing equipped`
    } else {
        message = `${equipment.name} (Attack +${equipment.bonusStats.attack} / Defense +${equipment.bonusStats.defense} / Health +${equipment.bonusStats.health})`
    }

    return message
}

const Waifu = mongoose.model("Waifu", waifuSchema)

module.exports = {
    Waifu,
    getWaifuName,
    increaseWaifuStats,
    equipWaifu,
    formatEquipment,
}
