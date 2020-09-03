const { userExists } = require("../models/user")
const { increaseWaifuStats } = require('../models/waifu')
const { calculateCooldown } = require('../tools/cooldown');

const commandTrain = async (user) => {

    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {

        const now = new Date()
        const cooldownTime = foundUser.trainCooldown

        if (cooldownTime <= now) {
            //Get information with the waifu
            const waifuResponse = await increaseWaifuStats(foundUser)
            response.message = waifuResponse.message

            const newTrainingCooldown = now.setMinutes(now.getMinutes() + 30)
            foundUser.trainCooldown = newTrainingCooldown

            await foundUser.save()

        } else {
            const cooldown = calculateCooldown(now, cooldownTime)
            response.message = user.at + ", You need to wait `" +
                cooldown.hours + "hours " +
                cooldown.minutes +
                "minutes " +
                cooldown.seconds +
                "seconds` until you can use this command"
        }

    }

    return response
}

module.exports = commandTrain