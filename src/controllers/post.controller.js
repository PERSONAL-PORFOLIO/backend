const Post = require('../models/Post');
const slugify = require('../utils/slugify');

// GET /api/posts  — public, published only, sorted newest first
const getAll = async (req, res) => {
  try {
    const { tag, limit } = req.query;
    const filter = { published: true };
    if (tag) filter.tags = tag;
    const query = Post.find(filter).sort({ publishedAt: -1 });
    if (limit) query.limit(Number(limit));
    const posts = await query.lean();
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/:slug  — public, increments view count
const getOne = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true },
    ).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/admin/all  — admin only, all posts incl. drafts
const getAdmin = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts  — admin
const create = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, tags, published } = req.body;
    const slug = slugify(title);
    // Ensure slug uniqueness
    let uniqueSlug = slug;
    let count = 1;
    while (await Post.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count++}`;
    }
    const post = await Post.create({ title, slug: uniqueSlug, excerpt, content, coverImage, tags, published });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/posts/:id  — admin
const update = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, tags, published } = req.body;
    const existing = await Post.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Post not found' });

    // Regenerate slug only if title changed
    if (title && title !== existing.title) {
      const slug = slugify(title);
      let uniqueSlug = slug;
      let count = 1;
      while (await Post.exists({ slug: uniqueSlug, _id: { $ne: existing._id } })) {
        uniqueSlug = `${slug}-${count++}`;
      }
      existing.slug = uniqueSlug;
    }

    if (title !== undefined) existing.title = title;
    if (excerpt !== undefined) existing.excerpt = excerpt;
    if (content !== undefined) existing.content = content;
    if (coverImage !== undefined) existing.coverImage = coverImage;
    if (tags !== undefined) existing.tags = tags;
    if (published !== undefined) existing.published = published;

    await existing.save();
    res.json({ success: true, data: existing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/posts/:id  — admin
const remove = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getOne, getAdmin, create, update, remove };
