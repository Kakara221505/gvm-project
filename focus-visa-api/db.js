const mongoose = require('mongoose');
const mongoUri = "mongodb://localhost:27017/focus-visa"

const connectToMongo = ()=>{
    mongoose.connect(mongoUri, ()=>{
        console.log("Connected to Mongo")
    })
}

module.exports=connectToMongo