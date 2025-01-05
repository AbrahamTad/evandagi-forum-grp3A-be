// db connection
const dbConection = require("../db/dbConfig");

// bcrypt to hide our password
const bcrypt = require("bcrypt");

// http-status-codes to tell the browser the result of its request.
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all the required information" });
  }

  try {
    console.log("User Registration Data:", req.body);

    const [user] = await dbConection.query(
      "SELECT username, userid FROM users WHERE username=? OR email=?",
      [username, email]
    );

    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Username or email already registered" });
    }

    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password must be at least 8 characters" });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConection.query(
      "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?,?,?,?,?)",
      [username, firstname, lastname, email, hashedPassword]
    );

    return res.status(StatusCodes.CREATED).json({ msg: "User registered" });
  } catch (error) {
    console.log("Error during registration:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all the required information" });
  }

  try {
    console.log("Login Attempt with Email:", email);

    const [user] = await dbConection.query(
      "SELECT username, userid, password FROM users WHERE email=?",
      [email]
    );

    if (user.length == 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid credentials" });
    }

    const username = user[0].username;
    const userid = user[0].userid;
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(StatusCodes.OK)
      .json({ msg: "User login successful", token, username });
  } catch (error) {
    console.log("Error during login:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

async function check(req, res) {
  const username = req.user.username;
  const userid = req.user.userid;

  console.log("Check User:", { username, userid });

  res.status(StatusCodes.OK).json({ msg: "Valid user", username, userid });
}

// New Endpoints for Editing and Deleting Questions

async function editQuestion(req, res) {
  const { questionId } = req.params;
  const { title, body } = req.body;
  const userid = req.user.userid;

  if (!title || !body) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide title and body" });
  }

  try {
    console.log("User ID:", userid);
    console.log("Question ID:", questionId);

    const [question] = await dbConection.query(
      "SELECT userid FROM questions WHERE questionId = ?",
      [questionId]
    );

    if (question.length === 0 || question[0].userid !== userid) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Unauthorized to edit this question" });
    }

    await dbConection.query(
      "UPDATE questions SET title = ?, body = ? WHERE questionId = ?",
      [title, body, questionId]
    );

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Question updated successfully" });
  } catch (error) {
    console.log("Error during editQuestion:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

const deleteQuestion = async (req, res) => {
  const { questionid } = req.params;

  try {
    // Assuming you're using MySQL or a similar database
    const result = await db.execute(
      "DELETE FROM questions WHERE questionid = ?",
      [questionid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Question not found" }); // Provide a detailed error message
    }

    res.status(200).json({ msg: "Question deleted successfully." }); // Send success message
  } catch (error) {
    console.error("Error deleting question:", error.message);
    res
      .status(500)
      .json({ msg: "Failed to delete question.", error: error.message }); // Send error details
  }
};

// async function deleteQuestion(req, res) {
//   const { questionId } = req.params;
//   const userid = req.user.userid;

//   try {
//     console.log("User ID:", userid);
//     console.log("Question ID:", questionId);

//     const [question] = await dbConection.query(
//       "SELECT userid FROM questions WHERE questionId = ?",
//       [questionId]
//     );

//     if (question.length === 0 || question[0].userid !== userid) {
//       return res
//         .status(StatusCodes.FORBIDDEN)
//         .json({ msg: "Unauthorized to delete this question" });
//     }

//     await dbConection.query("DELETE FROM questions WHERE questionId = ?", [
//       questionId,
//     ]);

//     return res
//       .status(StatusCodes.OK)
//       .json({ msg: "Question deleted successfully" });
//   } catch (error) {
//     console.log("Error during deleteQuestion:", error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "Something went wrong, try again later" });
//   }
// }

async function editAnswer(req, res) {
  const { answerId } = req.params;
  const { body } = req.body;
  const userid = req.user.userid;

  if (!body) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide an answer body" });
  }

  try {
    console.log("User ID:", userid);
    console.log("Answer ID:", answerId);

    const [answer] = await dbConection.query(
      "SELECT userid FROM answers WHERE answerId = ?",
      [answerId]
    );

    if (answer.length === 0 || answer[0].userid !== userid) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Unauthorized to edit this answer" });
    }

    await dbConection.query("UPDATE answers SET body = ? WHERE answerId = ?", [
      body,
      answerId,
    ]);

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Answer updated successfully" });
  } catch (error) {
    console.log("Error during editAnswer:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

async function deleteAnswer(req, res) {
  const { answerId } = req.params;
  const userid = req.user.userid;

  try {
    console.log("User ID:", userid);
    console.log("Answer ID:", answerId);

    const [answer] = await dbConection.query(
      "SELECT userid FROM answers WHERE answerId = ?",
      [answerId]
    );

    if (answer.length === 0 || answer[0].userid !== userid) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Unauthorized to delete this answer" });
    }

    await dbConection.query("DELETE FROM answers WHERE answerId = ?", [
      answerId,
    ]);

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Answer deleted successfully" });
  } catch (error) {
    console.log("Error during deleteAnswer:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}

module.exports = {
  register,
  login,
  check,
  editQuestion,
  deleteQuestion,
  editAnswer,
  deleteAnswer,
};

// // db connection
// const dbConection = require("../db/dbConfig");

// // bcrypt to hide our password
// const bcrypt = require("bcrypt");

// // http-status-codes to tell the browser the result of its request.
// const { StatusCodes } = require("http-status-codes");
// const jwt = require("jsonwebtoken");

// async function register(req, res) {
//   const { username, firstname, lastname, email, password } = req.body;

//   if (!username || !firstname || !lastname || !email || !password) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "please provide all the required informations" });
//   }

//   try {
//     const [user] = await dbConection.query(
//       "SELECT username,userid FROM users WHERE username=? or email=?",
//       [username, email]
//     );
//     if (user.length > 0) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ msg: "username already registered" });
//     }
//     if (password.length < 8) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ msg: "password must be at least 8 characters" });
//     }

//     // Encrypt the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     await dbConection.query(
//       "INSERT INTO users (username,firstname,lastname,email,password) VALUES (?,?,?,?,?)",
//       [username, firstname, lastname, email, hashedPassword]
//     );

//     return res.status(StatusCodes.CREATED).json({ msg: "user registered" });
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "something went wrong, try again later" });
//   }
// }

// async function login(req, res) {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "please provide all the required informations" });
//   }

//   try {
//     const [user] = await dbConection.query(
//       "SELECT username,userid,password FROM users WHERE email=?",
//       [email]
//     );

//     if (user.length == 0) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ msg: "invalid credentials" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user[0].password);

//     if (!isMatch) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ msg: "invalid credentials" });
//     }

//     const username = user[0].username;
//     const userid = user[0].userid;
//     const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     return res
//       .status(StatusCodes.OK)
//       .json({ msg: "user login successful", token, username });
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "something went wrong, try again later" });
//   }
// }

// async function check(req, res) {
//   const username = req.user.username;
//   const userid = req.user.userid;

//   res.status(StatusCodes.OK).json({ msg: "valid user", username, userid });
// }

// // New Endpoints for Editing and Deleting Questions/Answers

// async function editQuestion(req, res) {
//   const { questionId } = req.params;
//   const { title, body } = req.body;
//   const userid = req.user.userid;

//   if (!title || !body) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "Please provide title and body" });
//   }

//   try {
//     const [question] = await dbConection.query(
//       "SELECT userid FROM questions WHERE questionId = ?",
//       [questionId]
//     );

//     if (question.length === 0 || question[0].userid !== userid) {
//       return res
//         .status(StatusCodes.FORBIDDEN)
//         .json({ msg: "Unauthorized to edit this question" });
//     }

//     await dbConection.query(
//       "UPDATE questions SET title = ?, body = ? WHERE questionId = ?",
//       [title, body, questionId]
//     );

//     return res
//       .status(StatusCodes.OK)
//       .json({ msg: "Question updated successfully" });
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "something went wrong, try again later" });
//   }
// }

// async function deleteQuestion(req, res) {
//   const { questionId } = req.params;
//   const userid = req.user.userid;

//   try {
//     const [question] = await dbConection.query(
//       "SELECT userid FROM questions WHERE questionId = ?",
//       [questionId]
//     );

//     if (question.length === 0 || question[0].userid !== userid) {
//       return res
//         .status(StatusCodes.FORBIDDEN)
//         .json({ msg: "Unauthorized to delete this question" });
//     }

//     await dbConection.query("DELETE FROM questions WHERE questionId = ?", [
//       questionId,
//     ]);

//     return res
//       .status(StatusCodes.OK)
//       .json({ msg: "Question deleted successfully" });
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "something went wrong, try again later" });
//   }
// }

