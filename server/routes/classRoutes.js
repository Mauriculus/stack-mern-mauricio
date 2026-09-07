const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const validateObjectIds = require('../middleware/validateObjectId');
const { writeLimiter, searchLimiter } = require('../middleware/rateLimiters');

const {
    createClass,
    getClassByTitle,
    searchClass,
    getFollowingClasses,
    getClassById,
    deleteClass,
    getClassesByAuthor,
    editClass,
 } = require("../controllers/classControler")

const { 
    comment,
    respondComment, 
    getCommentsByClass, 
    rateClass, 
    reportClass,
    deleteComment,
    deleteResponse,
} = require("../controllers/userInteractions")

router.post('/create', authMiddleware, writeLimiter, 
    upload.fields([
        { name: 'cover', maxCount: 1},
        { name: 'medias', maxCount: 2},
    ]),
    createClass,);
router.put('/edit/:classId', authMiddleware, validateObjectIds('classId'), editClass)

router.post(`/comment/:normalizedTitle`, authMiddleware, writeLimiter, comment)
router.post('/respond/:commentId', authMiddleware, writeLimiter, validateObjectIds('commentId'), respondComment)
router.get('/getComments/:normalizedTitle', getCommentsByClass)
router.delete("/deleteComment/:commentId", authMiddleware, validateObjectIds('commentId'), deleteComment)
router.delete("/deleteResponse/:responseId", authMiddleware, validateObjectIds('responseId'), deleteResponse)

router.put('/rate/:classId', authMiddleware, writeLimiter, validateObjectIds('classId'), rateClass)
router.post('/report/:classId', authMiddleware, writeLimiter, validateObjectIds('classId'), reportClass)

router.get('/search', searchLimiter, searchClass)
router.get('/getByTitle/:classTitle', getClassByTitle)
router.get('/getById/:classId', validateObjectIds('classId'), getClassById)
router.get('/getFollowing', authMiddleware, getFollowingClasses)
router.get('/byAuthor/:userId', validateObjectIds('userId'), getClassesByAuthor)
router.delete('/:classId', authMiddleware, validateObjectIds('classId'), deleteClass)

module.exports = router;