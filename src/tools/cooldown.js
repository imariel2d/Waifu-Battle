const calculateCooldown = (currentTime, cooldownTime) => {
    const seconds = Math.floor((cooldownTime - currentTime) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    let cooldown = {
        days,
        hours: hours - days * 24,
        minutes: minutes - days * 24 * 60 - hours * 60,
        seconds: seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60,
    }

    return cooldown
}

module.exports = {
    calculateCooldown,
}
