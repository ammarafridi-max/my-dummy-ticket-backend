const Blog = require('../models/Blog');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const slugify = require('slugify');
const { uploadImageToCloudinary, deleteCloudinaryFolder } = require('../utils/cloudinary');
const { generateUniqueSlug, estimateReadingTime } = require('../utils/blogHelper');

exports.createBlogPost = catchAsync(async (req, res, next) => {
  const { title, slug: customSlug, content, excerpt, status, tags, metaTitle, metaDescription } = req.body;
  const authorId = req.user._id;

  if (!title || !content) {
    return next(new AppError('Title and content are required', 400));
  }

  if (!req.file) {
    return next(new AppError('Cover image is required', 400));
  }

  const baseSlug = slugify(customSlug || title, { lower: true, strict: true });
  const uniqueSlug = await generateUniqueSlug(baseSlug);
  const readingTime = estimateReadingTime(content);

  let normalizedTags = [];
  if (Array.isArray(tags)) normalizedTags = tags;
  else if (typeof tags === 'string') normalizedTags = [tags];

  const folderName = `mdt/mdt_blog/${uniqueSlug}`.replace(/\s+/g, '_');

  let coverImageUrl;
  try {
    coverImageUrl = await uploadImageToCloudinary(req.file.buffer, folderName);
  } catch (err) {
    console.error('Cover image upload failed:', err);
    return next(new AppError('Failed to upload cover image', 500));
  }

  const isPublished = status === 'published';

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
  }).populate('authorDetails');

  res.status(201).json({
    status: 'success',
    message: 'Blog created successfully',
    data: blog,
  });
});

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

exports.updateBlogPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Blog updated successfully',
    data: updatedBlog,
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
