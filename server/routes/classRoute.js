const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const {
    createClass,
    addClassMedia
    // getClasses,
    // getClassById,
    // updateClass,
    // deleteClass
} = require("../controllers/classControler")

router.post('/', authMiddleware, createClass, upload.array('midias', 2));
router.post('/:classId/media', authMiddleware, upload.single('file'), addClassMedia);
// router.get('/', authMiddleware, getClasses);
// router.get('/:id', authMiddleware, getClassById);
// router.put('/:id', authMiddleware, updateClass);
// router.delete('/:id', authMiddleware, deleteClass);

module.exports = router;