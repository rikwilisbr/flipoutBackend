const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema')
const Post = require('../schemas/postSchema');

router.put('/user/:userId', async (req, res)=>{
    const userId = req.params['userId']
    await User.findByIdAndUpdate(userId, {firstname: req.body.firstname, lastname: req.body.lastname})

    const posts = await Post.find({
        $or: [
          { postedBy_id: userId },
          { 'postedBy.id': userId }
        ]
      });

    for (const element of posts) {
    await Post.findByIdAndUpdate(
        element._id,
        {
        $set: {
            'postedBy.firstname': req.body.firstname,
            'postedBy.lastname': req.body.lastname,
        },
        },
        { new: true }
    );
    }

    res.status(200).send('okay')
})

module.exports = router
