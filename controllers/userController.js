const mongoose = require("mongoose")
const userModel = require("../models/userModel");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;


let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sharmaji232001@gmail.com',
      pass: 'nedecfsgmvjpdynz'
    },
  });


  module.exports.createProfile = async (req, res) => {
    try {
      let data = req.body;
      let { name, email, designation, password } = data;
  
      if (!name || name == "") { 
        return res.status(400).send({ Status: false, message: "Please provide name" })
    }
      if (!email || email == "") {
        return res.status(400).send({ Status: false, message: "Please provide email" })
    }
    if (!emailRegex.test(email)) {
      return res.status(400).send({ Status: false, message: "Please enter valid email" })
    }
      let existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).send({
          Status: false,
          message: "Email already exists. Please use a different email."
        });
      }
      
      if (!designation || designation == "") {
        return res.status(400).send({ Status: false, message: "Please provide designation" })  
      }

      if (!password || password == "") {
        return res.status(400).send({ Status: false, message: "Please provide password" })
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);

      const product = {
        name,
        email,
        designation,
        password:hashPassword,
      };
      const savedProduct = await userModel.create(product);
  
       res.status(201).send({ status : true, message: "SignUp successful", msg: savedProduct })
    } catch (error) {
      res.status(500).send({ status: false, error: error.message })
    }
  };
  

 

  module.exports.login = async function (req, res) {
    try {
      let email = req.body.email;
      let password = req.body.password;
      
      if (!email || email == "") {
        return res.status(400).send({ Status: false, message: "Please provide email" })
    }
    if (!password || password == "")
        return res.status(400).send({ Status: false, message: "Please provide password to login " })
  
      let user = await userModel.findOne({ email });
      if (!user)
      return res.status(401).send({status: false, message: "email  is not corerct",});

      let matchPassword = await bcrypt.compare(password, user.password);

      if (!matchPassword) return res.status(401).send({ status: false, msg: "Password is incorrect." });

        const token=jwt.sign({
          userId:user._id,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },"This-is-a-secret-key") 
  
      res.status(200).send({ status: true, message: " login successful" , token: token  , user:user  });
    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  };
 




  module.exports.getAttendanceById = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!mongoose.isValidObjectId(userId))
        return res.status(400).send({ Status: false, message: "Please enter valid userId " })
    
        let allAttendance = await attendanceModel.find({ userId:userId }).sort({ Date: -1 });
        if (!allAttendance) {
            return res.status(400).send({ status: false, message: "attendance not found" })

        }

        return res.status(200).send({ status: true ,data: allAttendance })

    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }

}

















module.exports.getUser = async function (req, res) {
  try {
    let userFound = await userModel.find(req.query).select({ createdAt: 0, updatedAt: 0, __v: 0});
    if (userFound.length > 0) {
      res.status(200).send( userFound );
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
          return res.status(400).send({ Status: false, message: "Please enter valid userId" })
  }
    let userFound = await userModel.findOne({ _id: userId }).select({ createdAt: 0, updatedAt: 0, __v: 0});


    res.status(200).send({ status: true, message: userFound  });
 
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  } 
}; 


module.exports.getForgotPassword = async function (req, res) {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `https://punch-backend.up.railway.app/reset-password?token=${resetToken}`;
    const mailOptions = {
      from:'bhuvi844964@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset for your account.</p><p>Your OTP is ${resetToken}. Please use this to reset your password. </p>`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
};                    



module.exports.resetPassword = async function (req, res) {
  const { token, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    console.log(user)
    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).send({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
};
 


