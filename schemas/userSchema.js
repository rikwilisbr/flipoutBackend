const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname: {type: String, required: true, trim: true},
    lastname: {type: String, required: true, trim: true},
    username: {type: String, required: true, trim: true, unique: true},
    email: {type: String, required: true, trim: true, unique: true},
    password: {type: String, required: true},
    profilePic: {type: String, default:"https://i.imgur.com/YaLEPb0.jpg"},
    coverPhoto: {type: String},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    rePosts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    
  
  }, {timestamps: true})
  
  
  const User = new mongoose.model('User', userSchema)

module.exports = User