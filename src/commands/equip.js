const { userExists } = require("../models/user")
const { equipWaifu } = require("../models/waifu")
const { getStorage } = require("../models/storage")

const commandEquip = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            if (message.length > 2) {
                const equip = message[2]
                const foundEquipment = storage.waifuEquipments.find(
                    (equipment) =>
                        equipment.name.toLowerCase() === equip.toLowerCase()
                )

                if (foundEquipment) {
                    response.message = await equipWaifu(
                        foundUser,
                        storage,
                        foundEquipment
                    )
                } else {
                    response.message = `${user.at}, You don't own ${equip}!`
                }
            } else {
                response.message =
                    user.at + " use `" + "!wb equip <Name of equipment> (Example: !wb equip armor-candy)" + "`"
            }
        } else {
            response.message = storageResponse.message
        }
    }

    return response
}

module.exports = commandEquip
