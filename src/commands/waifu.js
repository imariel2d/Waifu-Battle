const discord = require("discord.js")

const { userExists, userExistsById } = require("../models/user")
const { Waifu, formatEquipment } = require("../models/waifu")

const commandWaifu = async (user, message) => {
    let response = undefined

    response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        if (message.length > 2) {
            const discordId = message[2].replace(/[<>@!]/g, "")
            response = await userExistsById(discordId)
            const foundOtherUser = response.user

            if (foundOtherUser) {
                const waifu = await Waifu.findOne({
                    master: foundOtherUser._id,
                })

                //someone else's waifu
                response.message = new discord.RichEmbed()
                    .setTitle(foundOtherUser.username + "'s waifu")
                    .setColor("#eae267")
                    .addField("Waifu Name", `${waifu.name} ${waifu.lastName}`)
                    .addField("Attack", waifu.attack)
                    .addField("Defense", waifu.defense)
                    .addField("Health", waifu.health)
                    .addField("Combats won", foundOtherUser.combatsWon)
                    .addField("Weapon", `${formatEquipment(waifu.weapon)}`)
                    .addField("Armor", `${formatEquipment(waifu.armor)}`)
            } else {
                response.message = `${user.at}, that user does not exist (or) does not have a waifu!`
            }
        } else {
            const waifu = await Waifu.findOne({
                master: foundUser._id,
            })

            //My waifu
            response.message = new discord.RichEmbed()
                .setTitle(foundUser.username + "'s waifu")
                .setColor("#DF77EC")
                .addField("Waifu Name", `${waifu.name} ${waifu.lastName}`)
                .addField("Attack", waifu.attack)
                .addField("Defense", waifu.defense)
                .addField("Health", waifu.health)
                .addField("Combats won", foundUser.combatsWon)
                .addField("Weapon", `${formatEquipment(waifu.weapon)}`)
                .addField("Armor", `${formatEquipment(waifu.armor)}`)
        }
    }

    return response
}

module.exports = commandWaifu
