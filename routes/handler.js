const express = require('express');
const { register, verifyEmail, login } = require('../controller/Account');



const router = express.Router();

router.route("/register").post(register)
router.route("/verify").post(verifyEmail)
router.route("/login").post(login)



module.exports = router