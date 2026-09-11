const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware")
const upload = require("../middleware/multer")
const validateObjectIds = require("../middleware/validateObjectId")
const { writeLimiter, searchLimiter } = require('../middleware/rateLimiters')

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
    copyPlaylist,
    searchPlaylists,
} = require("../controllers/playlistController")

router.post("/create", authMiddleware, writeLimiter, validateObjectIds('classIds', 'body'), upload.single('cover'), createPlaylist)
router.put("/edit/:playlistId", authMiddleware, validateObjectIds('playlistId'), upload.single('cover'), editPlaylist)
router.post("/copy", authMiddleware, writeLimiter, validateObjectIds('playlistId', 'body'), copyPlaylist)

router.get("/search", searchLimiter, searchPlaylists)
router.get("/mine", authMiddleware, getMyPlaylists)
router.get("/public", getPublicPlaylists)
router.get("/following", authMiddleware, getFollowingPlaylists)
router.get("/byId/:playlistId", optionalAuthMiddleware, validateObjectIds('playlistId'), getPlaylistById)
router.get("/byAuthor/:userId", validateObjectIds('userId'), getPlaylistsByAuthor)

router.post("/add/:playlistId", authMiddleware, writeLimiter, validateObjectIds('playlistId'), validateObjectIds('newClassId', 'body'), addClassToPlaylist)
router.delete("/remove/:playlistId", authMiddleware, validateObjectIds('playlistId'), validateObjectIds('removeClassId', 'body'), removeClassFromPlaylist)
router.post("/reorder/:playlistId", authMiddleware, validateObjectIds('playlistId'), validateObjectIds('classes', 'body'), reorderPlaylist)
router.delete("/delete", authMiddleware, validateObjectIds('playlistId', 'body'), deletePlaylist)
router.put("/changePrivacy/:playlistId", authMiddleware, validateObjectIds('playlistId'), changePlaylistPrivacy)
router.put("/rate/:playlistId", authMiddleware, writeLimiter, validateObjectIds('playlistId'), ratePlaylist)

module.exports = router