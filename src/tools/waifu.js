const Discord = require('discord.js');
const mongoose = require('mongoose');

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

const createWaifu = async () => {

    try {
        const waifuNames = await WaifuNamesModel.find({})
        const waifuLastNames = await WaifuLastNamesModel.find({})

        const positionName = Math.floor(Math.random() * waifuNames.length);
        const randomName = waifuNames[positionName];

        const positionLastName = Math.floor(Math.random() * waifuLastNames.length);
        const randomLastName = waifuLastNames[positionLastName];

        const waifu = new Waifu()

        waifu.name = randomName.name;
        waifu.lastName = randomLastName.lastName;

        return waifu

    } catch (e) {
        console.log(e)
    }
}

const increaseWaifuStats = (waifu) => {

    const randomOption = Math.floor(Math.random() * 10)
    let messageResponse = undefined;
    let statMessage = undefined;

    if (randomOption >= 1 && randomOption <= 3) {
        waifu.attack = waifu.attack + attackBuff;
        statMessage = "`+" + (attackBuff) + " Attack`"
    }

    else if (randomOption >= 4 && randomOption <= 6) {
        waifu.defense = waifu.defense + defenseBuff;
        statMessage = "`+" + (defenseBuff) + " Defense`"
    }

    else {
        waifu.health = waifu.health + healthkBuff;
        statMessage = "`+" + (healthkBuff) + " Health`"
    }

    messageResponse = "Your waifu is now " + statMessage + " stronger"

    const waifuReponse = {
        waifu: waifu,
        message: messageResponse,
    }

    return waifuReponse;
}

module.exports = {
    createWaifu,
    increaseWaifuStats,
};
