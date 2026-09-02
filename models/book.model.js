const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);