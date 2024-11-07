const express = require('express');
const { register, verifyEmail, login } = require('../controller/Account');
const { product, allProducts, deleteSingleProduct, updateSingleProduct, singleProduct } = require('../controller/Product');



const router = express.Router();

router.route("/register").post(register)
router.route("/verify").post(verifyEmail)
router.route("/login").post(login)

router.route("/createProduct").post(product)
router.route("/getProducts").get(allProducts)
router.route("/deleteProduct/:id").delete(deleteSingleProduct)
router.route("/updateProduct/:id").patch(updateSingleProduct)
router.route("/singleProduct/:id").get(singleProduct)



module.exports = router