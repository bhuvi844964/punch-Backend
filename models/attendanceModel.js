const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const attendanceSchema = new mongoose.Schema({
   
    userId: {
        type: ObjectId,
        ref: "user"
    },
    Date: {
        type:String
    },
    PunchIn: {
        type:[String]
    },

    PunchOut: {
        type:[String]
    },
    session: {
        type:String
    },
    latitude: {
        type:String
    },
    longitude: {
        type:String
    },
    isPunchIn: {
        type:Boolean,
        default:true
    },

   
}, { timestamps: true });
 

module.exports = mongoose.model('attendance', attendanceSchema) 


