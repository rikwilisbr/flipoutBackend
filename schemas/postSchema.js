const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    content: {type: String, trim: true},
    postedBy: {type: Object},
    postedBy_id:{type: String, require: true},
    postedBy_username:{type: String, require: true},
    postedBy_profilePic:{type: String, require: true},
    pinned: Boolean,
    likes: Array,
    likesLen: Number,
    rePosts: Array,
    rePostsLen: Number,
    rePostsData: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    replyTo:{type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    replyToUserId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    sharedby: String,
    originalPost:{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}


}, {timestamps: true, collection: 'posts'} )


const Post = mongoose.model('Post', PostSchema)

module.exports = Post