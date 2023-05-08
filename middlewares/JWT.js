const express = require('express');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const middlewareJWT = (req, res, next) => {
    const token = req.headers['x-access-token']

    if(!token){
        res.json({
            auth: false,
            error: 'No token found'
        })
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                res.json({
                    auth: false,
                    error: 'Fail auth'
                })
            } else{
                req.userId = decoded.id
                next()
            }
        })
    }
}

module.exports = middlewareJWT