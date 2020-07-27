const Discord = require('discord.js');

const mongoose = require('mongoose');
const fs = require('fs');

const waifuNamesModel = {
    name: String,
};

const waifuLastNamesModel = {
    lastName: String,
};

const WaifuNamesModel = mongoose.model("Names", waifuNamesModel)
const WaifuLastNamesModel = mongoose.model("Lastnames", waifuLastNamesModel)

//Initial random stats
const minStat = 50;
const maxStat = 60;

const attackBuff = 1; // Always one
const defenseBuff = Math.floor(Math.random() * 2) + 1; // 1 - 3
const healthkBuff = Math.floor(Math.random() * 3) + 1; // 1 - 4

//Constructor
const Waifu = function () {
    this.name = "";
    this.lastName = "";
    this.attack = Math.floor(Math.random() * (maxStat - minStat) + minStat)
    this.defense = Math.floor(Math.random() * (maxStat - minStat) + minStat)
    this.health = Math.floor(Math.random() * (maxStat - minStat) + minStat)
}

const createWaifu = () => {
    const waifu = new Waifu();
    return waifu;
}

const getRandomWaifuName = (waifu, callback) => {

    WaifuNamesModel.find({}, (err, names) => {

        const positionName = Math.floor(Math.random() * names.length);
        const randomName = names[positionName];

        waifu.name = randomName.name;

        WaifuLastNamesModel.find({}, (err, lastNames) => {

            const positionLastName = Math.floor(Math.random() * lastNames.length);
            const randomLastName = lastNames[positionLastName];

            waifu.lastName = randomLastName.lastName;
            callback(waifu);
        })
    });
}

const increaseWaifuStats = (waifu) => {

    const randomOption = Math.floor(Math.random() * 10)
    let messageResponse = undefined;
    let statMessage = undefined;

    if (randomOption >= 1 && randomOption <= 3) {
        waifu.attack = waifu.attack + attackBuff;
        statMessage = "`+"+(attackBuff)+" Attack`"
    }

    else if (randomOption >= 4 && randomOption <= 6) {
        waifu.defense = waifu.defense + defenseBuff;
        statMessage = "`+"+(defenseBuff)+" Defense`"
    }

    else {
        waifu.health = waifu.health + healthkBuff;
        statMessage = "`+"+(healthkBuff)+" Health`"
    }

    messageResponse = "Your waifu is now " + statMessage + " stronger"

    const waifuReponse = {
        waifu: waifu,
        messageResponse: messageResponse,
    }


    return waifuReponse;
}

const getWaifuInformation = (user) => {

    const waifu = user.waifu;

    const embedInfo = new Discord.RichEmbed()
        .setTitle(user.username + "'s waifu")
        .setColor('#DF77EC')    
        .addField('Waifu Name', `${waifu.name} ${waifu.lastName}`)
        .addField('Attack', waifu.attack)
        .addField('Defense', waifu.defense)
        .addField('Health', waifu.health)
        .addField('Combats won', user.combatsWon)

    const embedWaifu = {
        embedInfo: embedInfo,
    }

    return embedWaifu;
}

module.exports = {
    createWaifu: createWaifu,
    increaseWaifuStats: increaseWaifuStats,
    getWaifuInformation: getWaifuInformation,
    getRandomWaifuName: getRandomWaifuName
};
