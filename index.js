//dependencies
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { json } = require('body-parser')
const cors=require("cors");
require('dotenv').config()

//express server setup
const app = express()
app.use(express.static(__dirname));
const PORT = 2000
const server = app.listen(process.env.PORT || PORT, () =>{
    console.log('Server is running sucessfully at http://localhost:' + PORT)
})

//socket.io configs
const {Server} = require('socket.io')
const io = new Server(server, {
    cors:{
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000
})


//cors usage and configs
const whitelist = [process.env.CLIENT_URL, process.env.CURRENT_URL]
const corsOptions ={
    origin: (origin, callback)=>{
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
          } else {
            callback(new Error('Not allowed by CORS'))
          }
        },
    credentials:true,            
    optionSuccessStatus:200,
 }
app.use(cors(corsOptions)) 

//bodyParser usage and configs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

//connect to mongodb 
async function main() {
    await mongoose.connect(process.env.MONGO_DB_URL);
}
main().catch(err => console.log(err));

//api routes
app.use('/login', require('./routes/login')) // login page routes
app.use('/isAuth', require('./routes/isAuth')) // authentication routes
app.use('/register', require('./routes/register')) // register page routes
app.use('/api/chat', require('./routes/chat')) // chat page routes
app.use('/api/notifications', require('./routes/notifications')) // notifications page routes
app.use('/api/suggestUsers', require('./routes/suggestUsers')) // "People to follow" component routes
app.use('/home', require('./routes/home')) // return current user info
app.use('/api/post', require('./routes/post')) // post interactions (like and reposts) routes
app.use('/api/profile', require('./routes/profile')) // profiles infos routes
app.use('/posts', require('./routes/posts')) // post page routes
app.use('/api/recovery', require('./routes/recovery')) // recovery password routes
app.use('/api/update', require('./routes/update')) // update user routes
app.use('/api/search', require('./routes/search')) // search for users and posts routes
app.use('/api/upload', require('./routes/upload')) // upload profile avatar image and profile cover image to AWSS3 routes
app.use('/api/followers', require('./routes/followers')) // followers page routes
app.use('/api/following', require('./routes/following')) // following page routes
app.use('/api/reply', require('./routes/reply')) // post and get replys to posts page routes
app.use('/api/delete', require('./routes/delete')) // delete posts routes

//socket.io usage
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








