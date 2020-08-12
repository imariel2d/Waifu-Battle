const adventures = [

    {
        completed: true,
        moneyReward: 1000,
        dialogue() {
            return {
                message: `You and your waifu wipe out angry goblins from a city, you both earn ${this.moneyReward}$`,
                money: this.moneyReward
            }
        },
    },

    {
        completed: true,
        moneyReward: 1500,
        dialogue() {
            return {
                message: `You and your waifu extinguished a demon fire, you both earn ${this.moneyReward}$`,
                money: this.moneyReward
            }
        },
    },

    {
        completed: true,
        moneyReward: 2000,
        dialogue() {
            return {
                message: `You and your waifu slayed a demon, you both earn ${this.moneyReward}$`,
                money: this.moneyReward
            }
        },
    },

    {
        completed: true,
        moneyReward: 2500,
        dialogue() {
            return {
                message: `You and your waifu help an useless goddess purify a lake, you both earn ${this.moneyReward}$`,
                money: this.moneyReward
            }
        },
    },

    {
        completed: true,
        moneyReward: 3000,
        dialogue() {
            return {
                message: `You and your waifu killed a titan, you both earn ${this.moneyReward}$`,
                money: this.moneyReward
            }
        },
    },
]

const goAdventure = () => {
    const randomNumber = Math.floor(Math.random() * adventures.length)
    const adventure = adventures[randomNumber]

    return adventure
}

module.exports = {
    goAdventure
}