const userManager = require('./models/user')
const fightManager = require('./tools/fight')
const storeManager = require('./models/store')
require('./db/mongoose')

const discord = require('discord.js')
const client = new discord.Client()

const prefix = "!wb"
const errorMessage = "Currently I'm suffering some problems."


client.on("ready", () => {
    console.log("Connected as " + client.user.tag)
    client.user.setActivity("Hentai", { type: "WATCHING" })
})

client.on("message", (receivedMessage) => {

    if (receivedMessage.author == client.user) {
        return
    }

    if (receivedMessage.content.startsWith(prefix)) {

        const message = receivedMessage.content.split(" ")

        if (message.length > 1) {
            const command = message[1]
            const author = receivedMessage.author

            const user = userManager.createUser(author)

            let response = undefined

            switch (command) {
                case "create":
                    userManager.findUserByAt(user.at, user, (data) => {

                        const error = data.error
                        const foundUser = data.foundUser

                        if (error) {
                            receivedMessage.channel.send(errorMessage)
                        } else {

                            response = commandCreate(user, foundUser)
                            receivedMessage.channel.send(response)
                        }
                    })
                    break

                case "waifu":
                    userManager.findUserByAt(user.at, user, (data) => {

                        const error = data.error
                        const foundUser = data.foundUser

                        if (error) {
                            receivedMessage.channel.send(errorMessage)
                        } else {

                            response = commandWaifu(message, user, foundUser)

                            if (response.userNotFound) {
                                receivedMessage.channel.send(response.userNotFound)
                            }
                            else {
                                receivedMessage.channel.send(response.embedInfo)
                            }

                        }
                    })
                    break

                case "train":
                    userManager.findUserByAt(user.at, user, (data) => {

                        const error = data.error
                        const foundUser = data.foundUser

                        if (error) {
                            receivedMessage.channel.send(errorMessage)
                        } else {

                            response = commandTrain(user, foundUser)
                            receivedMessage.channel.send(response)
                        }
                    })
                    break

                case "fight":
                    userManager.findUserByAt(user.at, user, (data) => {

                        const error = data.error
                        let foundUser = data.foundUser

                        if (error) {
                            receivedMessage.channel.send(errorMessage)
                        } else {
                            response = commandFight(message, user, foundUser, (message) => {
                                receivedMessage.channel.send(message)
                            })
                        }
                    })
                    break

                case "store":
                    userManager.findUserByAt(user.at, user, (data) => {

                        const error = data.error
                        let foundUser = data.foundUser

                        if (error) {
                            receivedMessage.channel.send(errorMessage)
                        } else {
                            response = commandStore((error, purchasables) => {

                                if (error) {
                                    receivedMessage.channel.send(errorMessage)
                                } else {
                                    receivedMessage.channel.send(purchasables)
                                }
                            })
                        }

                    })
                    break

                case "buy":
                    userManager.findUserByAt(user.at, user, (data) => {

                        const error = data.error
                        let foundUser = data.foundUser

                        if (error) {
                            receivedMessage.channel.send(errorMessage)
                        } else {
                            response = "AQUI ESTA TU WEA KBRON"
                            receivedMessage.channel.send(response)
                        }
                    })
                    break


                case "help":
                    response = commandHelp(user)
                    receivedMessage.channel.send(response)
                    break

                default:
                    receivedMessage.channel.send("That's not a valid command, use `" + `${prefix}` + " help` to see all commands.")
                    break
            }
        }
    }
})

const youNeedAWaifu = (user) => {
    return user.at + " You need to create a waifu to use this command. Use `!wb create` to create your waifu"
}

const fightSyntax = (user) => {
    return user.at + " You need to @ a waifu owner! `!wb fight @someone`"
}

// ************************* COMMANDS ********************************

