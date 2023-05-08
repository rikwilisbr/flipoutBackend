const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema')

router.get('/:id', (req, res)=>{
    const userId = req.params['id']
    User.find({}, (err, result)=>{
        if(err){
            return console.log(err)
        } else if(result){
            const data = result.reverse()
            const array = []
            data.forEach((element, index)=>{
                if(index < 4){
                    if(element._id !== userId){
                        array.push({
                            username: element.username,
                            firstname: element.firstname,
                            lastname: element.lastname,
                            profilePic: element.profilePic,
                            id: element._id
                        })  
                    } else {
                        return
                    }
                }
            })
            res.send(array)
        }
    })
})

module.exports = router