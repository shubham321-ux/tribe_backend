import Content from "../models/content.model.js";

/**
 * GET site content
 * GET /api/content
 */
export const getContent = async (req, res) => {
  const content = await Content.findOne();
  res.json(content);
};

/**
 * CREATE / UPDATE site content
 * PUT /api/content
 */
export const upsertContent = async (req, res) => {
  const content = await Content.findOneAndUpdate(
    {},
    req.body,
    { upsert: true, new: true }
  );

  res.json(content);
};
