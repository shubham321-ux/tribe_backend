import Seo from "../models/seo.model.js";

export const getSeo = async (req, res) => {
  res.json(await Seo.findOne({ page: req.params.page }));
};

export const updateSeo = async (req, res) => {
  const seo = await Seo.findOneAndUpdate(
    { page: req.params.page },
    req.body,
    { upsert: true, new: true }
  );
  res.json(seo);
};
