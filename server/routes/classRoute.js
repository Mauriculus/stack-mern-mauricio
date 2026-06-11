const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

const {
    createClass,
    getClassByTitle,
} = require("../controllers/classControler")

const { coment, respondComent } = require("../controllers/userInteractions")

router.post('/createClass', authMiddleware, upload.array('medias', 2), createClass,);
router.get('/getClassByTitle', getClassByTitle)
router.post(`/coment/:normalizedTitle`, authMiddleware, coment)
router.post('/respondComent/:comentId', authMiddleware, respondComent)


module.exports = router;