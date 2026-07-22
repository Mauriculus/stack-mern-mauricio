const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

const {
    createClass,
    getClassById,
    searchClass,
} = require("../controllers/classControler")

const { comment, respondComment, getCommentsByClass, rateClass, reportClass } = require("../controllers/userInteractions")

router.post('/create', authMiddleware, upload.array('medias', 2), createClass,);
router.get('/getById', getClassById)
router.post(`/comment/:normalizedTitle`, authMiddleware, comment)
router.post('/respond/:commentId', authMiddleware, respondComment)
router.get('/getComments/:normalizedTitle', getCommentsByClass)
router.put('/rate/:classId', authMiddleware, rateClass)
router.post('report/:classId', authMiddleware, reportClass)
router.get('/search', searchClass)


module.exports = router;