const commandCreate = (user, foundUser) => {

    let messageResponse = ""

    if (foundUser) {
        messageResponse = `${user.at}, You already have a waifu!`
    } else {
        userManager.insertUser(user)
        messageResponse = `${user.at}, Your waifu was created!`
    }

    return messageResponse
}

const commandWaifu = (message, user, foundUser) => {

    let messageResponse = ""

    const isPremium = false

    if (message.length > 2 && message[2].startsWith("name:") && isPremium) {

        //5 because name: length.
        const waifuName = message[2].slice(5, message[2].length)

        foundUser.waifu.name = waifuName
        foundUser.save((err) => {
            if (err) { messageResponse = `${user.at}, Error changing your waifu name` }
        })

        messageResponse = `${user.at}, Waifu Name has been changed.`
    } else {

        if (foundUser) {
            return response = userManager.getWaifuInformation(foundUser)
        } else {
            response = {}
            response.userNotFound = youNeedAWaifu(user)
            return response
        }
    }

    return messageResponse
}

const commandTrain = (user, foundUser) => {

    let messageResponse = ""

    if (foundUser) {
        let waifuResponse = userManager.trainWaifu(foundUser, foundUser.waifu)

        if (!waifuResponse.messageResponse) {
            messageResponse = waifuResponse
        } else {

            const now = new Date()
            messageResponse = waifuResponse.messageResponse

            foundUser.waifu = waifuResponse.waifu
            foundUser.trainCooldown = now.setHours(now.getHours() + 1)
            foundUser.trainCooldown = now.setMinutes(now.getMinutes() + 20)

            foundUser.save()
        }
    } else {
        messageResponse = youNeedAWaifu(user)
    }

    return messageResponse
}

const commandFight = (message, user, foundUser, callback) => {


    let messageResponse = ""

    if (!foundUser) {
        messageResponse = youNeedAWaifu(user)
        return messageResponse
    }

    if (message.length > 2) {

        const challengedUser = message[2]

        if (foundUser) {

            userManager.findUserByAt(challengedUser, null, (data) => {

                const error = data.error
                const foundChallengedUser = data.foundUser

                if (error) {
                    messageResponse = errorMessage
                } else {

                    if (foundChallengedUser) {

                        if (foundUser.at === foundChallengedUser.at) {

                            messageResponse = `${foundChallengedUser.at}, You can't fight with yourself.`

                        } else {
                            const matchResult = fightManager.startFight(foundUser, foundChallengedUser)
                            messageResponse = matchResult
                        }

                    } else {
                        messageResponse = `${user.at}, I could not find that user!`
                    }
                }

                callback(messageResponse)
            })

        } else {
            messageResponse = youNeedAWaifu(user)
        }

    } else {

        messageResponse = fightSyntax(user)
    }

    return messageResponse
}

const commandStore = (callback) => {

    const purschasables = storeManager.getPurchasables((error, purchasables) => {

        if (error) {
            callback(error, undefined)
        } else {
            const storeInformation = new discord.RichEmbed()
                .setTitle("Store")
                .setColor('#FFA625')

            for (let i = 0; i < purchasables.length; i++) {
                storeInformation.addField(purchasables[i].name, `${purchasables[i].price}$`)
            }

            callback(undefined, storeInformation)
        }
    })
}

const commandHelp = (user) => {

    const embedInfo = new discord.RichEmbed()
        .setTitle('Commands')
        .setColor('#D480EA')
        .addField('Create', "`" + prefix + " create` Creates your waifu if you don't have one.")
        .addField('Fight', "`" + prefix + " fight @someone` Starts a fight with a waifu owner.")
        .addField('Help', "`" + prefix + " help` Sends a list of all commands.")
        .addField('Train', "`" + prefix + " train` Increases your waifu stats.")
        .addField('Waifu', "`" + prefix + " waifu` Displays your waifu information.")

    return embedInfo
}

client.login(process.env.DISCORD_API_KEY).then((result) => {
    console.log(result)
}).catch((error) => {
    console.log(error)

})


