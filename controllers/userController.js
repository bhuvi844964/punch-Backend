const mongoose = require("mongoose")
const userModel = require("../models/userModel");
// const cloudinary = require("cloudinary").v2
const nodemailer = require('nodemailer');
const crypto = require('crypto');

let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/

// cloudinary.config({ 
//     cloud_name:  process.env.Cloud, 
//     api_key: process.env.api_key, 
//     api_secret: process.env.Api_secret
//   });



  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sharmaji232001@gmail.com',
      pass: 'nedecfsgmvjpdynz'
    },
  });


  module.exports.createProfile = async (req, res) => {
    // let profileImage = req.files.profileImage;
  
    try {
      let data = req.body;
      let { name, email, designation, password , Date ,PunchIn,PunchOut , session} = data;
  
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
      if (!password || password == "") {
        return res.status(400).send({ Status: false, message: "Please provide password" })
    }
      if (!designation || designation == "") {
        return res.status(400).send({ Status: false, message: "Please provide designation" })
  
    }
//     if (!profileImage || profileImage == "") {
//       return res.status(400).send({ Status: false, message: "Please provide profileImage" })
//   }
//   if (profileImage.length == 0){
//     return res.status(400).send({ status: false, message: "upload profile image" }); 
//  }
  
//       const result = await cloudinary.uploader.upload(profileImage.tempFilePath, { resource_type: "auto" });
      const product = {
        name,
        email,
        password,
        designation,
        // profileImage: result.url,
        Date ,PunchIn,PunchOut , session
      };
      const savedProduct = await userModel.create(product);
  
       res.status(201).send({ status : true, msg: savedProduct })
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
    let userPassword = await userModel.findOne({  password });
    if (!user)
      return res.status(401).send({
        status: false,
        message: "email  is not corerct",
      });
    if (!userPassword)
      return res.status(401).send({
        status: false,
        message: "password  is not corerct",
      });
    res.status(200).send({ status: true, message: " login successful"});
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};
 


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

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const mailOptions = {
      from:'bhuvi844964@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset for your account.</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>Your OTP is ${resetToken}. Please use this to reset your password. </p>`,
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

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).send({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
}; 


