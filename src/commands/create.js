const { User, userExists } = require("../models/user")
const { Waifu, getWaifuName } = require("../models/waifu")

const commandCreate = async (user) => {
    const response = await userExists(user)

    if (response.user) {
        response.message = `${user.at}, you already have a waifu!`
    } else {
        try {
            const newUser = new User(user)
            const newWaifu = new Waifu({
                master: newUser._id,
            })

            const waifuName = await getWaifuName()
            newWaifu.name = waifuName.name
            newWaifu.lastName = waifuName.lastName

            await newUser.save()
            await newWaifu.save()

            response.message = `${user.at}, your waifu was created!`
        } catch (e) {
            console.log(e)
            response.message = `${user.at}, please try again later!`
        }
    }

    return response
}

module.exports = commandCreate
