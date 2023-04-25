const express = require('express');
const router = express.Router();
const Chat = require('../schemas/chatSchema')
const Message = require('../schemas/messageSchema')

router.post('/', (req, res)=>{
    const usersId = req.body.usersId
    const users = req.body.users
    const currentUserId = req.body.currentUser.id
    const currentUser = {
        id: req.body.currentUser.id,
        firstname: req.body.currentUser.firstname,
        lastname:req.body.currentUser.lastname,
        profilePic: req.body.currentUser.profilePic,
        username: req.body.currentUser.username,
    }
    

    if (users.length == 0){
        return res.send('Users array is empty')
    } 

    usersId.push(currentUserId)
    users.push(currentUser)

    const chatData = {
        isGroupChat: true,
        usersId: usersId,
        users: users
    }

    Chat.create(chatData).then((response)=>{res.status(200).send(response)})

})

router.get('/', (req, res)=>{
    const userId_ = req.headers['user-id']
    Chat.find({usersId: {$elemMatch:{$eq: userId_}}}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.status(200).send(result)
        }
    })

})

router.get('/:id', (req, res)=>{
    const chatId = req.params['id']
    Chat.find({_id: chatId},(err, result)=>{
        if (err){
            console.log(err)
        } else if(result && result.length > 0){
            res.status(200).send(result)
        }
    })
})

router.get('/check/:user/:currentUser', (req, res)=>{
    const user = req.params['user']
    const currentUser = req.params['currentUser']
    const data = [user, currentUser]
    Chat.findOne({$and:[{isGroupChat: false},{usersId: {$all: data}}]}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.send({
                result: result,
                status: true
            })
        } else {
            res.send({
                status: false
            })
        }
    })
})

router.post('/check', (req, res)=>{
    const chatData = {
        users: req.body.users,
        usersId: req.body.usersId,
        isGroupChat: false
    }

    Chat.create(chatData).then((response)=>{res.status(200).send(response)})
})

router.put('/change/chatname/:id', (req,res)=>{
    const chatName = req.body.newChatName
    const chatId = req.params['id']

    Chat.findByIdAndUpdate(chatId, {'chatName': chatName}, {new: true}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.send(chatName)
        }
    })
})

router.put('/change/lastestMessage/:id', (req,res)=>{
    const message = req.body.message
    const chatId = req.params['id']

    Chat.findByIdAndUpdate(chatId, {'lastestMessage': message}, {new: true}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.send(result)
        }
    })
})



router.post('/messages',(req,res)=>{
    const content = req.body.content
    const chatId = req.body.chatId
    const userId = req.headers['user-id']
    const userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        profilePic: req.body.profilePic,
        username: req.body.username,
    }

    if(!content || !chatId){
        return res.status(400).send('invalid data')
    } else {
        const messageData = {
            senderId: userId,
            sender: userData,
            content: content,
            chat: chatId,
        }

        Message.create(messageData).then((response)=>{res.status(201).send(response)})
    }
})

router.get('/messages/:id', (req, res)=>{
    const chatId = req.params['id']

    Message.find({chat: chatId}, (err, result)=>{
        if(err){
            console.log(err)
        } else if(result){
            res.send(result)
        }
    })
})

module.exports = router