/**
 * Converts a string to a URL-safe slug.
 * e.g. "Hello World! 123" → "hello-world-123"
 */
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_]+/g, '-') // spaces/underscores → hyphens
    .replace(/--+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens

module.exports = slugify;
