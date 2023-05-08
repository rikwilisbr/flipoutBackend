const express = require('express');
const router = express.Router();
const Notification = require('../schemas/notificationSchema')
const User = require('../schemas/userSchema')
const Post = require('../schemas/postSchema')

router.get('/:id', (req, res)=>{
   const userId = req.params['id'] 
   Notification.find({userTo: userId, notificationsType: {$ne: 'message'}}, (err, result)=>{
    if(err){
        console.log(err)
    } else if(result){
        res.send(result)
    }

   })
})

router.get('/user/:id', (req, res)=>{
    const userId = req.params['id'] 
    User.findById(userId, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.send(result)
        }
    })
})

router.get('/post/:id', (req, res)=>{
    const postId = req.params['id'] 
    Post.findById(postId, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.send(result)
        }
    })
})

router.put('/:id/markAsOpened', (req, res)=>{
    const userId = req.params['id'] 
    Notification.updateMany({userTo: userId, notificationsType: {$ne: 'message'}}, {opened: true}, (err, result)=>{
     if(err){
         console.log(err)
     } else if(result){
         res.status(204).send({status: true})
     }
 
    })
 })

module.exports = router