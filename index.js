const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { json } = require('body-parser')
const cors=require("cors");
const multer = require('multer')
const upload = multer({dest: "uploads/"})
const app = express()
const path = require('path')
const fs = require('fs')
const {Server} = require('socket.io')
require('dotenv').config()

//Schemas
const Notification = require('./schemas/notificationSchema')
const User = require('./schemas/userSchema')
const Post = require('./schemas/postSchema')


const PORT = 2000
const server = app.listen(process.env.PORT || PORT, () =>{
    console.log('Server is running sucessfully at http://localhost:' + PORT)
})

const io = new Server(server, {
    cors:{
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000
})
 
const corsOptions ={
    origin:'*', 
    credentials:true,            
    optionSuccessStatus:200,
 }

app.use(cors(corsOptions)) 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.MONGO_DB_URL);
}

app.get('/home', (req, res)=>{
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
            console.log('user not found')
        }
    })
})

//creating posts

app.post('/api/post', (req, res)=>{
    const userId_ = req.headers['user-id']
    
    const postData = {
        content: req.body.content,
        postedBy_id: userId_,
        postedBy_profilePic: req.body.postedBy.profilePic,
        postedBy: req.body.postedBy,
        postedBy_username: req.body.postedBy.username
    }

    Post.create(postData).then(newPost =>{
        res.status(201).send(newPost)
    }).catch(error =>{
        res.status(400).send(error)
    })
})

app.get('/api/post', (req, res)=>{ 
    Post.find((err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            const prev = result
            const newPrev = prev.filter(element => !element.replyTo)
            res.send(newPrev)
        }
    })
})


//likes
app.put('/api/post/user/like', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myLike = req.body.like

    //update user likes
    
    User.findById(userId_, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.likes && result.likes.includes(myLike)){
                let prev = result.likes
                const index = prev.indexOf(myLike)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.likes = prev
                    result.save().then(res.send({
                        liked: false
                    }))
                 
                }
            } else{
                const prev = result.likes
                result.likes = [...prev, myLike ]
                result.save().then(res.send({
                    liked: true
                }))
           
            }
           
        }
    })
   
})

app.put('/api/post/like', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myLike = req.body.like

    //update post likes
    
    Post.findById(myLike, async (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.likes && result.likes.includes(userId_)){
                let prev = result.likes
                const index = prev.indexOf(userId_)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.likes = prev
                    const len = prev.length
                    result.likesLen = len
                    result.save().then(res.send({
                        likes: len
                    }))
                 
                }
            } else{
                if (result.postedBy_id !== userId_){
                    await Notification.insertNotification(result.postedBy_id, userId_, 'liked', myLike)
                }
                const prev = result.likes
                result.likes = [...prev, userId_ ]
                const len = result.likes.length
                result.likesLen = len
                result.save().then(res.send({
                    likes: len
                }))
           
            }
           
        }
    })
   
})

//repost

app.put('/api/post/user/repost', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myRePost = req.body.repost

    //update user rePosts
    
    User.findById(userId_, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.rePosts && result.rePosts.includes(myRePost)){
                let prev = result.rePosts
                const index = prev.indexOf(myRePost)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.rePosts = prev
                    result.save().then(res.send({
                        reposted: false
                    }))
                 
                }
            } else{
                const prev = result.rePosts
                result.rePosts = [...prev, myRePost ]
                result.save().then(res.send({
                    reposted: true
                }))
           
            }
           
        }
    })
   
})

app.put('/api/post/repost', (req, res)=>{
    const userId_ = req.headers['user-id']
    const myRePost = req.body.repost

    //update post rePosts
    
    Post.findById(myRePost, async (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if (result.rePosts && result.rePosts.includes(userId_)){
                let prev = result.rePosts
                const index = prev.indexOf(userId_)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.rePosts = prev
                    const len = prev.length
                    result.rePostsLen = len
                    result.save().then(res.send({
                        rePosts: len
                    }))
                 
                }
            } else{
                const prev = result.rePosts
                result.rePosts = [...prev, userId_ ]
                const len = result.rePosts.length
                result.rePostsLen = len
                result.save().then(res.send({
                    rePosts: len
                }))
           
            }
           
        }
    })
   
})

