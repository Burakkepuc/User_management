var express = require('express');
const { verifyToken } = require('../middlewares/token');
const { nearbyUsers, likeUser, dislikeUser, getLikedUsers, getUsersWhoLikedMe, updateProfile } = require('../controllers/users');
const { addProfilePicture } = require('../controllers/auth');
const upload = require('../utils/multerUpload');

var router = express.Router();

router.post('/add_profile_picture', upload.array('photos', 12), addProfilePicture)
router.put('/update_profile', updateProfile)
router.get('/nearby_users/:km', nearbyUsers);
router.post('/like/:toUserId', likeUser);
router.post('/dislike/:toUserId', dislikeUser)
router.get('/get_liked_users', getLikedUsers)
router.get('/get_who_liked_me', getUsersWhoLikedMe)

module.exports = router;