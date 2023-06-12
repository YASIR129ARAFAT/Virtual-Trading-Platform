/*const express = require("express");
var db = require("../database/db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const transport = require("../mailer/mailsend");
const JWT_SECRET = "parwez";
const path = require("path");
const CryptoJS = require("crypto-js");
const key = "12345";

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    // console.log(file);
    return cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });



var username;
var name;

var city;
var email;
var mobNo;

var dob ;
var amount;
var pass;
//route 1
//register user

router.get("/register", async (req, res, next) => {
  res.render("register", { message: req.flash("message") });
});
router.post("/register", async (req, res, next) => {
//  username = req.body.customerId;

 username = req.body.username;
 name=req.body.Name;

//  city = req.body.city;
 email = req.body.email;
 mobNo = req.body.mobileNumber;
//  occ = req.body.occupation;
 dob = req.body.dob;
 amount=req.body.amount;

 pass = req.body.password;

 
     
      const secret = JWT_SECRET + pass;
      const payload = {
        id: username,
        email: email,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "15m" });
      const link = `http://localhost:80/api/registerauth/confirm_register/${username}/${token}`;
      console.log(email);
      var mailOptions = {
        from: "iit2021113@iiita.ac.in",
        to: `"${email}"`,
        subject: "confirm regiter",
        text: `confirm register link ===>${link}`,
      };
      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("invalid email");
          // console.log(error);
          res.render("register");
        } else {
          console.log("email has been sent", info.response);
           req.flash("message", "Check Your Mail to confirm register");
           res.render("register");
        }
      });
    
  
});

// setting the new password

//route 2

router.get("/confirm_register/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  // console.log(token);

  //  console.log(id);
  if (id != username) {
    res.send("invalid");
    return;
  }

  const secret = JWT_SECRET + pass;

  try {
    const payload = jwt.verify(token, secret);
    res.render("confirm_register", { id: id, token: token });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});


router.post("/confirm_register/:id/:token", async (req, res, next) => {
    const id = req.params.id;
    const token = req.params.token;

  const secret = JWT_SECRET + pass;
  try {
    //passwrod and confirm password should match
    // here we can simply find the user with the payload and finally update the passwrod
    //always hash the password;
    const payload = jwt.verify(token, secret);

    console.log("hello");

   var sql = `INSERT INTO stockuser VALUES ("${username}", "${name}" ,  "${email}" ,  "${mobNo}" , '${dob}' , "${amount}", "${pass}");`;
   db.query(sql, function (err, result) {
     if (err) {
       req.flash("message", "customer Id already exist");
       res.redirect("register");
     } else {
      
       console.log("Row has been updated");
       req.flash("message", "seccessfully registered");
       res.render("login");

     }
   });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

module.exports = router;
*/



