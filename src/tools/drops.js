const drops = [

    //Rarity 1
    {
        name: 'Coal',
        price: 10,
        rarity: 1,
        count: 1,
    },

    //Rarity 2

    {
        name: 'Iron',
        price: 300,
        rarity: 2,
        count: 1,
    },

    //Rarity 5

    {
        name: 'Gold',
        price: 300,
        rarity: 3,
        count: 1,
    },

    //Rarity 4

    {
        name: 'Diamond',
        price: 1000,
        rarity: 4,
        count: 1,
    },

    //Rarity 5

    {
        name: 'Emerald',
        price: 3000,
        rarity: 5,
        count: 1,
    },

    {
        name: 'Ruby',
        price: 3000,
        rarity: 6,
        count: 1,
    }
]

const getRandromDrop = () => {
    const randomRarity = Math.floor(Math.random() * 10) + 1

    if (randomRarity >= 0 && randomRarity <= 6) {
        // Rarity of level = 1, 2, 3
        const maxRarity = 3
        const randomRarityFinal = Math.floor(Math.random() * maxRarity)
        const randomDrop = drops[randomRarityFinal ]

        return randomDrop

    } else if (randomRarity >= 7 && randomRarity <= 9) {

        // Rarity of level = 4
        const maxRarity = 4
        const randomRarityFinal = Math.floor(Math.random() * maxRarity)
        const randomDrop = drops[randomRarityFinal]

        return randomDrop
    } else {
        // Rarity of level = 5, 6
        const maxRarity = 6
        const randomRarityFinal = Math.floor(Math.random() * maxRarity)
        const randomDrop = drops[randomRarityFinal]

        return randomDrop
    }
}

module.exports = {
    getRandromDrop
}