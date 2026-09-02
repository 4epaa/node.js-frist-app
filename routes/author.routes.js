const express = require("express");
const { createAuthor, getAuthors } = require("../controllers/author.controller");

const router = express.Router();

router.post("/", createAuthor);
router.get("/", getAuthors);

module.exports = router;