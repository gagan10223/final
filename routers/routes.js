const express = require('express')

const controller = require('../controls/cont')

const router = express.Router()

router.get('/',controller.final)

router.get('/login',controller.login)

router.get('/signup',controller.signup)

router.post('/signup/verify',controller.verify)

router.post('/signup/token_verify', controller.verify_token)

router.post('/signup/verify_user', controller.verify_user)

router.post('/login', controller.log_in)

router.get('/home',controller.home)

router.get('/about',controller.about)

router.get('/create',controller.create)

router.post('/create',controller.create_post)

router.get('/details/:id', controller.details)

router.delete('/details/:id', controller.delete_)

router.get('/edit/:id', controller.edit_data)

router.put('/edit/:id', controller.edited)

router.get('/logout',controller.log_out)

module.exports = router;