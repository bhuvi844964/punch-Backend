const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
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
      required: true,
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
    // profileImage: {
    //   type : String,
    //   required: true,
    // },
    Date: {
      type:String
  },
  PunchIn: {
      type:String
  },

  PunchOut: {
      type:String
  },
  session: {
      type:String
  },

  },
  { timestamps: true }
);


module.exports = mongoose.model("user", userSchema);
