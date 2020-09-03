const discord = require("discord.js")

const { userExists } = require("../models/user")
const {
    prices,
    items,
    formatRequiredObjects,
    formatStats,
} = require("../tools/store")

const commandStore = async (user) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const embedInfo = new discord.RichEmbed()
            .setTitle("Store")
            .setColor("#EAFF50")

        items.forEach((item) => {
            embedInfo.addField(`${item.name}`, `${item.price}$\n ${formatRequiredObjects(item.requiredObjects)} BONUS STATS: ${formatStats(item.bonusStats)}`)
        })

        embedInfo
            .addField("Attack (1 point)", `${prices.attack}$`)
            .addField("Defense (1 point)", `${prices.defense}$`)
            .addField("Health (1 point)", `${prices.health}$`)

        response.message = embedInfo
    }

    return response
}

module.exports = commandStore
