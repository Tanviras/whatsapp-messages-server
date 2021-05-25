import mongoose from 'mongoose';
// const mongoose = require('mongoose');

const whatsappSchema=mongoose.Schema({
    message:String,
    name: String,
    timestamp: String,
    recieved: Boolean
})

export default mongoose.model('messagecontent',whatsappSchema);