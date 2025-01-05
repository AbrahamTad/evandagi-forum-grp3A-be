const express = require("express")
const router = express.Router()

// authentication middleware
const authMiddleware = require("../middleware/authMiddleware")

// user controller
const {register,login,check} = require("../controller/userController")

//user register routes
router.post("/register", register)

//user login routes
router.post("/login", login);

//check user
router.get("/checkUser", authMiddleware, check);

module.exports = router