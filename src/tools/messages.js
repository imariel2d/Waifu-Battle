const { calculateCooldown } = require('./cooldown');

const cooldownTimeMessage = (timer) => {

    const now = new Date()

    if (timer <= now) {
        return `:white_check_mark:`

    } else {
        const cooldown = calculateCooldown(now, timer)
        return "`" + cooldown.hours + "hours " + cooldown.minutes + "minutes " + cooldown.seconds + "seconds`"
    }


}

const youNeedAWaifu = (user) => {
    return user.at + " You need to create a waifu to use this command. Use `!wb create` to create your waifu"
}

const fightSyntax = (user) => {
    return user.at + " You need to @ a waifu owner! `!wb fight @someone`"
}

module.exports = {
    cooldownTimeMessage,
    youNeedAWaifu,
    fightSyntax
}