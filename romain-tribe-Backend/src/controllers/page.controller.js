import Page from "../models/page.model.js";

/**
 * GET page by slug
 * GET /api/pages/home
 */
export const getPage = async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });

  if (!page) {
    return res.status(404).json({ message: "Page not found" });
  }

  res.json(page);
};

/**
 * CREATE / UPDATE page by slug
 * PUT /api/pages/home
 */
export const upsertPage = async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { slug: req.params.slug, content: req.body },
    { upsert: true, new: true }
  );

  res.json(page);
};