app.post('/api/post/repost', async (req, res)=>{
    const userId_ = req.headers['user-id']
    const user = JSON.parse(req.headers['user'])
    const myRePost = req.body.repost

    //making rePosts
    
    const foundPost = await Post.findById(myRePost)

    var newRepost = { ...foundPost.toObject() };
    if (newRepost.rePosts.includes(userId_)){
        await Post.findOneAndDelete({postedBy_id: userId_, rePostsData: myRePost})
        res.send('deleted')
    } else{
        delete newRepost._id;
        delete newRepost.likes
        delete newRepost.likesLen
        delete newRepost.rePostsLen
        delete newRepost.postedBy_username
        newRepost.postedBy_username = user.username
        newRepost.rePostsData= myRePost
        newRepost.postedBy_id = userId_
        newRepost.sharedby = user.username
        const savedRepost = await Post.create(newRepost);
        savedRepost.save().then(async (result) =>{
            if (result.postedBy.id !== userId_){
                await Notification.insertNotification(result.postedBy.id, userId_, 'reposted', result._id)
            }
            res.send('added')
        })
    }
})

//replys

app.get('/posts/:postid', (req, res)=>{
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


//post replys
app.post('/api/reply', (req, res)=>{

    const replyData = { 
        content: req.body.reply,
        replyTo: req.body.postid,
        postedBy: req.body.postedBy,
        postedBy_id: req.body.postedBy_id,
        postedBy_profilePic: req.body.postedBy.profilePic,
        postedBy_username: req.body.postedBy_username,
        replyToUserId: req.body.replyToUserId
    }

    console.log(req.body.replyToUserId)

    Post.create(replyData).then( async (newPost) =>{
        if(replyData.replyToUserId !== replyData.postedBy_id){
            await Notification.insertNotification(replyData.replyToUserId, replyData.postedBy_id, 'replied', replyData.replyTo)
        }
        res.status(200).send(newPost)
    })
})


//get replys
app.get('/api/reply/:postid',(req, res)=>{
    const postid = req.params['postid']

    Post.find({replyTo: postid}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.status(200).send(result)
        }
    })
})

app.delete('/api/delete/:postid', (req, res)=>{
    const postid = req.params['postid']
    Post.findByIdAndDelete(postid,(err)=>{
        if(err) {
            console.log(err)
        } else{
            res.send('deleted')
        }
        
    })
})

//profile

app.get('/api/user/profile/:username', (req, res)=>{
    const username = req.params['username']
    
    User.findOne({username: username}, (err, foundUser) =>{
        if(err){
            console.log(err)
        } else if (foundUser){
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
        }
    })
})

app.get('/api/post/profile/:username', (req, res)=>{
    const username = req.params['username']
    
    Post.find({postedBy_username: username}, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            const myData = result
            const arr = []
            myData.forEach(element =>{
                if (!element.replyTo) {
                    arr.push(element)
                }
            })

         res.send(arr)
        }
    })
})

app.get('/api/post/reply/profile/:username', async (req, res)=>{
    const username = req.params['username']
    
    Post.find({postedBy_username: username}, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            const myData = result
            const arr = []
            myData.forEach(element =>{
                if (element.replyTo) {
                    arr.push(element)
                }
            })

         res.send(arr)
        }
    })
})

app.put('/api/followers/profile/:username/:id', async(req, res)=>{
    const username = req.params['username']
    const userId_ = req.params['id']

    User.findOne({username: username}, (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if(result.followers && result.followers.includes(userId_)){
                let prev = result.followers
                const index = prev.indexOf(userId_)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.followers = prev
                    result.save().then(res.send('removed from '+username+' followers list'))
                }
                
            } else {
                const prev = result.followers
                result.followers = [...prev, userId_]
                result.save().then(res.send('added on '+username+' followers list'))
            }
            
        }
    })
})

