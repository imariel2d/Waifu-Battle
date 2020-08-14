const User = require('../models/user')
const Storage = require('../models/storage.js')

const discord = require('discord.js')
const mongoose = require('mongoose')

const { createWaifu, increaseWaifuStats } = require('./waifu')
const { startFight } = require('./fight')
const { calculateCooldown } = require('./cooldown');
const { getRandromDrop } = require('./drops')
const { goAdventure } = require('./adventure')
const { update } = require('../models/user')

const prefix = "!wb"

const commandCreate = async (user) => {

    const response = {}

    try {
        const discordId = user.discordId
        const userExists = await User.findOne({ discordId })

        if (userExists) {
            response.message = `${user.at}, you already have a waifu`

        } else {
            const newUser = new User(user)
            newUser.waifu = await createWaifu()
            await newUser.save()

            response.user = newUser
            response.message = `${user.at}, your waifu has been created!`
        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later!`

    }

    return response
}

const commandWaifu = async (user) => {

    const response = {}

    try {
        const discordId = user.discordId
        const userExists = await User.findOne({ discordId })

        if (userExists) {
            response.message = new discord.RichEmbed()
                .setTitle(userExists.username + "'s waifu")
                .setColor('#DF77EC')
                .addField('Waifu Name', `${userExists.waifu.name} ${userExists.waifu.lastName}`)
                .addField('Attack', userExists.waifu.attack)
                .addField('Defense', userExists.waifu.defense)
                .addField('Health', userExists.waifu.health)
                .addField('Combats won', userExists.combatsWon)

        } else {
            response.message = youNeedAWaifu(user)
        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later`
    }

    return response
}

const commandTrain = async (user) => {

    const response = {}

    try {
        const discordId = user.discordId
        const userExists = await User.findOne({ discordId })

        if (userExists) {

            const now = new Date()
            const cooldownTime = userExists.trainCooldown

            if (cooldownTime <= now) {
                //Get information with the waifu
                const waifuResponse = increaseWaifuStats(userExists.waifu)

                //Set up message
                response.message = waifuResponse.message

                //Modify user then save it 

                const newTrainingCooldown = now.setMinutes(now.getMinutes() + 30)

                userExists.waifu = waifuResponse.waifu
                userExists.trainCooldown = newTrainingCooldown

                await userExists.save()

            } else {
                const cooldown = calculateCooldown(now, cooldownTime)
                response.message = user.at + ", You need to wait `" +
                    cooldown.hours + "hours " +
                    cooldown.minutes +
                    "minutes " +
                    cooldown.seconds +
                    "seconds` until you can use this command"
            }

        } else {
            response.message = youNeedAWaifu(user)

        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later!`
    }

    return response
}

const commandFight = async (user, message) => {

    const response = {}

    try {
        const discordId = user.discordId
        const userExists = await User.findOne({ discordId })

        if (userExists) {

            //!wb fight @someone
            if (message.length > 2) {
                const challengedUserId = message[2].replace(/[<>@!]/g, '') // <@999999999999999> -> 999999999999999
                const challengedUser = await User.findOne({ discordId: challengedUserId })

                if (challengedUser) {

                    if (challengedUser.id === userExists.id) {
                        response.message = `${user.at}, you can't fight with yourself!`

                    } else {
                        response.message = await startFight(userExists, challengedUser)
                    }

                } else {
                    response.message = `${user.at}, that user does not exist or doesn't have a waifu!`
                }
            } else {
                response.message = fightSyntax(user)
            }

        } else {
            response.message = youNeedAWaifu(user)
        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later!`
    }

    return response
}

const commandIsekai = async (user) => {

    const response = {}

    try {
        const discordId = user.discordId
        const userExists = await User.findOne({ discordId })

        if (userExists) {
            const now = new Date()
            const cooldownTime = userExists.isekaiCooldown

            const randomDrop = getRandromDrop()
            const storage = await Storage.findOne({
                owner: userExists._id
            })

            if (cooldownTime <= now) {

                if (storage) {
                    const storageHasObjet = storage.items.find((item) => item.name === randomDrop.name)

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

                } else {
                    const newStorage = new Storage({
                        owner: userExists._id
                    })
                    newStorage.items.push(randomDrop)
                    await newStorage.save()
                }

                userExists.isekaiCooldown = now.setMinutes(now.getMinutes() + 30)
                await userExists.save()

                response.message = `${user.at}, you and your waifu have fell into a new world and found ${randomDrop.name}`

            } else {
                const cooldown = calculateCooldown(now, cooldownTime)
                response.message = user.at + ", You need to wait `" +
                    cooldown.hours + "hours " +
                    cooldown.minutes +
                    "minutes " +
                    cooldown.seconds +
                    "seconds` until you can use this command"

            }

        } else {
            response.message = youNeedAWaifu(user)

        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later!`
    }

    return response
}

const commandAdventure = async (user) => {
    const response = {}

    try {
        const discordId = user.discordId
        const userExists = await User.findOne({ discordId })

        if (userExists) {

            const adventure = goAdventure().dialogue()

            const storage = await Storage.findOne({
                owner: userExists._id
            })

            const now = new Date()
            const cooldownTime = userExists.adventureCooldown

            if (cooldownTime <= now) {
                if (storage) {
                    storage.money += adventure.money
                    await storage.save()

                    const newAdventureCooldown = now.setMinutes(now.getMinutes() + 30)
                    userExists.adventureCooldown = newAdventureCooldown
                    await userExists.save()

                } else {
                    const newStorage = new Storage({
                        owner: userExists._id
                    })
                    newStorage.money += adventure.money
                    await newStorage.save()
                }

                response.message = adventure.message
            } else {
                const cooldown = calculateCooldown(now, cooldownTime)
                response.message = user.at + ", You need to wait `" +
                    cooldown.hours + "hours " +
                    cooldown.minutes +
                    "minutes " +
                    cooldown.seconds +
                    "seconds` until you can use this command"
            }

        } else {
            response.message = youNeedAWaifu(user)
        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later`
    }

    return response
}

const commandStore = async (user) => {
    const response = {}
    const userResponse = await userExists(user)

    if (userResponse.user) {
        const embedInfo = new discord.RichEmbed()
            .setTitle('Store')
            .setColor('#EAFF50')
            .addField('Attack (1 point)', '2000$')
            .addField('Defense (1 point)', '1500$')
            .addField('Health (1 point)', '1000$')

        response.message = embedInfo

    } else {
        response.message = userResponse.message

    }

    return response
}

const commandBuy = async (user, message) => {
    const response = {}
    const userResponse = await userExists(user)

    if (userResponse.user) {
        response.message = 'yee haw'

        if (message.length > 2) {
            const purschasable = message[2]

            if (purschasable.toLowerCase() === 'attack') {
                userResponse.user.waifu.attack += 1

                const message = `${user.at}, you have bought 1 point of attack for you waifu`
                response.message = await buyFromStore(userResponse.user, 2000, message)

            } else if (purschasable.toLowerCase() === 'defense') {
                userResponse.user.waifu.defense += 1

                const message = `${user.at}, you have bought 1 point of defense for you waifu`
                response.message = await buyFromStore(userResponse.user, 1500, message)

            } else if (purschasable.toLowerCase() === 'health') {
                userResponse.user.waifu.health += 1

                const message = `${user.at}, you have bought 1 point of health for you waifu`
                response.message = await buyFromStore(userResponse.user, 1000, message)

            } else {
                response.message = `${user.at}, that's not a valid item!`
            }

            await userResponse.user.save()

        } else {
            response.message = `${user.at}, you need to write a valid item from the store!`
        }

    } else {
        response.message = userResponse.message

    }

    return response
}

