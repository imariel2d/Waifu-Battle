const discord = require("discord.js")

const { userExists } = require("../models/user")
const {
    getStorage,
    formatItemsFromStorage,
    formatEquipmentsFromStrorage,
} = require("../models/storage.js")

const commandStorage = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const embedInfo = new discord.RichEmbed()
                .setTitle(`${user.username}'s storage`)
                .setColor("#CB8408")
                .addField("Items", `${formatItemsFromStorage(storage.items)}`)
                .addField(
                    "Equipments",
                    `${formatEquipmentsFromStrorage(storage.waifuEquipments)}`
                )
                .addField("Money", `${storage.money}$`)

            response.message = embedInfo
        } else {
            response.message = storageResponse.message
        }
    }

    return response
}

module.exports = commandStorage