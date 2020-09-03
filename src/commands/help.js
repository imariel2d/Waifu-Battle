const discord = require('discord.js')
const prefix = "!wb"

const commandHelp = async (user) => {

    const embedInfo = new discord.RichEmbed()
        .setTitle('Commands')
        .setColor('#D480EA')
        .addField('Adventure', "`" + prefix + " adventure` you and your waifu embark on an adventure on a mystical new world.")
        .addField('Buy', "`" + prefix + " buy <Name of item>` buy an item from the store.")
        .addField('Create', "`" + prefix + " create` Creates your waifu if you don't have one.")
        .addField('Equip', "`" + prefix + " equip` equips an equipment from your storage.")
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

module.exports = commandHelp