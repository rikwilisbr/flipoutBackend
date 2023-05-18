const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema')
const Post = require('../schemas/postSchema');

router.get('/posts/', (req, res)=>{
    Post.find({content: {$regex: req.query.content, $options: 'i'} }, (err, result)=>{
        if (err){
            console.log(err)
        } else{
            res.send(result)
        }
    })
})

router.get('/users/', (req, res)=>{
    User.find({username: {$regex: req.query.username, $options: 'i' } }, (err, result)=>{
        if (err){
            console.log(err)
        } else{
            const arr = []
            result.forEach(element =>{
            const data = {
                id: element.id,
                firstname: element.firstname,
                lastname: element.lastname,
                username: element.username,
                profilePic: element.profilePic
            }
            arr.push(data)
            })

            res.send(arr)
        }
    })
})

module.exports = router