const commandStorage = async (user, message) => {

    const response = {}
    const userResponse = await userExists(user)

    if (userResponse.user) {

        const storage = await Storage.findOne({
            owner: userResponse.user._id
        })

        if (storage) {
            const embedInfo = new discord.RichEmbed()
                .setTitle(`${user.username}'s storage`)
                .setColor('#CB8408')
                .addField('Items', `${formatItemsFromStorage(storage.items)}`)
                .addField('Money', `${storage.money}$`)

            response.message = embedInfo

        } else {
            const newStorage = new Storage({
                owner: userResponse.user._id
            })

            await newStorage.save()
            const embedInfo = new discord.RichEmbed()
                .setTitle(`${user.username}'s storage`)
                .setColor('#CB8408')
                .addField('Items', `${formatItemsFromStorage(newStorage.items)}`)
                .addField('Money', `${newStorage.money}`)

            response.message = embedInfo
        }

    } else {
        response.message = userResponse.message

    }

    return response
}

const commandHelp = async (user) => {

    const discordId = user.discordId
    const userExist = await User.findOne({ discordId })
    userExist.money = 10000
    await userExist.save()

    const embedInfo = new discord.RichEmbed()
        .setTitle('Commands')
        .setColor('#D480EA')
        .addField('Adventure', "`" + prefix + " adventure` you and your waifu embark on an adventure on a mystical new world.")
        .addField('Buy', "`" + prefix + " buy <Name of item>` buy an item from the store.")
        .addField('Create', "`" + prefix + " create` Creates your waifu if you don't have one.")
        .addField('Fight', "`" + prefix + " fight @someone` Starts a fight with a waifu owner.")
        .addField('Help', "`" + prefix + " help` Sends a list of all commands.")
        .addField('Isekai', "`" + prefix + " isekai` Sends you and your waifu into a new world and find something cool.")
        .addField('Train', "`" + prefix + " train` Increases your waifu stats.")
        .addField('Storage', "`" + prefix + " storage` displays all of your items and money.")
        .addField('Store', "`" + prefix + " store` displays all items you can buy from the store.")
        .addField('Waifu', "`" + prefix + " waifu` Displays your waifu information.")

    return embedInfo
}


