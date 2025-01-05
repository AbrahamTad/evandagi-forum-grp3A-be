// const { StatusCodes } = require("http-status-codes");
// const jwt = require("jsonwebtoken");

// async function authMiddleware(req, res, next) {
//   const authHeader = req.headers.authorization;

//   // Check if Authorization header exists and starts with 'Bearer'
//   if (!authHeader || !authHeader.startsWith("Bearer")) {
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ msg: "Authentication invalid" });
//   }

//   // Extract the token from the Authorization header
//   const token = authHeader.split(" ")[1];

//   try {
//     // Verify the token and extract the user data
//     const { username, userid } = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach the user data to the request object
//     req.user = { username, userid };

//     // Pass control to the next middleware or route handler
//     next();
//   } catch (error) {
//     // If token is invalid or expired
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ msg: "Authentication invalid" });
//   }
// }

// module.exports = authMiddleware;

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication invalid" });
  }

  const token = authHeader.split(' ')[1]

  try {

    const { username, userid } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username, userid };
    next()

  } catch (error) {

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication invalid" });
  }
}

module.exports = authMiddleware;
