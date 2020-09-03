const { userExists, userExistsById } = require("../models/user")
const { startFight } = require("../tools/fight")
const { fightSyntax } = require("../tools/messages")

const commandFight = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        //!wb fight @someone
        if (message.length > 2) {
            const challengedUserId = message[2].replace(/[<>@!]/g, "") // <@999999999999999> -> 999999999999999
            const challengeResponse = await userExistsById(challengedUserId)
            const challengedUser = challengeResponse.user

            if (challengedUser) {
                if (challengedUser.id === foundUser.id) {
                    response.message = `${user.at}, you can't fight with yourself!`
                } else {
                    response.message = await startFight(
                        foundUser,
                        challengedUser
                    )
                }
            } else {
                response.message = `${user.at}, that user does not exist or doesn't have a waifu!`
            }
        } else {
            response.message = fightSyntax(user)
        }
    }

    return response
}

module.exports = commandFight
