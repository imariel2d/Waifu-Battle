const calculateCooldown = (currentTime, cooldownTime) => {

    const getCurrentHour = currentTime.getHours();
    const getCooldownHour = cooldownTime.getHours();

    const getCurrentMinutes = currentTime.getMinutes();
    const getCooldownMinutes = cooldownTime.getMinutes();

    const getCurrentSeconds = currentTime.getSeconds();
    const getCooldownSeconds = cooldownTime.getSeconds();

    let cooldown = {
        minutes: 0,
        hours: 0,
        seconds: 0,
    };

    if ((getCooldownMinutes - getCurrentMinutes) < 0) {

        cooldown.hours = (getCooldownHour - getCurrentHour) - 1;
        cooldown.minutes = 60 + (getCooldownMinutes - getCurrentMinutes);
    } else {

        cooldown.hours = (getCooldownHour - getCurrentHour);
        cooldown.minutes = (getCooldownMinutes - getCurrentMinutes);
    }

    if ((getCooldownSeconds - getCurrentSeconds) < 0) {

        cooldown.minutes -= 1;
        cooldown.seconds = 60 + (getCooldownSeconds - getCurrentSeconds);


    } else {
        cooldown.seconds = (getCooldownSeconds - getCurrentSeconds);
    }

    if (cooldown.minutes < 0 && cooldown.hours > 0) {
        cooldown.hours -= 1;
        cooldown.minutes = 60 + (cooldown.minutes);
    }


    return cooldown;
}

module.exports = {
    calculateCooldown: calculateCooldown,
}