// async function editAnswer(req, res) {
//   const { answerId } = req.params;
//   const { body } = req.body;
//   const userid = req.user.userid;

//   if (!body) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "Please provide an answer body" });
//   }

//   try {
//     const [answer] = await dbConection.query(
//       "SELECT userid FROM answers WHERE answerId = ?",
//       [answerId]
//     );

//     if (answer.length === 0 || answer[0].userid !== userid) {
//       return res
//         .status(StatusCodes.FORBIDDEN)
//         .json({ msg: "Unauthorized to edit this answer" });
//     }

//     await dbConection.query("UPDATE answers SET body = ? WHERE answerId = ?", [
//       body,
//       answerId,
//     ]);

//     return res
//       .status(StatusCodes.OK)
//       .json({ msg: "Answer updated successfully" });
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "something went wrong, try again later" });
//   }
// }

// async function deleteAnswer(req, res) {
//   const { answerId } = req.params;
//   const userid = req.user.userid;

//   try {
//     const [answer] = await dbConection.query(
//       "SELECT userid FROM answers WHERE answerId = ?",
//       [answerId]
//     );

//     if (answer.length === 0 || answer[0].userid !== userid) {
//       return res
//         .status(StatusCodes.FORBIDDEN)
//         .json({ msg: "Unauthorized to delete this answer" });
//     }

