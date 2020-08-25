const { Storage } = require('../models/storage')
const { Waifu } = require('../models/waifu')

const cooldownManager = require('./cooldown');
const Discord = require('discord.js');

const attackPoints = 1;
const defensePoints = 0.5;
const healthPoints = 0.3;

const startFight = async (user, challengedUser) => {

    const now = new Date();
    const cooldownHour = user.fightCooldown;

    if (cooldownHour <= now) {

        if (user.availableFights <= 0) user.availableFights = 5


        const winRates = await calculateUsersWinRate(user, challengedUser)
        const winner = decideWinner(winRates)

        let winResult = {};

        //If the person who sent the fight request lost...
        if (user.discordId !== winner.discordId) {
            const money = 500

            const moneyReceived = await receiveMoney(winner, money)
            const moneyTaken = await receiveMoney(user, -money)

            user.availableFights = 0

            winResult = new Discord.RichEmbed()
                .setTitle('Match result')
                .setColor('#F12C2C')
                .addField('Winner', winner.username + '#' + winner.discriminator)
                .addField('Reward', `${winner.username} has received ${moneyReceived}$.`)
                .addField(`${user.username} available fights`, `${user.availableFights}`)
                .addField(`${user.username} money`, `${moneyTaken}$`)

        } else {
            const moneyReceived = await receiveMoney(user, 200)
            user.combatsWon += 1;
            user.availableFights--

            winResult = new Discord.RichEmbed()
                .setTitle('Match result')
                .setColor('#24F62B')
                .addField('Winner', winner.username + '#' + winner.discriminator)
                .addField('Reward', `You have received ${moneyReceived}$.`)
                .addField(`${user.username} available fights`, `${user.availableFights}`)

        }

        if (user.availableFights <= 0) {
            const newFightCooldown = now.setMinutes(now.getMinutes() + 30)
            user.fightCooldown = newFightCooldown;
        }

        await user.save();
        return matchResult = winResult;

    } else {
        const cooldown = cooldownManager.calculateCooldown(now, cooldownHour)
        return user.at + ", You have to wait `" + cooldown.hours + "hours " + cooldown.minutes + "minutes " + cooldown.seconds + "seconds` until you can use this command"
    }
}

const receiveMoney = async (user, money) => {

    try {
        const storage = await Storage.findOne({
            owner: user._id
        })

        if (storage) {
            storage.money += money
            await storage.save()

        } else {
            const newStorage = new Storage({
                owner: user._id
            })
            newStorage.money += money
            await newStorage.save()
        }

        return money

    } catch (e) {
        console.log(e)
        return 0
    }
}

const decideWinner = (winRates) => {

    //Some algorithms to decide winner
    const randomWinNumber = (Math.random() * 100)
    let winner = {};

    if (winRates.userWithPriority) {

        const userWithPriority = winRates.userWithPriority;

        if (randomWinNumber >= 0 && randomWinNumber <= userWithPriority.userWinRate) {
            winner = userWithPriority.user
        } else {
            winner = winRates.userWithOutPriority.user
        }

    } else {

        if (randomWinNumber >= 0 && randomWinNumber <= 50) {
            winner = winRates.userOne.user
        } else {
            winner = winRates.userTwo.user
        }
    }

    return winner;

}

const calculateUsersWinRate = async (user, challengedUser) => {

    try {
        const userWaifu = await Waifu.findOne({
            master: user._id
        })

        const challengedUserWaifu = await Waifu.findOne({
            master: challengedUser._id
        })

        const userPoints = (userWaifu.attack * attackPoints) +
            (userWaifu.defense * defensePoints) +
            (userWaifu.health * healthPoints)

        const challengedUserPoints = (challengedUserWaifu.attack * attackPoints) +
            (challengedUserWaifu.defense * defensePoints) +
            (challengedUserWaifu.health * healthPoints)

        const priority = getPriority(user, userPoints, challengedUser, challengedUserPoints)

        if (priority.userPriority === user) {
            return winRates = {
                userWithPriority: {
                    user: user,
                    userWinRate: 50 + priority.priority
                },
                userWithOutPriority: {
                    user: challengedUser,
                    challengedUserWinRate: 50 - priority.priority,
                },
            }
        } else if (priority.userPriority === challengedUser) {
            return winRates = {
                userWithPriority: {
                    user: challengedUser,
                    userWinRate: 50 + priority.priority
                },
                userWithOutPriority: {
                    user: user,
                    challengedUserWinRate: 50 - priority.priority,
                },
            }
        } else {
            return winRates = {
                userOne: {
                    user: user
                },
                userTwo: {
                    user: challengedUser
                },
            }
        }
    } catch (e) {
        console.log(e)

    }
}

const getPriority = (user, userPoints, challengedUser, challengedUserPoints) => {

    if (userPoints > challengedUserPoints) {
        return userPriority = {
            priority: userPoints - challengedUserPoints,
            userPriority: user,
        }
    }
    else if (challengedUserPoints > userPoints) {
        return userPriority = {
            priority: challengedUserPoints - userPoints,
            userPriority: challengedUser,
        }
    }
    else
        return 0
}

module.exports = {
    startFight,
}