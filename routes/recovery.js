const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema')
const nodemailer = require('nodemailer')
const SMTP_CONFIG = require('../config/smtp')

const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port:  SMTP_CONFIG.port,
    secure:  false,
    auth:{
        user:  SMTP_CONFIG.user,
        pass:  SMTP_CONFIG.pass
    },
    tls:{
        rejectUnauthorized: false
    }
})

router.post('/send_email', async (req, res)=>{
    const email = req.body.email
    const otp = req.body.otp
    
    const userFound = await User.findOne({email: email})

    if(userFound){
        await transporter.sendMail({
            from: 'FlipOut <flipoutsocialnetwork@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'FlipOut password recovery system', // Subject line
            html: "<h1>Your recovery code is:</h2>"+ '<h1>'+otp+'</h1>', // html body
          });

        res.send({sended: true, error: ''})

    } else {
        res.send({sended: false, error: 'email not found'})
    } 
})


module.exports = router