/* Validation */
const userExists = async (user) => {
    const response = {}

    const discordId = user.discordId
    const userExists = await User.findOne({ discordId })

    try {

        if (userExists) {
            response.user = userExists

        } else {
            response.message = youNeedAWaifu(user)

        }

    } catch (e) {
        console.log(e)
        response.message = `There's been an error, please try again later`
    }

    return response
}

const buyFromStore = async (user, itemPrice, message) => {
    let messageToSend = ""

    const storage = await Storage.findOne({
        owner: user._id
    })

    if (storage) {
        const currentMoney = storage.money

        if (currentMoney < itemPrice) {
            messageToSend = `${user.at}, you don't have enough money`
        } else {
            storage.money -= itemPrice
            messageToSend = message
        }

        await storage.save()

    } else {
        const newStorage = await new Storage({
            owner: user._id
        })

        await newStorage.save()
        messageToSend = `${user.at}, you don't have enough money`
    }

    return messageToSend
}

const formatItemsFromStorage = (listItems) => {
    let message = ""

    if (listItems.length <= 0) {
        message = 'You have 0 items.'
    } else {
        listItems.forEach((item) => {
            message += ` ${item.name} x${item.count}\n`
        })
    }

    return message
}

/*Messages */
const youNeedAWaifu = (user) => {
    return user.at + " You need to create a waifu to use this command. Use `!wb create` to create your waifu"
}

const fightSyntax = (user) => {
    return user.at + " You need to @ a waifu owner! `!wb fight @someone`"
}

module.exports = {
    commandCreate,
    commandWaifu,
    commandTrain,
    commandFight,
    commandIsekai,
    commandAdventure,
    commandStore,
    commandBuy,
    commandStorage,
    commandHelp,
}