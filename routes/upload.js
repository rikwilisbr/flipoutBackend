const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema')
const Post = require('../schemas/postSchema');
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const upload = multer({dest: "uploads/"})
const AWS = require('aws-sdk')
require('dotenv').config()


AWS.config.update({region: 'sa-east-1'})
s3 = new AWS.S3({
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

router.post('/profilePicture', upload.single("img"), async (req, res)=>{
    const userId_ = req.headers['user-id']

    if(!req.file){
        console.log('no file found')
        return res.sendStatus(400)
    }
    
    const filestream = fs.createReadStream(req.file.path)
    const uploadParams = {
        Bucket: 'flipoutbucket',
        Key: req.file.filename,
        Body: filestream,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
    }
    
    await s3.upload(uploadParams, async (err, data)=>{
        if(err){
            console.log(err)
        }
        
        await User.findByIdAndUpdate(userId_, {profilePic: data.Location}, {new: true})
        const posts = await Post.find({
            $or: [
            { postedBy_id: userId_ },
            { 'postedBy.id': userId_ }
          ]
        })
    
        posts.forEach(async element=>{
        await Post.findByIdAndUpdate(element._id, {postedBy_profilePic: data.Location}, {new: true})
        })
    })

    res.sendStatus(200)
    
})

router.post('/coverPhoto', upload.single("img"), async (req, res)=>{
    const userId_ = req.headers['user-id']

    if(!req.file){
        console.log('no file found')
        res.sendStatus(400)
    }

    const filestream = fs.createReadStream(req.file.path)
    const uploadParams = {
        Bucket: 'flipoutbucket',
        Key: req.file.filename,
        Body: filestream,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
    }
    
    await s3.upload(uploadParams, async (err, data)=>{
        if(err){
            console.log(err)
        }

        await User.findByIdAndUpdate(userId_, {coverPhoto: data.Location}, {new: true})
    })
        
    res.sendStatus(200)
})


module.exports = router