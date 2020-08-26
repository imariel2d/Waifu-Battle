const { User, userExists, userExistsById } = require('../models/user')
const { Waifu, getWaifuName, increaseWaifuStats, equipWaifu, formatEquipment } = require('../models/waifu')
const { getStorage, formatItemsFromStorage, formatEquipmentsFromStrorage } = require('../models/storage.js')

const discord = require('discord.js')

const { startFight } = require('./fight')
const { calculateCooldown } = require('./cooldown');
const { getRandromDrop } = require('./drops')
const { goAdventure } = require('./adventure')
const { buyFromStore, canUserBuyItem, prices, items, formatRequiredObjects, formatStats, sellItems } = require('./store')
const { cooldownTimeMessage, fightSyntax } = require('./messages')

const prefix = "!wb"

const commandCreate = async (user) => {

    const response = await userExists(user)

    if (response.user) {
        response.message = `${user.at}, you already have a waifu!`

    } else {
        try {
            const newUser = new User(user)
            const newWaifu = new Waifu({
                master: newUser._id
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

const commandWaifu = async (user, message) => {
    let response = undefined

    response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {

        if (message.length > 2) {
            const discordId = message[2].replace(/[<>@!]/g, '')
            response = await userExistsById(discordId)
            const foundOtherUser = response.user

            if (foundOtherUser) {
                const waifu = await Waifu.findOne({
                    master: foundOtherUser._id
                })

                //someone else's waifu
                response.message = new discord.RichEmbed()
                    .setTitle(foundOtherUser.username + "'s waifu")
                    .setColor('#eae267')
                    .addField('Waifu Name', `${waifu.name} ${waifu.lastName}`)
                    .addField('Attack', waifu.attack)
                    .addField('Defense', waifu.defense)
                    .addField('Health', waifu.health)
                    .addField('Combats won', foundOtherUser.combatsWon)
                    // .addField('Weapon', `${formatEquipment(waifu.weapon)}`)
                    // .addField('Armor', `${formatEquipment(waifu.armor)}`)

            } else {
                response.message = `${user.at}, that user does not exist (or) does not have a waifu!`
            }

        } else {
            const waifu = await Waifu.findOne({
                master: foundUser._id
            })

            //My waifu
            response.message = new discord.RichEmbed()
                .setTitle(foundUser.username + "'s waifu")
                .setColor('#DF77EC')
                .addField('Waifu Name', `${waifu.name} ${waifu.lastName}`)
                .addField('Attack', waifu.attack)
                .addField('Defense', waifu.defense)
                .addField('Health', waifu.health)
                .addField('Combats won', foundUser.combatsWon)
                // .addField('Weapon', `${formatEquipment(waifu.weapon)}`)
                // .addField('Armor', `${formatEquipment(waifu.armor)}`)
        }
    }

    return response
}

const commandTrain = async (user) => {

    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {

        const now = new Date()
        const cooldownTime = foundUser.trainCooldown

        if (cooldownTime <= now) {
            //Get information with the waifu
            const waifuResponse = await increaseWaifuStats(foundUser)
            response.message = waifuResponse.message

            const newTrainingCooldown = now.setMinutes(now.getMinutes() + 30)
            foundUser.trainCooldown = newTrainingCooldown

            await foundUser.save()

        } else {
            const cooldown = calculateCooldown(now, cooldownTime)
            response.message = user.at + ", You need to wait `" +
                cooldown.hours + "hours " +
                cooldown.minutes +
                "minutes " +
                cooldown.seconds +
                "seconds` until you can use this command"
        }

    }

    return response
}

const commandFight = async (user, message) => {

    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        //!wb fight @someone
        if (message.length > 2) {
            const challengedUserId = message[2].replace(/[<>@!]/g, '') // <@999999999999999> -> 999999999999999
            const challengeResponse = await userExistsById(challengedUserId)
            const challengedUser = challengeResponse.user

            if (challengedUser) {

                if (challengedUser.id === foundUser.id) {
                    response.message = `${user.at}, you can't fight with yourself!`

                } else {
                    response.message = await startFight(foundUser, challengedUser)

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
                response.message = `${user.at}, you and your waifu have fell into a new world and found ${randomDrop.name}`

                foundUser.isekaiCooldown = now.setMinutes(now.getMinutes() + 30)
                await foundUser.save()

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
            response.message = storageResponse.message

        }
    }
    return response
}

const commandAdventure = async (user) => {

    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const now = new Date()
            const cooldownTime = foundUser.adventureCooldown

            if (cooldownTime <= now) {
                const adventure = goAdventure().dialogue()

                storage.money += adventure.money
                await storage.save()

                const newAdventureCooldown = now.setMinutes(now.getMinutes() + 30)
                foundUser.adventureCooldown = newAdventureCooldown
                await foundUser.save()

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
            response.message = storageResponse.message

        }
    }

    return response
}

const commandStorage = async (user, message) => {

    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const embedInfo = new discord.RichEmbed()
                .setTitle(`${user.username}'s storage`)
                .setColor('#CB8408')
                .addField('Items', `${formatItemsFromStorage(storage.items)}`)
                .addField('Equipments', `${formatEquipmentsFromStrorage(storage.waifuEquipments)}`)
                .addField('Money', `${storage.money}$`)

            response.message = embedInfo
        } else {
            response.message = storageResponse.message

        }
    }

    return response
}

const commandEquip = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {

            if (message.length > 2) {
                const equip = message[2]
                const foundEquipment = storage.waifuEquipments.find((equipment) => equipment.name.toLowerCase() === equip.toLowerCase())

                if (foundEquipment) {
                    response.message = await equipWaifu(foundUser, storage, foundEquipment)

                } else {
                    response.message = `${user.at}, You don't own ${equip}!`

                }
            } else {
                response.message = user.at + " use `" + "!wb equip <Name of equipment>" + "`"

            }

        } else {
            response.message = storageResponse.message

        }
    }

    return response
}

const commandTimer = async (user) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        response.message = new discord.RichEmbed()
            .setTitle('Cooldowns')
            .setColor('#21E6EC')
            .addField('Adventure', cooldownTimeMessage(foundUser.adventureCooldown))
            .addField('Train', cooldownTimeMessage(foundUser.trainCooldown))
            .addField('Isekai', cooldownTimeMessage(foundUser.isekaiCooldown))
            .addField('Fight', cooldownTimeMessage(foundUser.fightCooldown))

    }

    return response
}

