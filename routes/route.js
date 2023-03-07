const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const attendanceController = require("../controllers/attendanceController")
const otp = require("../controllers/otp")
const cors = require("cors");
 
router.use(express.json());
router.use(cors());
router.use(express.urlencoded({ extended: true }));



router.post("/registration" ,  userController.createProfile)

router.post("/login", userController.login)

router.get("/getUser", userController.getUser)

router.get("/getUserById/:userId", userController.getUserById)

router.post('/forgot-password',  userController.getForgotPassword)

router.post('/reset-password', userController.resetPassword)


router.post('/otp', otp.getOtp)





router.post("/attendance", attendanceController.attendance)

router.post("/attendanceOut", attendanceController.attendanceOut)

router.get("/getAttendance", attendanceController.getAttendance)

router.get("/getAttendanceById/:userId", attendanceController.getAttendanceById)

router.put("/updateAttendanceById/:userId" ,  attendanceController.updateAttendanceById)



module.exports = router; 