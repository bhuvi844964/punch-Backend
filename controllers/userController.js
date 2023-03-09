const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const attendanceModel = require('../models/attendanceModel');



let emailRegex =
  /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sharmaji232001@gmail.com",
    pass: "nedecfsgmvjpdynz",
  },
});

let lastId = 10;

async function generateTechId() {
  lastId++;
  const techId = `tech${lastId.toString().padStart(3, "0")}`;

  const existingUser = await userModel.findOne({ techId });
  if (existingUser) {
    return generateTechId();
  }
  return techId;
}

module.exports.createProfile = async (req, res) => {
  try {
    const data = req.body;
    const { name, email, designation, password } = data;

    if (!name || name == "") {
      return res
        .status(400)
        .send({ status: false, message: "Please provide name" });
    }
    if (!email || email == "") {
      return res
        .status(400)
        .send({ status: false, message: "Please provide email" });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid email" });
    }
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        status: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    if (!designation || designation == "") {
      return res
        .status(400)
        .send({ status: false, message: "Please provide designation" });
    }

    if (!password || password == "") {
      return res
        .status(400)
        .send({ status: false, message: "Please provide password" });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);

    const techId = await generateTechId();
    const user = {
      techId,
      name,
      email,
      designation,
      password: hashPassword,
    };
    const savedUser = await userModel.create(user);

    res
      .status(201)
      .send({ status: true, message: "SignUp successful", data: savedUser });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

module.exports.login = async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || email == "") {
      return res
        .status(400)
        .send({ Status: false, message: "Please provide email" });
    }
    if (!password || password == "")
      return res
        .status(400)
        .send({ Status: false, message: "Please provide password to login " });

    let user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(401)
        .send({ status: false, message: "email  is not corerct" });

    let matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword)
      return res
        .status(401)
        .send({ status: false, msg: "Password is incorrect." });

    const token = jwt.sign(
      {
        userId: user._id,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      "This-is-a-secret-key"
    );

    res
      .status(200)
      .send({
        status: true,
        message: " login successful",
        token: token,
        user: user,
      });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};



module.exports.TechIdIn = async function (req, res) {
  try {
    let techId = req.body.techId;

    if (!techId || techId == "") {
      return res
        .status(400)
        .send({ Status: false, message: "Please provide employee Id" });
    }

    let user = await userModel.findOne({ techId });
    
    if (!user)
      return res
        .status(401)
        .send({ status: false, message: "techId  is not corerct" });

        let data = req.body;
        let { userId, Date, PunchIn, PunchOut, session, longitude, latitude } =  data;
      
        if (!Date || Date == '') {
          return res
            .status(400)
            .send({ status: false, message: 'Please provide Date' });
        }
        if (!PunchIn || PunchIn == '') {
          return res
            .status(400)
            .send({ status: false, message: 'Please provide PunchIn' });
        }

        let existingData = await attendanceModel.find({
          userId: user._id,
          PunchIn: { $exists: true  },
          $or: [{ PunchOut: ''  }]
        });
 
console.log(existingData)


        if (existingData.length) {
          return res
            .status(400)
            .send({ status: false, message: 'Please provide PunchOut' });
        }

        let obj = {
          userId : user._id , 
          Date, 
          PunchIn, 
          PunchOut,
          session,
          longitude,
          latitude 
        }
        let savedData = await attendanceModel.create(obj);
        return res
          .status(201)
          .send({ status: true, message: 'punchIn successful', data: savedData ,user: user });

  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};



module.exports.TechIdOut = async function (req, res) {
  try {
    let techId = req.body.techId;

    if (!techId || techId == "") {
      return res
        .status(400)
        .send({ Status: false, message: "Please provide employee Id" });
    }

    let user = await userModel.findOne({ techId });
    
    if (!user)
      return res
        .status(401)
        .send({ status: false, message: "techId  is not corerct" });

        let data = req.body;
        let { userId, Date, PunchIn, PunchOut, session, longitude, latitude } =  data;
      
        if (!Date || Date == '') {
          return res
            .status(400)
            .send({ status: false, message: 'Please provide Date' });
        }

        if (!PunchOut || PunchOut == '') {
          return res
            .status(400)
            .send({ status: false, message: 'Please provide PunchOut' });
        }
        let existing = await attendanceModel.find({
          userId: user._id,
          PunchIn: { $exists: true  },
          $or: [{ PunchOut: '' }]
        });

        if (existing.length) {

          let existingData = await attendanceModel.find({
            userId: user._id,
            PunchOut: { $exists: true  },
            $or: [{ PunchOut: '' }]
          });
            
  console.log(existingData);   
  
  if (existingData.length > 0) {
    for (let i = 0; i < existingData.length; i++) {
      existingData[i].PunchOut = PunchOut;
      existingData[i].session = time_diff(
        existingData[i].PunchIn,
        existingData[i].PunchOut
      );
      await existingData[i].save();
    }
    return res
      .status(200)
      .send({
        status: true,
        message: 'PunchOut successful',
        data: existingData,
      });
  }else{
  
    let obj = {
      userId : user._id , 
      Date, 
      PunchIn, 
      PunchOut,
      session,
      longitude,
      latitude 
    }
    let savedData = await attendanceModel.create(obj);
    return res
      .status(201)
      .send({ status: true, message: 'punchOut successful', data: savedData ,user: user });
  }
  }else{

    return res
    .status(400)
    .send({ status: false, message: 'Please provide PunchIn' });

  }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};



function time_diff(pIntime, pOuttime) {
  var t1parts = pOuttime.split(':');
  var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

  var t2parts = pIntime.split(':');
  var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

  if (t1cm < t2cm) {
    t1cm += 24 * 60; 
  }
  var hour = Math.floor((t1cm - t2cm) / 60);
  var min = Math.floor((t1cm - t2cm) % 60);
  return hour + ':' + min;
}



module.exports.getUser = async function (req, res) {
  try {
    let userFound = await userModel
      .find()
      .select({ createdAt: 0, updatedAt: 0, __v: 0 });
    if (userFound.length > 0) {
      res.status(200).send(userFound);
    } else {
      res.status(404).send({ status: false, message: "No such data found " });
    }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};





module.exports.getUserById = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (userId) {
      if (!mongoose.isValidObjectId(userId))
        return res
          .status(400)
          .send({ Status: false, message: "Please enter valid userId" });
    }
    let userFound = await userModel
      .findOne({ _id: userId })
      .select({ createdAt: 0, updatedAt: 0, __v: 0 });

    res.status(200).send({ status: true, message: userFound });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};






module.exports.getForgotPassword = async function (req, res) {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(4).toString("hex").toUpperCase();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `https://punch-backend.up.railway.app/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: "bhuvi844964@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset for your account.</p><p>Your OTP is ${resetToken}. Please use this to reset your password. </p>`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};








module.exports.resetPassword = async function (req, res) {
  const { token, newPassword } = req.body;

  try {
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};