app.put('/api/following/profile/:username/:id/:targetId', async(req, res)=>{
    const username = req.params['username']
    const userId_ = req.params['id']
    const targetId = req.params['targetId']

    User.findById(userId_, async (err, result) =>{
        if(err){
            console.log(err)
        } else if (result){
            if(result.following && result.following.includes(targetId)){
                let prev = result.following
                const index = prev.indexOf(targetId)
                if(index > -1){
                    prev.splice(index, 1) 
                    result.following = prev
                    result.save().then(res.send('unfollowing'))
                }
                
            } else {
                await Notification.insertNotification(targetId, userId_, 'followed', userId_)
                const prev = result.following
                result.following = [...prev, targetId]
                result.save().then(res.send('following'))
            }
            
        }
    })
})

app.get('/api/following/ids/:username', (req, res)=>{
    const username = req.params['username']

    User.findOne({username: username}, (err, result)=>{
        if(err){
            console.log(err)
        } else {
            const data = result.following
            res.send(data)
        }
    })
})

app.get('/api/following/data/:username', (req, res)=>{
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


app.get('/api/followers/ids/:username', (req, res)=>{
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

app.get('/api/followers/data/:username', (req, res)=>{
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

app.post('/api/upload/profilePicture', upload.single("img"), (req, res)=>{
    const userId_ = req.headers['user-id']

    if(!req.file){
        console.log('no file found')
        res.sendStatus(400)
    }
    
    const filePath = 'uploads/images/'+req.file.filename+'.png'
    const tempPath = req.file.path
    const targetPath = path.join(__dirname, filePath)

    fs.rename(tempPath, targetPath, async (err)=>{
        if(err){
            console.log(err)
            res.sendStatus(400)
        }

        await User.findByIdAndUpdate(userId_, {profilePic: process.env.CURRENT_URL+filePath}, {new: true})
        const posts = await Post.find({postedBy_id: userId_})
    
        posts.forEach(async element=>{
            await Post.findByIdAndUpdate(element._id, {postedBy_profilePic: process.env.CURRENT_URL+filePath}, {new: true})
        })

        res.sendStatus(200)
    })

    
})

app.post('/api/upload/coverPhoto', upload.single("img"), (req, res)=>{
    const userId_ = req.headers['user-id']

    if(!req.file){
        console.log('no file found')
        res.sendStatus(400)
    }
    
    const filePath = 'uploads/images/'+req.file.filename+'.png'
    const tempPath = req.file.path
    const targetPath = path.join(__dirname, filePath)

    fs.rename(tempPath, targetPath, async (err)=>{
        if(err){
            console.log(err)
            res.sendStatus(400)
        }

        await User.findByIdAndUpdate(userId_, {coverPhoto: process.env.CURRENT_URL+filePath}, {new: true})
        
        res.sendStatus(200)
    })

    
})

app.get('/uploads/images/:path', (req, res)=>{
    const filepath = req.params['path']
    res.sendFile(path.join(__dirname,'uploads/images/'+filepath))
})

app.get('/api/search/posts/', (req, res)=>{
    Post.find({content: {$regex: req.query.content, $options: 'i'} }, (err, result)=>{
        if (err){
            console.log(err)
        } else{
            res.send(result)
        }
    })
})

app.get('/api/search/users/', (req, res)=>{
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





//routes
app.use('/login', require('./routes/login'))
app.use('/isAuth', require('./routes/isAuth'))
app.use('/register', require('./routes/register'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/suggestUsers', require('./routes/suggestUsers'))

//socket

io.on('connection', (socket)=>{

    socket.on('setup',(userData)=>{
       socket.join(userData.id)
       socket.emit('connected')
    })

    socket.on('join_chat', (chat) =>{
        socket.join(chat)
    })

    socket.on('typing', (chat)=>{
        socket.in(chat.chatId).emit('typing', chat.username)
    })

    socket.on('message_send', (chat)=>{
        socket.in(chat.chatId).emit('sended')
        socket.in(chat.chatId).emit('received', chat.message)
    })
})







