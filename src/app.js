//Data base and models
require("./db/mongoose")

//Packages
const discord = require("discord.js")

//General config
const client = new discord.Client()
const prefix = "!wb"

//Commands
const commandAdventure = require("./commands/adventure")
const commandBuy = require("./commands/buy")
const commandCreate = require("./commands/create")
const commandEquip = require("./commands/equip")
const commandFight = require("./commands/fight")
const commandHelp = require("./commands/help")
const commandIsekai = require("./commands/isekai")
const commandSell = require("./commands/sell")
const commandStorage = require("./commands/storage")
const commandStore = require("./commands/store")
const commandTimer = require("./commands/timer")
const commandTrain = require("./commands/train")
const commandWaifu = require("./commands/waifu")

client.on("ready", () => {
    console.log("Connected as " + client.user.tag)
    client.user.setActivity("!wb help")
})

client.on("message", async (receivedMessage) => {
    if (receivedMessage.author == client.user) {
        return
    }

    if (receivedMessage.content.toLowerCase().startsWith(prefix)) {
        const message = receivedMessage.content.split(" ")

        if (message.length > 1) {
            const command = message[1].toLowerCase()
            const author = receivedMessage.author

            const user = {
                discordId: author.id,
                username: author.username,
                discriminator: author.discriminator,
                at: author.toString(),
                trainCooldown: new Date(),
                fightCooldown: new Date(),
                adventureCooldown: new Date(),
                isekaiCooldown: new Date(),
                waifu: undefined,
                combatsWon: 0,
            }

            let response = undefined

            switch (command) {
                case "create":
                    const responseCreate = await commandCreate(user)
                    receivedMessage.channel.send(responseCreate.message)
                    break

                case "waifu":
                    const responseWaifu = await commandWaifu(user, message)
                    receivedMessage.channel.send(responseWaifu.message)
                    break

                case "train":
                    const responseTrain = await commandTrain(user)
                    receivedMessage.channel.send(responseTrain.message)
                    break

                case "fight":
                    const responseFight = await commandFight(user, message)
                    receivedMessage.channel.send(responseFight.message)
                    break

                case "isekai":
                    const responseIsekai = await commandIsekai(user)
                    receivedMessage.channel.send(responseIsekai.message)
                    break

                case "adventure":
                    const responseAdventure = await commandAdventure(user)
                    receivedMessage.channel.send(responseAdventure.message)
                    break

                case "store":
                    const responseStore = await commandStore(user)
                    receivedMessage.channel.send(responseStore.message)
                    break

                case "storage":
                    const responseStorage = await commandStorage(user)
                    receivedMessage.channel.send(responseStorage.message)
                    break

                case "buy":
                    const responseBuy = await commandBuy(user, message)
                    receivedMessage.channel.send(responseBuy.message)
                    break

                case "timer":
                    const responseTimer = await commandTimer(user)
                    receivedMessage.channel.send(responseTimer.message)
                    break

                case "equip":
                    const responseEquip = await commandEquip(user, message)
                    receivedMessage.channel.send(responseEquip.message)
                    break

                case "sell":
                    const responseSell = await commandSell(user, message)
                    receivedMessage.channel.send(responseSell.message)
                    break

                case "help":
                    response = await commandHelp()
                    receivedMessage.channel.send(response)
                    break

                default:
                    receivedMessage.channel.send(
                        "That's not a valid command, use `" +
                            `${prefix}` +
                            " help` to see all commands."
                    )
                    break
            }
        }
    }
})

client
    .login(process.env.DISCORD_API_KEY)
    .then((result) => {})
    .catch((error) => {
        console.log(error)
    })