const commandStore = async (user) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        const embedInfo = new discord.RichEmbed()
            .setTitle('Store')
            .setColor('#EAFF50')
            // .addField('Sword', `${items[0].price}$\n ${formatRequiredObjects(items[0].requiredObjects)} ${formatStats(items[0].bonusStats)}`)
            // .addField('Armor', `${items[1].price}$\n ${formatRequiredObjects(items[1].requiredObjects)} ${formatStats(items[1].bonusStats)}`)
            .addField('Attack (1 point)', `${prices.attack}$`)
            .addField('Defense (1 point)', `${prices.defense}$`)
            .addField('Health (1 point)', `${prices.health}$`)

        response.message = embedInfo
    }

    return response
}

const commandBuy = async (user, message) => {
    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        response.message = 'yee haw'

        const waifu = await Waifu.findOne({
            master: foundUser._id
        })


        if (message.length > 2) {
            const purschasable = message[2]

            switch (purschasable.toLowerCase()) {
                case 'attack':
                    const messageAttack = `${user.at}, you have bought 1 point of attack for you waifu`
                    response.message = await buyFromStore(foundUser, prices.attack, messageAttack)

                    waifu.attack += 1
                    break

                case 'defense':
                    const messageDefense = `${user.at}, you have bought 1 point of defense for you waifu`
                    response.message = await buyFromStore(foundUser, prices.defense, messageDefense)

                    waifu.defense += 1
                    break

                case 'health':
                    const messageHealth = `${user.at}, you have bought 1 point of health for you waifu`
                    response.message = await buyFromStore(foundUser, prices.health, messageHealth)

                    waifu.health += 1
                    break

                // case 'sword':
                //     const buySword = await canUserBuyItem(foundUser, 'sword')
                //     response.message = buySword.message
                //     break


                // case 'armor':
                //     const buyArmor = await canUserBuyItem(foundUser, 'armor')
                //     response.message = buyArmor.message
                //     break

                default:
                    response.message = `${user.at}, that's not a valid item!`
                    break
            }
            await waifu.save()

        } else {
            response.message = `${user.at}, you need to write a valid item from the store!`
        }
    }

    return response
}

const commandSell = async (user, message) => {

    const response = await userExists(user)
    const foundUser = response.user

    if (foundUser) {
        response.message = `${user.at} ooga booga`

        if (message.length > 2) {

            const itemAndQuantity = message[2].split('-')
            const item = itemAndQuantity[0]
            const quantity = itemAndQuantity[1]

            if (item && Number.isInteger(parseInt(quantity))) {
                response.message = await sellItems(foundUser, item, quantity)

            } else {
                response.message = user.at + ", you have to specify an object and quantity (example: `!wb sell coal-10`)"
            }


        } else {
            response.message = user.at + ", you have to specify an object and quantity (example: `!wb sell coal-10`)"
        }

    }

    return response
}

const commandHelp = async (user) => {

    const embedInfo = new discord.RichEmbed()
        .setTitle('Commands')
        .setColor('#D480EA')
        .addField('Adventure', "`" + prefix + " adventure` you and your waifu embark on an adventure on a mystical new world.")
        .addField('Buy', "`" + prefix + " buy <Name of item>` buy an item from the store.")
        .addField('Create', "`" + prefix + " create` Creates your waifu if you don't have one.")
        .addField('Fight', "`" + prefix + " fight @someone` Starts a fight with a waifu owner.")
        .addField('Help', "`" + prefix + " help` Sends a list of all commands.")
        .addField('Isekai', "`" + prefix + " isekai` Sends you and your waifu into a new world and find something cool.")
        .addField('Timer', "`" + prefix + " timer` Shows all your cooldown timers.")
        .addField('Train', "`" + prefix + " train` Increases your waifu stats.")
        .addField('Sell', "`" + prefix + " sell` sells the items from your storage.")
        .addField('Storage', "`" + prefix + " storage` displays all of your items and money.")
        .addField('Store', "`" + prefix + " store` displays all items you can buy from the store.")
        .addField('Waifu', "`" + prefix + " waifu` Displays your waifu information.")

    return embedInfo
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
    commandTimer,
    commandHelp,
    commandEquip,
    commandSell
}