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
router.post("/add/:playlistId", authMiddleware, createPlaylist)
router.delete("/remove/:playlistId", authMiddleware, createPlaylist)
router.post("/reorder/:playlistId", authMiddleware, createPlaylist)
router.delete("/delete", authMiddleware, createPlaylist)

module.exports = router