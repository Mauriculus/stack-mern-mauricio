const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const upload = require("../middleware/multer")

const {
    createPlaylist,
    getMyPlaylists,
    getPublicPlaylists,
    getFollowingPlaylists,
    getPlaylistsByAuthor,
    getPlaylistById,
    editPlaylist,
    addClassToPlaylist,
    removeClassFromPlaylist,
    reorderPlaylist,
    deletePlaylist,
    changePlaylistPrivacy,
    ratePlaylist,
} = require("../controllers/playlistController")

router.post("/create", authMiddleware, upload.single('cover'), createPlaylist)
router.put("/edit/:playlistId", authMiddleware, upload.single('cover'), editPlaylist)

router.get("/mine", authMiddleware, getMyPlaylists)
router.get("/public", getPublicPlaylists)
router.get("/following", authMiddleware, getFollowingPlaylists)
router.get("/byId/:playlistId", authMiddleware, getPlaylistById)
router.get("/byAuthor/:userId", getPlaylistsByAuthor)

router.post("/add/:playlistId", authMiddleware, addClassToPlaylist)
router.delete("/remove/:playlistId", authMiddleware, removeClassFromPlaylist)
router.post("/reorder/:playlistId", authMiddleware, reorderPlaylist)
router.delete("/delete", authMiddleware, deletePlaylist)
router.put("/changePrivacy/:playlistId", authMiddleware, changePlaylistPrivacy)
router.put("/rate/:playlistId", authMiddleware, ratePlaylist)

module.exports = router