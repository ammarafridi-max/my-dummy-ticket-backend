const slugify = require('slugify');
const AppError = require('../utils/appError');
const { uploadImageToCloudinary, deleteCloudinaryFile } = require('../utils/cloudinary');
const { generateUniqueSlug, estimateReadingTime } = require('../utils/blogHelper');

exports.validateBlog = (req) => {
  const { title, content } = req.body;

  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  if (!req.file) {
    throw new AppError('Cover image is required', 400);
  }
};

exports.normalizeTags = (tags) => {
  let normalizedTags = [];
  if (Array.isArray(tags)) normalizedTags = tags;
  else if (typeof tags === 'string') normalizedTags = [tags];

  return normalizedTags;
};

exports.saveCoverImage = async (req, uniqueSlug, blog = null) => {
  if (!req.file) return;

  try {
    if (blog?.coverImageUrl) await deleteCloudinaryFile(blog.coverImageUrl);

    const slug = blog?.slug || uniqueSlug;
    const folderName = `mdt/mdt_blog/${slug}`.replace(/\s+/g, '_');
    const url = await uploadImageToCloudinary(req.file.buffer, folderName);

    return url;
  } catch (err) {
    console.error('Cover image upload failed:', err);
    throw new AppError('Failed to upload cover image', 500);
  }
};

exports.generateSlugAndReadingTime = async (customSlug, title, content) => {
  const baseSlug = slugify(customSlug || title, { lower: true, strict: true });
  const uniqueSlug = await generateUniqueSlug(baseSlug);
  const readingTime = estimateReadingTime(content);

  return { uniqueSlug, readingTime };
};
