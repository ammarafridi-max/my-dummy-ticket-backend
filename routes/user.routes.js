const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

router.use(authController.protect);
router.get('/myAccount', authController.currentUserInfo);
router.patch('/updateMyAccount', authController.updateCurrentUser);
router.patch('/updateMyPassword', authController.updatePassword);

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getUsers).post(userController.createUser);
router
  .route('/:username')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
