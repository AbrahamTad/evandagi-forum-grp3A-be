const dbConection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

async function ask(req, res) {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all the required information." });
  }

  try {
    const userid = req.user.userid;

    await dbConection.query(
      "INSERT INTO questions (questionid, userid, title, description) VALUES (UUID(), ?, ?, ?)",
      [userid, title, description]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Question created successfully." });
  } catch (error) {
    console.error("Error during question creation:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
}

async function getAllQuestions(req, res) {
  try {
    const [questions] = await dbConection.query(
      "SELECT q.questionid, q.title, q.description, u.username, q.created_at FROM questions q JOIN users u ON q.userid = u.userid ORDER BY q.created_at DESC"
    );

    if (questions.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No questions found." });
    }

    return res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    console.error("Error during fetching questions:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
}

async function getSingleQuestion(req, res) {
  const { questionid } = req.params;

  try {
    const [[question]] = await dbConection.query(
      "SELECT q.*, u.username FROM questions q JOIN users u ON q.userid = u.userid WHERE q.questionid = ?",
      [questionid]
    );

    if (!question) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Question not found." });
    }

    return res.status(StatusCodes.OK).json({ question });
  } catch (error) {
    console.error("Error during fetching single question:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
}

const editQuestion = async (req, res) => {
  const { questionid } = req.params; // Extract question ID from route
  const { title, description } = req.body; // Extract updated data
  const userid = req.user.userid; // Get the user ID from the authenticated request

  if (!title || !description) {
    return res
      .status(400)
      .json({ msg: "Please provide title and description." });
  }

  try {
    const [result] = await dbConection.query(
      "UPDATE questions SET title = ?, description = ? WHERE questionId = ? AND userid = ?",
      [title, description, questionid, userid]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        msg: "You are not authorized to edit this question or it doesn't exist.",
      });
    }

    return res.status(200).json({ msg: "Question updated successfully." });
  } catch (error) {
    console.log("Error updating question:", error.message);
    return res
      .status(500)
      .json({ msg: "Failed to update question.", error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  const { questionid } = req.params;
  const { userid } = req.user;

  try {
    const [result] = await dbConection.query(
      "DELETE FROM questions WHERE questionid = ? AND userid = ?",
      [questionid, userid]
    );

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "You are not authorized to delete this question or it doesn't exist.",
      });
    }

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Question deleted successfully." });
  } catch (error) {
    console.error("Error during question deletion:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to delete question." });
  }
};

module.exports = {
  ask,
  getAllQuestions,
  getSingleQuestion,
  editQuestion,
  deleteQuestion,
};

