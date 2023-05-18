const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema')

router.get('/', (req, res)=>{
    const userId_ = req.headers['user-id']
    User.findById(userId_, (err, foundUser)=>{
        if(err){
            return
        } else if(foundUser) {
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
        } else {
            return
        }
    })
})

module.exports = router