const Blog = require('../models/Blog');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { deleteCloudinaryFolder } = require('../utils/cloudinary');
const {
  validateBlog,
  createCoverImage,
  generateSlugAndReadingTime,
  normalizeTags,
  saveCoverImage,
} = require('../services/blog.services');

exports.getBlogPosts = catchAsync(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, tag, search } = req.query;

  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { excerpt: new RegExp(search, 'i') },
      { content: new RegExp(search, 'i') },
    ];
  }

  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author'),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: blogs.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: blogs,
  });
});

exports.getBlogPostBySlug = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug });

  if (!blog) {
    return next(new AppError('Blog post not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: blog,
  });
});

exports.getBlogPostById = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog post not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: blog,
  });
});

exports.createBlogPost = catchAsync(async (req, res, next) => {
  const { title, slug: customSlug, content, excerpt, status, tags, metaTitle, metaDescription } = req.body;
  const authorId = req.user._id;

  validateBlog(req);
  const { uniqueSlug, readingTime } = await generateSlugAndReadingTime(customSlug, title, content);
  const normalizedTags = normalizeTags(tags);
  const coverImageUrl = await createCoverImage(req, uniqueSlug);

  let blog = await Blog.create({
    title,
    slug: uniqueSlug,
    content,
    excerpt,
    coverImageUrl,
    status: status || 'draft',
    tags: normalizedTags,
    metaTitle: metaTitle || title,
    metaDescription,
    author: authorId,
    readingTime,
    publishedAt: isPublished ? new Date() : null,
  });

  await blog.populate('author');

  res.status(201).json({
    status: 'success',
    message: 'Blog created successfully',
    data: blog,
  });
});

exports.updateBlogPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, slug, content, excerpt, status, tags, metaTitle, metaDescription } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) return next(new AppError('Blog not found', 404));

  const normalizedTags = normalizeTags(tags);

  let updateData = {
    title,
    slug,
    content,
    excerpt,
    status,
    tags: normalizedTags,
    metaTitle,
    metaDescription,
  };

  updateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

  updateData.coverImageUrl = await saveCoverImage(req, slug, blog);

  const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('author');

  res.status(200).json({
    status: 'success',
    message: 'Blog updated successfully',
    data: 'Hello',
    updatedBlog,
  });
});

exports.deleteBlogPost = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog post not found', 404));
  }

  const folderName = `mdt/mdt_blog/${blog.slug}`.replace(/\s+/g, '_');
  try {
    await deleteCloudinaryFolder(folderName);
  } catch (err) {
    console.error('Failed to delete Cloudinary folder:', err);
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.publishBlog = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    {
      status: 'published',
      publishedAt: new Date(),
      publisher: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    message: 'Blog published successfully',
    data: updatedBlog,
  });
});
