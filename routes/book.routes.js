const express = require("express");
const { getBooks, createBook, deleteBook } = require("../controllers/book.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", getBooks);
router.post("/", authenticate, createBook);
router.delete("/:id", authenticate, authorize("admin"), deleteBook);

module.exports = router;