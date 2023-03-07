const attendanceModel = require("../models/attendanceModel");
const userModel = require('../models/userModel');
const mongoose = require("mongoose");



module.exports.attendance = async function (req, res) {
  try {
    let data = req.body;
    let { userId, Date, PunchIn, PunchOut, longitude, latitude } = data;

    if (!userId || userId == "") {
      return res.status(400).send({ status: false, message: "Please provide userId" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Please enter valid userId" });
    }
    if (!Date || Date == "") {
      return res.status(400).send({ status: false, message: "Please provide Date" });
    }
    if (!PunchIn || PunchIn == "") {
      return res.status(400).send({ status: false, message: "Please provide PunchIn" });
    }

    let existingData = await attendanceModel.findOne({ userId: userId, Date: Date });
    
    if (existingData) {
      // If there is an existing attendance data for the day, update the punch-in and punch-out values
      if (!existingData.PunchOut) {
        // If punch-out value is not present, update the punch-out time
        existingData.PunchOut = PunchOut;
        existingData.session.push({PunchIn: PunchIn, PunchOut: PunchOut});
        await existingData.save();
        return res.status(200).send({ status: true,message: "Punch-out successful" , data: existingData });
      } else {
        // If punch-out value is present, create a new attendance data for the day
        let savedData = await attendanceModel.create(data);
        return res.status(201).send({ status: true,  message: "Punch-in successful", data: savedData });
      }
    } else {
      // If there is no existing attendance data for the day, create a new attendance data
      let savedData = await attendanceModel.create({userId: userId, Date: Date, PunchIn: PunchIn, session: [{PunchIn: PunchIn, PunchOut: PunchOut}]});
      return res.status(201).send({ status: true,  message: "Punch-in successful", data: savedData });
    }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};











// module.exports.attendance = async function (req, res) {
//   try {
//     let data = req.body;
//     let { userId, Date, PunchIn, PunchOut, session, longitude, latitude } = data;

//     if (!userId || userId == "") {
//       return res.status(400).send({ status: false, message: "Please provide userId" });
//     }
//     if (!mongoose.isValidObjectId(userId)) {
//       return res.status(400).send({ status: false, message: "Please enter valid userId" });
//     }
//     if (!Date || Date == "") {
//       return res.status(400).send({ status: false, message: "Please provide Date" });
//     }
//     if (!PunchIn || PunchIn == "") {
//       return res.status(400).send({ status: false, message: "Please provide PunchIn" });
//     }

//     let existingData = await attendanceModel.findOne({ userId: userId});
    
//     if (existingData) {
//       if (existingData.PunchOut) {
//         return res
//           .status(400)
//           .send({ status: false, message: "PunchOut value already exists in database for this user " });
//       }
//       if (existingData.PunchIn) {
//         return res
//           .status(400)
//           .send({ status: false, message: "PunchIn value already exists in database for this user " });
//       }
//       else {
//         existingData.PunchOut = PunchOut;
//         existingData.session = time_diff(existingData.PunchIn, existingData.PunchOut);
//         await existingData.save();
//         return res.status(200).send({ status: true,message: "punch successful" , data: existingData });
//       }
//     } else {
//       let savedData = await attendanceModel.create(data);
//       return res.status(201).send({ status: true,  message: "punch successful", data: savedData });
//     }
//   } catch (error) {
//     res.status(500).send({ status: false, error: error.message });
//   }
// };


// function time_diff(pIntime, pOuttime) {
//   var t1parts = pOuttime.split(":");
//   var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

//   var t2parts = pIntime.split(":");
//   var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

//   var hour = Math.floor((t1cm - t2cm) / 60);
//   var min = Math.floor((t1cm - t2cm) % 60);
//   return hour + ":" + min;
// }



module.exports.attendanceOut = async function (req, res) {
  try {
    let data = req.body;
    let { userId, Date, PunchIn, PunchOut, session, longitude, latitude } = data;

    if (!userId || userId == "") {
      return res.status(400).send({ status: false, message: "Please provide userId" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Please enter valid userId" });
    }
    if (!Date || Date == "") {
      return res.status(400).send({ status: false, message: "Please provide Date" });
    }
    if (!PunchOut || PunchOut == "") {
      return res.status(400).send({ status: false, message: "Please provide PunchOut" });
    }

    
     let existingPunch = await attendanceModel.findOne({ userId: userId, Date: Date , PunchIn:PunchIn , PunchOut:PunchOut });

     if (existingPunch) {     
    if (existingPunch.PunchOut <= existingPunch.PunchIn) {
  return res.status(400).send({ status: false, message: "PunchOut should be greater than PunchIn" });
}
    }
    
    let existingData = await attendanceModel.findOne({ userId: userId, Date: Date });
    let PunchStatus = existingData.isPunchIn;
    if(PunchStatus == true){
      PunchStatus= false
    }

    if (existingData) {
      if (existingData.PunchOut) {
        return res 
          .status(400)
          .send({ status: false, message: "PunchOut value already exists in database for this user and date" });
      }
      else {
        existingData.PunchOut = PunchOut;
        existingData.session = time_diff(existingData.PunchIn, existingData.PunchOut);
        await existingData.save();
        return res.status(200).send({ status: true,message: "punch successful" , data: existingData });
      }
    } else {
      let savedData = await attendanceModel.create(data);
      return res.status(201).send({ status: true,  message: "punch successful", data: savedData });
    }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};


function time_diff(pIntime, pOuttime) {
  var t1parts = pOuttime.split(":");
  var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

  var t2parts = pIntime.split(":");
  var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

  var hour = Math.floor((t1cm - t2cm) / 60);
  var min = Math.floor((t1cm - t2cm) % 60);
  return hour + ":" + min;
}


// function time_diff(pIntime, pOuttime) {
//   var t1parts = pOuttime.split(":");
//   var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

//   var t2parts = pIntime.split(":");
//   var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

//   if (t1cm < t2cm) {
//     t1cm += 24 * 60; // add 24 hours to t1cm to handle negative time differences
//   }

//   var diff = t1cm - t2cm;
//   return diff; // return time difference in minutes
// }


module.exports.getAttendance = async function (req, res) {
  try {
    let attendanceFound = await attendanceModel.find().populate("userId");

    if (attendanceFound.length > 0) {
      res.status(200).send(attendanceFound);
    } else {
      res.status(404).send({ status: false, message: "No such data found " });
    }
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};




  module.exports.getAttendanceById = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!mongoose.isValidObjectId(userId))
        return res.status(400).send({ Status: false, message: "Please enter valid userId " })
    
        let allAttendance = await attendanceModel.findOne({ userId:userId }).sort({ Date: -1 });
        if (!allAttendance) {
            return res.status(400).send({ status: false, message: "attendance not found" })

        }

        return res.status(200).send({ status: true ,data: allAttendance })

    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }

}




module.exports.updateAttendanceById = async function(req,res) {

  try {
    let data = req.body
    let userId = req.params.userId

    if(Object.keys(data).length==0)
    return res.status(404).send({ msg: "No data for Update" })

    if(!mongoose.isValidObjectId(userId))
    return res.status(400).send({ Status: false, message: "Please enter valid userId " })

    let findUser = await attendanceModel.findById({userId , PunchOut:""})
    if (!findUser)
        return res.status(404).send({ msg: "userId  is invalid " })

        let updatedBlog = await attendanceModel.findOneAndUpdate({ _id: userId }, {
            $set: {
              PunchIn: data.PunchIn,
              PunchOut: data.PunchOut,
              session: data.session,
            }
           
        }, { new: true, upsert: true })
        return res.status(200).send({ status: true, msg: updatedBlog })
}
catch (error) {
    res.status(500).send({ status: false, error: error.message })
}

}


