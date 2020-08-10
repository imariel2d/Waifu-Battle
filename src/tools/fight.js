const cooldownManager = require('./cooldown');
const waifuManager = require('./waifu');

const Discord = require('discord.js');

const attackPoints = 1;
const defensePoints = 0.5;
const healthPoints = 0.3;

const startFight = async (user, challengedUser) => {

    const now = new Date();
    const cooldownHour = user.fightCooldown;

    if (cooldownHour <= now) {
        const winRates = calculateUsersWinRate(user, challengedUser)
        const winner = decideWinner(winRates)

        let winResult = {};

        //If the person who sent the fight request lost...
        if (user.discordId !== winner.discordId) {

            winResult = new Discord.RichEmbed()
                .setTitle('Match result')
                .setColor('#F12C2C')
                .addField('Winner', winner.username + '#' + winner.discriminator)

            //Set up time here
            const newFightCooldown = now.setMinutes(now.getMinutes() + 30)
            user.fightCooldown = newFightCooldown;

        } else {

            winResult = new Discord.RichEmbed()
                .setTitle('Match result')
                .setColor('#24F62B')
                .addField('Winner', winner.username + '#' + winner.discriminator)
                .addField('Reward', "Your waifu stats have been increased.")


            user.combatsWon += 1;
            user.waifu = waifuManager.increaseWaifuStats(user.waifu).waifu;
        }

        await user.save();
        return matchResult = winResult;

    } else {
        const cooldown = cooldownManager.calculateCooldown(now, cooldownHour)
        return user.at + ", It seems you lost your last fight... now you have to wait `" + cooldown.hours + "hours " + cooldown.minutes + "minutes " + cooldown.seconds + "seconds` until you can use this command"
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
            winner =  winRates.userOne.user
        } else {
            winner = winRates.userTwo.user
        }
    }

    return winner;

}

const calculateUsersWinRate = (user, challengedUser) => {

    const userPoints = (user.waifu.attack * attackPoints) +
        (user.waifu.defense * defensePoints) +
        (user.waifu.health * healthPoints)

    const challengedUserPoints = (challengedUser.waifu.attack * attackPoints) +
        (challengedUser.waifu.defense * defensePoints) +
        (challengedUser.waifu.health * healthPoints)

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