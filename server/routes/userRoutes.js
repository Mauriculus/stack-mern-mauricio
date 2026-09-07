const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const validateObjectIds = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimiters');

const { loginUser, registerUser, verifyEmail, registerLimiter, loginLimiter, getMyProfile, getUserProfile} = require('../controllers/userController');

const { followUser, unfollowUser, getFollowingList } = require('../controllers/userInteractions');

const { editUsername, editPicture, requestChangePassword, changePassword, changePasswordLimiter, editPrivacy } = require('../controllers/editProfileController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginLimiter, loginUser);
router.post('/register', registerLimiter, registerUser);
router.get('/verify', verifyEmail)
router.post("/follow", authMiddleware, writeLimiter, validateObjectIds('followingId', 'body'), followUser); 
router.post("/unfollow", authMiddleware, unfollowUser);
router.get("/followingList/:userId", validateObjectIds('userId'), getFollowingList);

// Rota para editar perfil (protegida e com suporte a upload de imagem)
router.put('/edit/username', authMiddleware, writeLimiter, editUsername);
router.put('/edit/picture', authMiddleware, writeLimiter, upload.single('profilePicture'), editPicture);
router.put('/edit/privacy', authMiddleware, writeLimiter, editPrivacy);
router.post('/requestChangePassword', changePasswordLimiter, requestChangePassword);
router.post('/changePassword', changePasswordLimiter, changePassword);

router.get('/me', authMiddleware, getMyProfile)
// MANTER DEPOIS DO /me
router.get('/:userId', validateObjectIds('userId'), getUserProfile)
module.exports = router;