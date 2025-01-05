const express = require("express");
const router = express.Router();

// question controller
const { getAnswer, postAnswer } = require("../controller/answerController");

// user get answer router
router.get("/answer/:questionid", getAnswer);

// user post answer router
router.post("/answer", postAnswer);

module.exports = router


