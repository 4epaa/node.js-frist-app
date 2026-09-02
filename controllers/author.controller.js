const Author = require("../models/author.model");

const createAuthor = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    const author = await Author.create({ name, email });
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

const getAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find().lean();
    res.status(200).json({ success: true, data: authors });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAuthor, getAuthors };