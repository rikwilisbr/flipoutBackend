const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    sender:{type: Object},
    content: {type: String, trim: true},
    chat:{type: mongoose.Schema.Types.ObjectId, ref:'Chat'},
    readBy:{type: mongoose.Schema.Types.ObjectId, ref:'User'}
},{collection: 'messages', timestamps: true})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message