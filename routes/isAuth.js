const express = require('express');
const router = express.Router();
const middlewareJWT = require('../middlewares/JWT')

router.get('/', middlewareJWT, (req, res)=>{
    res.json({
        message: true
    })
})

module.exports = router