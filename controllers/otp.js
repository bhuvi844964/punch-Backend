const otpModel = require('../models/otpModel');

module.exports.getOtp = async function (req, res) {
  try {
    let data = req.body;
    const twilio = require('twilio');
    const accountSid = 'AC4392ad40501979096fe3b26f66279ec3';
    const authToken = 'bd9607bea83e6ccf4840d462a1bef1d1';
    const client = twilio(accountSid, authToken);

    const fromNumber = '+12762861451';
    const toNumber = req.body.phone;
    const otp = Math.floor(100000 + Math.random() * 900000); 
    client.messages
      .create({
        body: `Your OTP is ${otp}`,
        from: +12762861451,
        to: req.body.phone,
      })
      .then((message) => {
        console.log(`OTP message sent to ${toNumber}`);
      })
      .catch((error) => {
        console.error('Error sending OTP message:', error);
      });

    let status = 'otp sent successfully';
    let obj = { phone: req.body.phone };
    let createotp = await otpModel.create(obj);
    return res.status(201).send(createotp);
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.msg });
  }
};
