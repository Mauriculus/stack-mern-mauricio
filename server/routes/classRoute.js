const express = require("express")
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware');
const {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass
} = require("../controllers/classControler")

router.post('/', authMiddleware, createClass);
router.get('/', authMiddleware, getClasses);
router.get('/:id', authMiddleware, getClasstById);
router.put('/:id', authMiddleware, updateClass);
router.delete('/:id', authMiddleware, deleteClass);