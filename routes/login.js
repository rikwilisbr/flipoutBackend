const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../schemas/userSchema')

router.post('/', (req, res)=>{
    const email = req.body.email
    const password = req.body.password

    User.findOne({email: email}, (err, foundUser)=>{
        if(!foundUser){
            res.send({
                login: false,
                error: 'email not found'
            })
        } else if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result){
                    if(result === true){
                        const id = foundUser.id
                        const token = jwt.sign({id}, process.env.JWT_SECRET)

                        res.json({
                            login: true,
                            token: token,
                            user: {
                                firstname: foundUser.firstname,
                                lastname: foundUser.lastname,
                                username: foundUser.username,
                                profilePic: foundUser.profilePic,
                                id: foundUser.id,
                                date: foundUser.createdAt,
                                updateDate: foundUser.updatedAt,
                                likes: foundUser.likes
                            }
                        })
                        
                } else {
                    res.send({
                        login: false,
                        error: 'wrong password'
                    })
                }
            })
        }
    })
})

module.exports = router