const { userExists } = require("../models/user")
const { getRandromDrop } = require("../tools/drops")
const { calculateCooldown } = require("../tools/cooldown")
const { getStorage } = require("../models/storage.js")

const commandIsekai = async (user) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const now = new Date()
            const cooldownTime = foundUser.isekaiCooldown

            const randomDrop = getRandromDrop()

            if (cooldownTime <= now) {
                const storageHasObjet = storage.items.find(
                    (item) => item.name === randomDrop.name
                )

                if (!storageHasObjet) {
                    storage.items.push(randomDrop)
                } else {
                    for (let i = 0; i < storage.items.length; i++) {
                        if (randomDrop.name === storage.items[i].name) {
                            const newItem = storage.items[i]
                            newItem.count++
                            storage.items.push(newItem)
                            storage.items.splice(i, 1)
                            break
                        }
                    }
                }
                await storage.save()
                response.message = `${user.at}, you and your waifu have fell into a new world and found ${randomDrop.name}`

                foundUser.isekaiCooldown = now.setMinutes(now.getMinutes() + 0)
                await foundUser.save()
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

module.exports = commandIsekai
