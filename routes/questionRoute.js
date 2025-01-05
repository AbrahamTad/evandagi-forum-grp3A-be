const express = require("express");
const router = express.Router();

// question controller
const {
  ask,
  getAllQuestions,
  getSingleQuestion,
  deleteQuestion,
  editQuestion, // Import the editQuestion function
} = require("../controller/questionController");

// user ask route
router.post("/ask", ask);

// all questions route
router.get("/all-questions", getAllQuestions);

// single question route
router.get("/:questionid", getSingleQuestion);

// delete question route
router.delete("/delete-question/:questionid", deleteQuestion);

// update question route
router.put("/:questionid", editQuestion); // Add the update route

module.exports = router;

