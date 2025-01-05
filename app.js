const path = require("path");
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// (update during deployment)
app.use(
  cors(
    (origin = ["http://localhost:5500"]) // Replace with frontend domain in production
  )
);

// Serve static files from React app (Vite or create-react-app)
app.use(express.static(path.join(__dirname, "build"))); // Update to "dist" if using Vite

// Middleware for JSON parsing
app.use(express.json());

// Database connection
const dbConnection = require("./db/dbConfig");

// Authentication middleware
const authMiddleware = require("./middleware/authMiddleware");

// Routers
const userRouter = require("./routes/userRoute");
const questionRoute = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute");

// API routes
app.use("/api/users", userRouter);
app.use("/api/questions", authMiddleware, questionRoute);
app.use("/api", authMiddleware, answerRoute);

// Serve React app for unmatched routes (catch-all route)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html")); // Adjust path if necessary
});

// Start server
async function start() {
  try {
    const result = await dbConnection.execute("SELECT 'test'");
    app.listen(port, () => {
      console.log("Database connection established");
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error.message);
  }
}

start();

// require("dotenv").config();
// const express = require("express");
// const app = express();
// const port = 5500;
// const cors = require("cors");

// app.use(cors({ origin: "http://localhost:5500" }));

// // db connection
// const dbConection = require("./db/dbConfig");

// // authentication middleware
// const authMiddleware = require("./middleware/authMiddleware");

// // user router middleware file
// const userRouter = require("./routes/userRoute");
// // json middleware to extract json data
// app.use(express.json());
// // user router middleware
// app.use("/api/users", userRouter);

// // question router middleware file
// const questionRoute = require("./routes/questionRoute");
// // question router middleware
// app.use("/api/questions", authMiddleware, questionRoute);

// // answer router middleware file
// const answerRoute = require("./routes/answerRoute");
// // answer router middleware
// app.use("/api", authMiddleware, answerRoute);

// async function start() {
//   try {
//     const result = await dbConection.execute("select 'test'");
//     await app.listen(port);
//     console.log("database connection established");
//     console.log(`listening on ${port}`);
//   } catch (error) {
//     console.log(error.message);
//   }
// }
// start();

// // app.listen(port, (err)=>{
// //     if (err) {
// //         console.log(err);
// //     }else{
// //         console.log(`listening on localhost:${port}`);
// //     }
// // })
