const express = require('express');
const router = express.Router();
const Post = require('../schemas/postSchema');

router.delete('/:postid', (req, res)=>{
    const postid = req.params['postid']
    Post.findByIdAndDelete(postid,(err)=>{
        if(err) {
            console.log(err)
        } else{
            res.send('deleted')
        }
        
    })
})

module.exports = router