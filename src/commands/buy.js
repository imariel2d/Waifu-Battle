const { userExists } = require("../models/user")
const { Waifu } = require("../models/waifu")
const { buyFromStore, canUserBuyItem } = require("../tools/store")
const { prices } = require("../tools/store")

const commandBuy = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        response.message = "yee haw"

        const waifu = await Waifu.findOne({
            master: foundUser._id,
        })

        if (message.length > 2) {
            const purschasable = message[2]

            switch (purschasable.toLowerCase()) {
                case "attack":
                    const messageAttack = `${user.at}, you have bought 1 point of attack for you waifu`
                    response.message = await buyFromStore(
                        foundUser,
                        prices.attack,
                        messageAttack
                    )

                    waifu.attack += 1
                    break

                case "defense":
                    const messageDefense = `${user.at}, you have bought 1 point of defense for you waifu`
                    response.message = await buyFromStore(
                        foundUser,
                        prices.defense,
                        messageDefense
                    )

                    waifu.defense += 1
                    break

                case "health":
                    const messageHealth = `${user.at}, you have bought 1 point of health for you waifu`
                    response.message = await buyFromStore(
                        foundUser,
                        prices.health,
                        messageHealth
                    )

                    waifu.health += 1
                    break

                default:
                    const buyEquipment = await canUserBuyItem(foundUser, purschasable)
                    response.message = buyEquipment.message
                    break
            }
            await waifu.save()
        } else {
            response.message = `${user.at}, you need to write a valid item from the store!`
        }
    }

    return response
}

module.exports = commandBuy
