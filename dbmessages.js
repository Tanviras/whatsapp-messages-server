import mongoose from 'mongoose';


const whatsappSchema=mongoose.Schema({
    message:String,
    name: String,
    timestamp: String,
    // recieved: Boolean,
    email: String,
})

export default mongoose.model('messagecontent',whatsappSchema);