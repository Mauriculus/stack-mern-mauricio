const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

const { deleteClass,
    deletePlaylist,
    deleteComment,
    deleteResponse,
    banUser,
    unbanUser
} = require('../controllers/adminController')

router.delete('/deleteClass/:classId', authMiddleware, deleteClass)
router.delete('/deletePlaylist/:playlistId', authMiddleware, deletePlaylist)
router.delete('/deleteComment', authMiddleware, deleteComment)
router.delete('/deleteResponse', authMiddleware, deleteResponse)
router.put('/banUser', authMiddleware, banUser)
router.put('/unbanUser', authMiddleware, unbanUser)

module.exports = router
