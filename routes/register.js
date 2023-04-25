const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

const User = require('../schemas/userSchema')

router.post('/', (req, res)=>{

    bcrypt.hash(req.body.password, 10, (err, hash)=>{
 
     const newUser = new User({
         firstname: req.body.fname.trim(),
         lastname: req.body.lname.trim(),
         username: req.body.username.trim(),
         email: req.body.email.trim(),
         password: hash
    })
 
    if(newUser.firstname && newUser.lastname && newUser.username && newUser.email && newUser.password){
         User.create(newUser, (err)=>{
             if(err){
                 console.log(err)
                 res.json({
                     register: false,
                     error: "email or username already in use"
                 })
             } else {
                 res.json({register: true})
             }
         })
      } else {
     res.send({register: false, error: 'make sure each filed has a valid value'})
    }
 
    })
    
 })

 module.exports = router