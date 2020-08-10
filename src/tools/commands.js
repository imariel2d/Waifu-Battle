const User = require('../models/user')
const discord = require('discord.js')

const { createWaifu, increaseWaifuStats } = require('./waifu')
const { startFight } = require('./fight')
const { calculateCooldown } = require('./cooldown');

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

const commandHelp = async (user) => {

    const discordId = user.discordId
    const userExist = await User.findOne({ discordId })
    userExist.money = 10000
    await userExist.save()

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
    commandHelp,
}