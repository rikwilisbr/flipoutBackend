const express = require('express');
const router = express.Router();
const Notification = require('../schemas/notificationSchema')
const Post = require('../schemas/postSchema');

//post replys
router.post('/', (req, res)=>{

    const replyData = { 
        content: req.body.reply,
        replyTo: req.body.postid,
        postedBy: req.body.postedBy,
        postedBy_id: req.body.postedBy_id,
        postedBy_profilePic: req.body.postedBy.profilePic,
        postedBy_username: req.body.postedBy_username,
        replyToUserId: req.body.replyToUserId
    }

    console.log(req.body.replyToUserId)

    Post.create(replyData).then( async (newPost) =>{
        if(replyData.replyToUserId !== replyData.postedBy_id){
            await Notification.insertNotification(replyData.replyToUserId, replyData.postedBy_id, 'replied', replyData.replyTo)
        }
        res.status(200).send(newPost)
    })
})


//get replys
router.get('/:postid',(req, res)=>{
    const postid = req.params['postid']

    Post.find({replyTo: postid}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.status(200).send(result)
        }
    })
})


module.exports = router
