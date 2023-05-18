const express = require('express');
const router = express.Router();
const Notification = require('../schemas/notificationSchema')
const User = require('../schemas/userSchema')
const Post = require('../schemas/postSchema');


//creating posts

router.post('/', (req, res)=>{
    const userId_ = req.headers['user-id']
    
    const postData = {
        content: req.body.content,
        postedBy_id: userId_,
        postedBy_profilePic: req.body.postedBy.profilePic,
        postedBy: req.body.postedBy,
        postedBy_username: req.body.postedBy.username,
    }

    Post.create(postData)
    .then(result => {
        result.originalPost = result._id  
        return result.save();
    })
    .then(newPost =>{
        res.status(201).send(newPost)
    }).catch(error =>{
        res.status(400).send(error)
    })
})

router.get('/', (req, res)=>{ 
    Post.find((err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            const prev = result
            const newPrev = prev.filter(element => !element.replyTo)
            res.send(newPrev)
        }
    })
})


//likes
router.put('/user/like', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myLike = req.body.like

    //update user likes
    
    User.findById(userId_, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.likes && result.likes.includes(myLike)){
                let prev = result.likes
                const index = prev.indexOf(myLike)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.likes = prev
                    result.save().then(res.send({
                        liked: false
                    }))
                 
                }
            } else{
                const prev = result.likes
                result.likes = [...prev, myLike ]
                result.save().then(res.send({
                    liked: true
                }))
           
            }
           
        }
    })
   
})

router.put('/like', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myLike = req.body.like

    //update post likes
    
    Post.findById(myLike, async (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.likes && result.likes.includes(userId_)){
                let prev = result.likes
                const index = prev.indexOf(userId_)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.likes = prev
                    const len = prev.length
                    result.likesLen = len
                    result.save().then(res.send({
                        likes: len
                    }))
                 
                }
            } else{
                if (result.postedBy_id !== userId_){
                    await Notification.insertNotification(result.postedBy_id, userId_, 'liked', myLike)
                }
                const prev = result.likes
                result.likes = [...prev, userId_ ]
                const len = result.likes.length
                result.likesLen = len
                result.save().then(res.send({
                    likes: len
                }))
           
            }
           
        }
    })
   
})

//repost

router.put('/user/repost', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myRePost = req.body.repost

    //update user rePosts
    
    User.findById(userId_, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.rePosts && result.rePosts.includes(myRePost)){
                let prev = result.rePosts
                const index = prev.indexOf(myRePost)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.rePosts = prev
                    result.save().then(res.send({
                        reposted: false
                    }))
                 
                }
            } else{
                const prev = result.rePosts
                result.rePosts = [...prev, myRePost ]
                result.save().then(res.send({
                    reposted: true
                }))
           
            }
           
        }
    })
   
})

router.put('/repost', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myRePost = req.body.repost

    //update post rePosts
    
    Post.findById(myRePost, async (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.rePosts && result.rePosts.includes(userId_)){
                let prev = result.rePosts
                const index = prev.indexOf(userId_)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.rePosts = prev
                    const len = prev.length
                    result.rePostsLen = len
                    result.save().then(res.send({
                        rePosts: len
                    }))
                 
                }
            } else{
                const prev = result.rePosts
                result.rePosts = [...prev, userId_ ]
                const len = result.rePosts.length
                result.rePostsLen = len
                result.save().then(res.send({
                    rePosts: len
                }))
           
            }
           
        }
    })
   
})

router.post('/repost', async (req, res)=>{
    const userId_ = req.headers['user-id']
    const user = JSON.parse(req.headers['user'])
    const myRePost = req.body.repost

    //making rePosts
    
    const foundPost = await Post.findById(myRePost)

    var newRepost = { ...foundPost.toObject() };
    if (newRepost.rePosts.includes(userId_)){
        await Post.findOneAndDelete({postedBy_id: userId_, rePostsData: myRePost})
        res.send('deleted')
    } else{
        delete newRepost._id;
        delete newRepost.likes
        delete newRepost.likesLen
        delete newRepost.rePostsLen
        delete newRepost.postedBy_username
        newRepost.postedBy_username = user.username
        newRepost.rePostsData= myRePost
        newRepost.postedBy_id = userId_
        newRepost.sharedby = user.username
        const savedRepost = await Post.create(newRepost);
        savedRepost.save().then(async (result) =>{
            if (result.postedBy.id !== userId_){
                await Notification.insertNotification(result.postedBy.id, userId_, 'reposted', result._id)
            }
            res.send('added')
        })
    }
})



module.exports = router
