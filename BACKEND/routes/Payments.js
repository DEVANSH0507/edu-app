//IMPORT REQUIRED MODULES

const express = require("express")
const router = express.Router()

const {capturePayment,verifySignature} = require("../controllers/Payments"); 
const { isInstuctor, isStudent, isAdmin, auth } = require("../middlewares/auth");

router.post("/capturePayment",auth,isStudent,capturePayment)
router.post("/verifySignature",verifySignature)

module.exports = router