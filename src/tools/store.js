const { Storage, getStorage } = require('../models/storage.js')

const prices = {
    attack: 5000,
    defense: 3500,
    health: 2000,
    sword: {
        price: 1,
    }
}

const items = [
    {
        name: 'sword',
        type: 'sword',
        price: prices.sword.price,
        bonusStats: {
            attack: 20,
            defense: 5,
            health: 5,
        },
        requiredObjects: [{
            name: 'Iron',
            amount: 1,
        }, {
            name: 'Coal',
            amount: 1,
        }]
    }
]

const buyFromStore = async (user, itemPrice, message) => {
    let messageToSend = ""

    const storage = await Storage.findOne({
        owner: user._id
    })

    if (storage) {
        const currentMoney = storage.money

        if (currentMoney < itemPrice) {
            messageToSend = `${user.at}, you don't have enough money`
        } else {
            storage.money -= itemPrice
            messageToSend = message
        }

        await storage.save()

    } else {
        const newStorage = await new Storage({
            owner: user._id
        })

        await newStorage.save()
        messageToSend = `${user.at}, you don't have enough money`
    }

    return messageToSend
}

const canUserBuyItem = async (user, item) => {
    const response = await getStorage(user)
    const storage = response.storage

    if (!response.error && storage) {

        const foundItem = items.find((itemTemp) => itemTemp.name.toLowerCase() === item.toLowerCase())

        if (foundItem) {
            const userItems = storage.items
            const userMoney = storage.money

            const foundItems = foundItem.requiredObjects.filter((object) => {
                return userItems.find((userItem) => userItem.name === object.name && userItem.count >= object.amount)

            })

            if ((foundItems.length === foundItem.requiredObjects.length) && (userMoney >= foundItem.price)) {
                try {
                    for (let i = 0; i < foundItems.length; i++) {

                        for (let j = 0; j < userItems.length; j++) {

                            if (foundItems[i].name === userItems[j].name) {
                                const newItem = userItems[j]
                                newItem.count -= foundItems[i].amount
                                storage.items.push(newItem)
                                storage.items.splice(j, 1)

                                break
                            }
                        }
                    }

                    const equipment = { 
                        ...foundItem,
                        equiped: false,
                    }
                    delete equipment.requiredObjects

                    storage.waifuEquipments.push(equipment)
                    storage.money -= equipment.price

                    await storage.save()
                    response.message = `${user.at}, You have bought ${item}`

                } catch (e) {
                    console.log(e)
                    response.message = `${user.at}, something went wrong please try again later!`

                }

            } else {
                response.message = `${user.at}, You cannot buy this item!`
            }

        } else {
            response.message = `${user.at}, something went wrong please try again later!`
        }
    }

    return response
}

module.exports = {
    prices,
    buyFromStore,
    canUserBuyItem
}