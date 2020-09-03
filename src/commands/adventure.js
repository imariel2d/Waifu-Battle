const { userExists } = require("../models/user")
const { getStorage } = require("../models/storage.js")
const { calculateCooldown } = require("../tools/cooldown")
const { goAdventure } = require('../tools/adventure')

const commandAdventure = async (user) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const now = new Date()
            const cooldownTime = foundUser.adventureCooldown

            if (cooldownTime <= now) {
                const adventure = goAdventure().dialogue()

                storage.money += adventure.money
                await storage.save()

                const newAdventureCooldown = now.setMinutes(
                    now.getMinutes() + 30
                )
                foundUser.adventureCooldown = newAdventureCooldown
                await foundUser.save()

                response.message = adventure.message
            } else {
                const cooldown = calculateCooldown(now, cooldownTime)
                response.message =
                    user.at +
                    ", You need to wait `" +
                    cooldown.hours +
                    "hours " +
                    cooldown.minutes +
                    "minutes " +
                    cooldown.seconds +
                    "seconds` until you can use this command"
            }
        } else {
            response.message = storageResponse.message
        }
    }

    return response
}

module.exports = commandAdventure
