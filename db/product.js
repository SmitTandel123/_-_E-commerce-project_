
const mongoose =require("mongoose")

const product = new mongoose.Schema({
    title:String,
   price:String,
   description: String,
   userID:String,
   company:String,
   quantity: { type: Number, default: 1 }, 
})


module.exports = new mongoose.model('products',product);