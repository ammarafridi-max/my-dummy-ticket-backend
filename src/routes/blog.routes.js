const router = require('express').Router();
const multer = require('multer');
const {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} = require('../controllers/blog.controller');
const { protect, restrictTo } = require('../controllers/auth.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getBlogPosts);
router.get('/slug/:slug', getBlogPostBySlug);

router.use(protect, restrictTo('admin'));
router.post('/', upload.single('coverImage'), createBlogPost);
router.get('/:id', getBlogPostById);
router.patch('/:id', updateBlogPost);
router.delete('/:id', deleteBlogPost);

module.exports = router;
