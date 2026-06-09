const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

const { loginUser, registerUser, verifyEmail, registerLimiter, loginLimiter} = require('../controllers/userController');

const { followUser, unfollowUser, getFollowingList } = require('../controllers/userInteractions');

const { editUsername, editPicture, requestChangePassword, changePassword, changePasswordLimiter } = require('../controllers/editProfileController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginLimiter, loginUser);
router.post('/register',  registerUser);
router.get('/verify', verifyEmail)
router.post("/follow", authMiddleware, followUser); 
router.post("/unfollow", authMiddleware, unfollowUser);
router.get("/followingList/:userId", getFollowingList);

// Rota para editar perfil (protegida e com suporte a upload de imagem)
router.put('/edit/username', authMiddleware, editUsername);
router.put('/edit/picture', authMiddleware, upload.single('profilePicture'), editPicture);
router.post('/request-change-password',changePasswordLimiter, requestChangePassword);
router.post('/change-password', changePassword);

module.exports = router;
