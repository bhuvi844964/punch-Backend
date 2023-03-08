const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    techId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
  
    },
    resetToken: { 
      type: String, 
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
    designation: {
      type: String,
    },
    otp: {
      type: String,
    },
   
  },
  { timestamps: true }
);


module.exports = mongoose.model("user", userSchema);
