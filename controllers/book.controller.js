const mongoose = require("mongoose");
const Book = require("../models/book.model");

const getBooks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate("author", "name email")
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, price, author } = req.body;

    if (!title || price === undefined || !author) {
      return res.status(400).json({ success: false, message: "Title, price and author are required" });
    }

    if (!mongoose.isValidObjectId(author)) {
      return res.status(400).json({ success: false, message: "Invalid author ID" });
    }

    const newBook = await Book.create({ title, price, author });
    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID" });
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, createBook, deleteBook };