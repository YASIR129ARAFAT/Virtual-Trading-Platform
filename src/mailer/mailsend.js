var nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "projectaaupy@gmail.com",
    pass: "omysvllqakbeezbx",
  },
});


module.exports = transport;
