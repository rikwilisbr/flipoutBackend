const express = require('express');
const router = express.Router();
const Notification = require('../schemas/notificationSchema')
const User = require('../schemas/userSchema')
const Post = require('../schemas/postSchema');

router.get('/user/:username', (req, res)=>{
    const username = req.params['username']
    
    User.findOne({username: username}, (err, foundUser) =>{
        if(err){
            console.log(err)
        } else if (foundUser){
            res.json({
                firstname: foundUser.firstname,
                lastname: foundUser.lastname,
                username: foundUser.username,
                profilePic: foundUser.profilePic,
                coverPhoto: foundUser.coverPhoto,
                id: foundUser.id,
                date: foundUser.createdAt,
                updateDate: foundUser.updatedAt,
                likes: foundUser.likes,
                rePosts: foundUser.rePosts,
                following: foundUser.following,
                followers: foundUser.followers
            })
        }
    })
})

router.get('/post/:username', (req, res)=>{
    const username = req.params['username']
    
    Post.find({postedBy_username: username}, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            const myData = result
            const arr = []
            myData.forEach(element =>{
                if (!element.replyTo) {
                    arr.push(element)
                }
            })

         res.send(arr)
        }
    })
})

router.get('/post/reply/:username', async (req, res)=>{
    const username = req.params['username']
    
    Post.find({postedBy_username: username}, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            const myData = result
            const arr = []
            myData.forEach(element =>{
                if (element.replyTo) {
                    arr.push(element)
                }
            })

         res.send(arr)
        }
    })
})

router.put('/followers/:username/:id', async(req, res)=>{
    const username = req.params['username']
    const userId_ = req.params['id']

    User.findOne({username: username}, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if(result.followers && result.followers.includes(userId_)){
                let prev = result.followers
                const index = prev.indexOf(userId_)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.followers = prev
                    result.save().then(res.send('removed from '+username+' followers list'))
                }
                
            } else {
                const prev = result.followers
                result.followers = [...prev, userId_]
                result.save().then(res.send('added on '+username+' followers list'))
            }
            
        }
    })
})

router.put('/following/:username/:id/:targetId', async(req, res)=>{
    const username = req.params['username']
    const userId_ = req.params['id']
    const targetId = req.params['targetId']

    User.findById(userId_, async (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if(result.following && result.following.includes(targetId)){
                let prev = result.following
                const index = prev.indexOf(targetId)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.following = prev
                    result.save().then(res.send('unfollowing'))
                }
                
            } else {
                await Notification.insertNotification(targetId, userId_, 'followed', userId_)
                const prev = result.following
                result.following = [...prev, targetId]
                result.save().then(res.send('following'))
            }
            
        }
    })
})

module.exports = router
