const cooldownManager = require('../tools/cooldown')
const waifuManager = require('../tools/waifu')

const mongoose = require('mongoose')

//User model for database
const userSchema = {
    discordId: String,
    username: String,
    discriminator: String,
    waifu: {
        name: String,
        lastName: String,
        attack: Number,
        defense: Number,
        health: Number,
    },
    at: String,
    trainCooldown: Date,
    fightCooldown: Date,
    combatsWon: Number,
}

const UserModel = mongoose.model("User", userSchema)

const initialWaifu = undefined

//User constructor
const User = function (author) {
    this.discordId = author.id
    this.username = author.username
    this.discriminator = author.discriminator
    this.waifu = initialWaifu
    this.at = author.toString()
    this.trainCooldown = new Date()
    this.fightCooldown = new Date()
    this.combatsWon = 0
}

const createUser = (author) => {
    const newUser = new User(author)
    return newUser
}

const insertUser = (newUser) => {

    //User's waifu object
    let waifu = waifuManager.createWaifu()

    waifuManager.getRandomWaifuName(waifu, (waifuWithName) => {

        waifu = waifuWithName

        const user = new UserModel({
            discordId: newUser.id,
            username: newUser.username,
            discriminator: newUser.discriminator,
            waifu: waifu,
            at: newUser.at,
            trainCooldown: newUser.trainCooldown,
            fightCooldown: newUser.fightCooldown,
            combatsWon: 0,
        })

        user.save()
    })
}

const trainWaifu = (user, waifu) => {

    const now = new Date()
    const cooldownHour = user.trainCooldown

    if (cooldownHour <= now) {
        return waifuManager.increaseWaifuStats(waifu)
    } else {

        const cooldown = cooldownManager.calculateCooldown(now, cooldownHour)
        return user.at + ", `" + cooldown.hours + "hours " + cooldown.minutes + "minutes " + cooldown.seconds + "seconds` until you can use this command"
    }
}

const getWaifuInformation = (user) => {
    return waifuManager.getWaifuInformation(user)
}

const userExists = (user, callback) => {

    UserModel.findOneAndUpdate({ avatar: user.avatar }, (err, foundUser) => {

        const callbackData = {
            foundUser: foundUser,
            error: err,
        }

        callback(callbackData)
    })
}

const findUserByAt = (userAt, user = null, callback) => {

    if (user) {
        UserModel.findOneAndUpdate({ at: userAt.replace(/!/g, '') }, { username: user.username, discriminator: user.discriminator }, (err, foundUser) => {
            const callbackData = {
                foundUser: foundUser,
                error: err,
            }

            callback(callbackData)
        })
    }
    else {
        UserModel.findOne({ at: userAt.replace(/!/g, '')}, (err, foundUser) => {
            const callbackData = {
                foundUser: foundUser,
                error: err,
            }

            callback(callbackData)
        })
    }
}

module.exports = {
    insertUser: insertUser,
    createUser: createUser,
    UserModel: UserModel,
    trainWaifu: trainWaifu,
    getWaifuInformation: getWaifuInformation,
    userExists: userExists,
    findUserByAt: findUserByAt,
}