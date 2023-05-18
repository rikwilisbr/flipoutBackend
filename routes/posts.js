const express = require('express');
const router = express.Router();
const Post = require('../schemas/postSchema');


router.get('/:postid', (req, res)=>{
    const myPost = req.params['postid']
    Post.find({_id: myPost}, (err, result)=>{
        if(err){
            console.log(err)
        } else if (result){
            res.status(200).send(result)
        } else if(!result) {
            res.status(404).res.send('post not exist or was deleted by author')
        }
    })
})

module.exports = router