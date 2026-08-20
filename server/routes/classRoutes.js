const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

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

const { comment, respondComment, getCommentsByClass, rateClass, reportClass } = require("../controllers/userInteractions")

router.post('/create', authMiddleware, 
    upload.fields([
        { name: 'cover', maxCount: 1},
        { name: 'medias', maxCount: 2},
    ]),
    createClass,);
router.put('/edit/:classId', authMiddleware, editClass)

router.post(`/comment/:normalizedTitle`, authMiddleware, comment)
router.post('/respond/:commentId', authMiddleware, respondComment)
router.get('/getComments/:normalizedTitle', getCommentsByClass)

router.put('/rate/:classId', authMiddleware, rateClass)
router.post('/report/:classId', authMiddleware, reportClass)

router.get('/search', searchClass)
router.get('/getByTitle/:classTitle', getClassByTitle)
router.get('/getById/:classId', getClassById)
router.get('/getFollowing', authMiddleware, getFollowingClasses)
router.get('/byAuthor/:userId', getClassesByAuthor)
router.delete('/:classId', authMiddleware, deleteClass)

module.exports = router;