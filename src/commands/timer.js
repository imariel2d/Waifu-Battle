const discord = require("discord.js")

const { userExists } = require("../models/user")
const { cooldownTimeMessage } = require("../tools/messages")

const commandTimer = async (user) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        response.message = new discord.RichEmbed()
            .setTitle("Cooldowns")
            .setColor("#21E6EC")
            .addField(
                "Adventure",
                cooldownTimeMessage(foundUser.adventureCooldown)
            )
            .addField("Train", cooldownTimeMessage(foundUser.trainCooldown))
            .addField("Isekai", cooldownTimeMessage(foundUser.isekaiCooldown))
            .addField("Fight", cooldownTimeMessage(foundUser.fightCooldown))
    }

    return response
}

module.exports = commandTimer
