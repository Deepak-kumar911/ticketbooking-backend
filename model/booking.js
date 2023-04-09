const mongoose = require("mongoose");

const schema = mongoose.Schema({
    no_of_seats:{type:Number,required:true},
    booking:{type:[{sNo:{type:Number,required:true},seatNo:{type:String,required:true},remark:{type:String,required:true}}],required:true}
})

const Coach = mongoose.model("Coach",schema);

module.exports = {Coach}