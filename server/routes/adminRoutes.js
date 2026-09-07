const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const validateObjectIds = require('../middleware/validateObjectId');

const { deleteClass,
    deletePlaylist,
    deleteComment,
    deleteResponse,
    banUser,
    unbanUser,
    getReportedClasses,
    getReports,
} = require('../controllers/adminController')

router.delete('/deleteClass/:classId', authMiddleware, validateObjectIds('classId'), deleteClass)
router.delete('/deletePlaylist/:playlistId', authMiddleware, validateObjectIds('playlistId'), deletePlaylist)
router.delete('/deleteComment', authMiddleware, validateObjectIds('commentId', 'body'), deleteComment)
router.delete('/deleteResponse', authMiddleware, validateObjectIds('responseId', 'body'), deleteResponse)
router.put('/banUser', authMiddleware, validateObjectIds('bannedUserId', 'body'), banUser)
router.put('/unbanUser', authMiddleware, validateObjectIds('unbannedUserId', 'body'), unbanUser)
router.get('/getClasses', authMiddleware, getReportedClasses)
router.get('/getReports', authMiddleware, getReports)

module.exports = router