const express = require("express");
var db = require("../database/db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const transport = require("../mailer/mailsend");
const JWT_SECRET = "parwez";
const path = require("path");
const CryptoJS = require("crypto-js");
const key = "12345";

// const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     return cb(null, "./public/images");
//   },
//   filename: (req, file, cb) => {
//     // console.log(file);
//     return cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });


var username;
var Name;

var city;
var email;
var mobNo;

var dob;
var amount;
var pass;
//route 1
//register user

var crypt = {
  // (B1) THE SECRET KEY
  secret: "CIPHERKEY",

  // (B2) ENCRYPT
  encrypt: (clear) => {
    var cipher = CryptoJS.AES.encrypt(clear, crypt.secret);
    return cipher.toString();
  },

  // (B3) DECRYPT
  decrypt: (cipher) => {
    var decipher = CryptoJS.AES.decrypt(cipher, crypt.secret);
    return decipher.toString(CryptoJS.enc.Utf8);
  },
};

// router.get("/register_comp", async (req, res, next) => {
//   res.render("register_comp");
// });

router.get("/register", async (req, res, next) => {
  res.render("register", { message: req.flash("message") });
});

router.post("/register", async (req, res, next) => {
  username = req.body.id;
  Name = req.body.fullName;
  email = req.body.email;
  console.log(username);
  console.log(email);

  const secret = JWT_SECRET + Name;
  const payload = {
    id: username,
    email: email,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `http://localhost:80/api/registerauth/register_comp/${username}/${email}/${token}`;
  // console.log(token);
  var mailOptions = {
    from: "projectaaupy@gmail.com",
    to: `"${email}"`,
    subject: "confirm regiter",
    text: `"confirm register link ===>${link}"`,
  };
  transport.sendMail(mailOptions, function (error, info) {
    if (error) {
      req.flash("message", "Invalid email");
      console.log("invalid email");
      // console.log(error);
      res.redirect("/api/loginauth/login");
    } else {
      req.flash("message", "Authentication link is sent to your gmail");
      // console.log("email has been sent", info.response);
      //req.flash("message", "Check Your Mail to confirm register");
      res.redirect("/api/loginauth/login");
    }
  });
});

// setting the new password

//route 2

router.get("/confirm_register/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  // console.log(token);

  //  console.log(id);
  if (id != username) {
    res.send("invalid");
    return;
  }

  const secret = JWT_SECRET + pass;

  try {
    const payload = jwt.verify(token, secret);
    res.render("confirm_register", { id: id, token: token });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

// render the complete register page with id and email in link
router.get("/register_comp/:id/:email/:token", async (req, res, next) => {
  const { id, email, token } = req.params;
  // console.log(token);

  //  console.log(id);
  if (id != username) {
    res.send("invalid");
    return;
  }

  const secret = JWT_SECRET + Name;

  try {
    const payload = jwt.verify(token, secret);
    res.render("register_comp", { id: id, email: email, token: token });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

router.post(
  "/register_comp/:id/:email/:token",
  
  async (req, res, next) => {
    const id = req.params.id;
    const email = req.params.email;
    const token = req.params.token;

    const secret = JWT_SECRET + Name;
    try {
      //passwrod and confirm password should match
      // here we can simply find the user with the payload and finally update the passwrod
      //always hash the password;
      const payload = jwt.verify(token, secret);

      username = id;
     
      mobNo = req.body.mobileno;

      dob = req.body.dob;
      cipher = crypt.encrypt(req.body.pass);
      amount=req.body.amount;

      //console.log(req.body);
      console.log();
     // var image = req.file.filename;

      // var image=req.file.filename;

      // console.log(image);

      // var sql = `INSERT INTO student_data VALUES ("${city}", "${email}" ,  "${mobNo}" , "${occ}" , '${dob}' , "${cipher}", "${Name}","${username}" ,"${sem}", "${dept}" );`;
      var sql = `insert into stockuser values ("${username}", "${Name}", "${email}", "${mobNo}", '${dob}', ${amount},"${cipher}", ${0}, ${0});`;
      db.query(sql, function (err, result) {
        if (err) {
          console.log(err);
          req.flash("message", "Registration unsuccessfull");
          res.redirect("register_comp");
        } else {
        
                     req.flash("message", "seccessfully registered");
                  res.render("login");
        }
      });
    } catch (error) {
      console.log("ppask");
      console.log(error.message);
      res.send(error.message);
    }
  }
);

router.get("/changeProfile", async (req, res, next) => {
  res.render("changeProfile", { message: req.flash("message") });
});

const middlewares = require("../utils/verifyUser.js");
router.post(
  "/changeProfile",
  middlewares.verifyUser,
 
  async (req, res, next) => {
    var image = req.file.filename;

    var sql = `update links set profile_pic='${image}' where username='${req.user.username}'`;
    db.query(sql, function (err, result) {
      if (err) {
        console.log(err);
        req.flash("message", "unable to reset");
        res.redirect("changeProfile");
      } else {
        // req.flash("message", "seccessfully changes");
        res.render("user_land");
      }
    });
  }
);

module.exports = router;
