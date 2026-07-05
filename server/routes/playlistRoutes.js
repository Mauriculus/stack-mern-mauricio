const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")

const {
    createPlaylist,
    addClassToPlaylist,
    removeClassFromPlaylist,
    reorderPlaylist,
    deletePlaylist
} = require("../controllers/playlistController")

router.post("/create", authMiddleware, createPlaylist)
router.post("/add/:playlistId", authMiddleware, addClassToPlaylist)
router.delete("/remove/:playlistId", authMiddleware, removeClassFromPlaylist)
router.post("/reorder/:playlistId", authMiddleware, reorderPlaylist)
router.delete("/delete", authMiddleware, deletePlaylist)

module.exports = router