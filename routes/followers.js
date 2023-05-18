const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const User = require('../schemas/userSchema')


router.get('/ids/:username', (req, res)=>{
    const username = req.params['username']

    User.findOne({username: username}, (err, result)=>{
        if(err){
            console.log(err)
        } else {
            const data = result.followers
            res.send(data)
        }
    })
})

router.get('/data/:username', (req, res)=>{
    const username = req.params['username']
    const ids = JSON.parse(req.headers['ids'])
    const arr = []
    ids.forEach(element =>{
        arr.push(mongoose.Types.ObjectId(element))
    })

    User.find({
        '_id': { $in: arr}
    }, function(err, result){
        if(err){
            console.log(err)
        } else {
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