//     await dbConection.query("DELETE FROM answers WHERE answerId = ?", [
//       answerId,
//     ]);

//     return res
//       .status(StatusCodes.OK)
//       .json({ msg: "Answer deleted successfully" });
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "something went wrong, try again later" });
//   }
// }

// module.exports = {
//   register,
//   login,
//   check,
//   editQuestion,
//   deleteQuestion,
//   editAnswer,
//   deleteAnswer,
// };

// // // db connection
// // const dbConection = require("../db/dbConfig");

// // // bcrypt to hide our password
// // const bcrypt = require("bcrypt");

// // //http-status-codes to tell the browser the result of its request.
// // const { StatusCodes } = require("http-status-codes");
// // const jwt = require("jsonwebtoken")

// // async function register(req, res) {

// //   const { username, firstname, lastname, email, password } = req.body;

// //   if (!username || !firstname || !lastname || !email || !password) {
// //     return res
// //       .status(StatusCodes.BAD_REQUEST)
// //       .json({ msg: "please provide all the required informations" });
// //   }

// //   try {
// //     const [user] = await dbConection.query(
// //       "SELECT username,userid FROM users WHERE username=? or email=?",
// //       [username, email]
// //     );
// //     if (user.length > 0) {
// //       return res
// //         .status(StatusCodes.BAD_REQUEST)
// //         .json({ msg: "username already registered" });
// //     }
// //     if (password.length < 8) {
// //       return res
// //         .status(StatusCodes.BAD_REQUEST)
// //         .json({ msg: "passwor must be at least 8 character" });
// //     }

// //     // encrypt the password
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     await dbConection.query(
// //       "INSERT INTO users (username,firstname,lastname,email,password) VALUES (?,?,?,?,?)",
// //       [username, firstname, lastname, email, hashedPassword]
// //     );

// //     return res.status(StatusCodes.CREATED).json({ msg: "user registered" });

// //   } catch (error) {

// //     console.log(error.message);

// //     return res
// //       .status(StatusCodes.INTERNAL_SERVER_ERROR)
// //       .json({ msg: "something went wrong, try again later" });
// //   }
// // }

// // async function login(req, res) {
// //   const { email, password } = req.body;
// //   if (!email || !password) {
// //     return res
// //       .status(StatusCodes.BAD_REQUEST)
// //       .json({ msg: "please provide all the required informations" });
// //   }

// //   try {
// //     const [user] = await dbConection.query(
// //       "SELECT username,userid,password FROM users WHERE email=?",
// //       [email]
// //     );

// //     if (user.length == 0) {
// //       return res
// //         .status(StatusCodes.BAD_REQUEST)
// //         .json({ msg: "invalid credential" });
// //     }

// //     // compare password
// //     const isMatch = await bcrypt.compare(password, user[0].password);

// //     if (!isMatch) {
// //       return res
// //         .status(StatusCodes.BAD_REQUEST)
// //         .json({ msg: "invalid credential" });
// //     }

// //     const username = user[0].username
// //     const userid = user[0].userid
// //     const token = jwt.sign({username,userid},process.env.JWT_SECRET,{expiresIn:"1d"})
// //     return res.status(StatusCodes.OK).json({ msg: "user login successful",token,username });

// //   } catch (error) {
// //     console.log(error.message);
// //     return res
// //       .status(StatusCodes.INTERNAL_SERVER_ERROR)
// //       .json({ msg: "something went wrong, try again later" });
// //   }
// // }

// // async function check(req, res) {

// //   const username = req.user.username
// //   const userid = req.user.userid;

// //   res
// //     .status(StatusCodes.OK)
// //     .json({ msg: "valid user",username,userid });

// // }

// // module.exports = { register, login, check };
