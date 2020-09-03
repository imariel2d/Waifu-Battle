const { userExists } = require("../models/user")
const { sellItems } = require("../tools/store")

const commandSell = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        response.message = `${user.at} ooga booga`

        if (message.length > 2) {
            const itemAndQuantity = message[2].split("-")
            const item = itemAndQuantity[0]
            const quantity = itemAndQuantity[1]

            if (item && Number.isInteger(parseInt(quantity))) {
                response.message = await sellItems(foundUser, item, quantity)
            } else {
                response.message =
                    user.at +
                    ", you have to specify an object and quantity (example: `!wb sell coal-10`)"
            }
        } else {
            response.message =
                user.at +
                ", you have to specify an object and quantity (example: `!wb sell coal-10`)"
        }
    }

    return response
}

module.exports = commandSell