const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    chatName: {type: 'string', trim: true},
    isGroupChat: {type: Boolean, default: false},
    usersId:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    users:[{type: Map}],
    lastestMessage:{type: 'string', trim: true}
},{collection: 'chats', timestamps: true})

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat