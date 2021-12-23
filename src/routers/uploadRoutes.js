const router = require('express').Router()
const uploadImage = require('../middleware/uploadImage')
const uploadCtrl = require('./uploadImageCtrl')
const auth = require('../middleware/requireAuth')

router.post('/upload_avatar', uploadImage, auth, uploadCtrl.uploadAvatar)

module.exports = router