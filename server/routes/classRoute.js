const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

const {
    createClass,
    getClassByTitle,
} = require("../controllers/classControler")

const { comment, respondComment, getCommentsByClass } = require("../controllers/userInteractions")

router.post('/createClass', authMiddleware, upload.array('medias', 2), createClass,);
router.get('/getClassByTitle', getClassByTitle)
router.post(`/comment/:normalizedTitle`, authMiddleware, comment)
router.post('/respondComment/:commentId', authMiddleware, respondComment)
router.get('/comments/:normalizedTitle', getCommentsByClass)



module.exports = router;