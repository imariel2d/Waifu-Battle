const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/waifu-battle', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})