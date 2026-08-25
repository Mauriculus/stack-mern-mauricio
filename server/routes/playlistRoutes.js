const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware")
const upload = require("../middleware/multer")

const {
    createPlaylist,
    addClassToPlaylist,
    removeClassFromPlaylist,
    reorderPlaylist,
    deletePlaylist,
    changePlaylistPrivacy,
    editPlaylist,
    ratePlaylist,
    getTopPlaylists,
    getUserPlaylists,
    getPlaylistById
} = require("../controllers/playlistController")

router.post("/create", authMiddleware, createPlaylist)
router.post("/add/:playlistId", authMiddleware, addClassToPlaylist)
router.delete("/remove/:playlistId", authMiddleware, removeClassFromPlaylist)
router.post("/reorder/:playlistId", authMiddleware, reorderPlaylist)
router.delete("/delete", authMiddleware, deletePlaylist)
router.put("/changePrivacy/:playlistId", authMiddleware, changePlaylistPrivacy)

// New routes
router.put("/edit/:playlistId", authMiddleware, upload.single('cover'), editPlaylist)
router.put("/rate/:playlistId", authMiddleware, ratePlaylist)
router.get("/top", getTopPlaylists)

// This MUST be before /:playlistId to avoid matching 'author' as an ID
router.get("/author/:userId", optionalAuthMiddleware, getUserPlaylists)

router.get("/:playlistId", optionalAuthMiddleware, getPlaylistById)

module.exports = router