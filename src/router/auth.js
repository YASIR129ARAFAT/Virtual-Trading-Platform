const express = require("express");
var db = require('../database/db');
const router=express.Router();
const jwt = require("jsonwebtoken");
const transport = require("../mailer/mailsend");
const JWT_SECRET="parwez";
var password_from_database;
var email_from_database;
var enrollment;
const CryptoJS = require("crypto-js");
const key = "12345";
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



//route 1
//forget password authentication

router.get("/forget-password", async (req, res, next)=>{
      res.render("forget-password", { message: req.flash("message") });
});
router.post("/forget-password",async (req, res, next)=>{

  const email = req.body.email;

  //  res.send(email);

  //  console.log(email);

  var sql = `select  username,  email ,password from stockuser where email='${email}'`;
  db.query(sql, function (err, result) {
    if (err) {
      console.log(err);

      console.log("user not registered");
      req.flash("message", "user not registered");
      res.redirect("login");
    } else {
      console.log(result);
      email_from_database = result[0].email;
      password_from_database = result[0].password;
      enrollment = result[0].username;

      // console.log(password_from_database);

      // console.log(email_from_database);
      if (email != email_from_database) {
         req.flash("message", "no  email found");

         res.redirect("/api/auth/forget-password");
        return;
      }
      //since the user exist so we will generate ontime time link which will be valid for 15 minutes
      const secret = JWT_SECRET + password_from_database;
      const payload = {
        id: enrollment,
        email: email_from_database,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "15m" });
      const link = `http://localhost:80/api/auth/reset-password/${enrollment}/${token}`;
       console.log(email);
      var mailOptions = {
        from: "projectaaupy@gmail.com",
        to: `"${email}"`,
        subject: "forgot password",
        text: `reset password link ===>${link}`,
      };
      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
         req.flash("message", "invalid email");
         
          res.redirect("/api/auth/forget-password");


        } else {
           req.flash("message", "Authentication mail is send to your email");
         
          res.redirect("/api/auth/forget-password");
        }
      });
    }
  });

});




// setting the new password

//route 2



router.get("/reset-password/:id/:token", async (req, res, next) => {
   const { id, token } = req.params;
   // console.log(token);

   //  console.log(id);
   if (id != enrollment) {
    console.log("he")
     res.send("invalid");
     return;
   }

   const secret = JWT_SECRET + password_from_database;

   try {
     const payload = jwt.verify(token, secret);
     res.render("reset-password", { id:id, token:token });
   } catch (error) {
     console.log(error.message);
     res.send(error.message);
   }
});

router.post("/reset-password/:id/:token", async (req, res, next) => {

    const id = req.params.id;
    const token = req.params.token;

  

    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    console.log(confirm_password);
    console.log(enrollment);
    //  console.log('h');
    console.log(id);
    // console.log(enrollment);

    if (id != enrollment) {
      res.send("invalid");
      return;
    }
    // console.log("h");

    if (password != confirm_password) {
      res.send("enter correct password");
      return;
    }

    const secret = JWT_SECRET + password_from_database;
    try {
     
      const payload = jwt.verify(token, secret);

      


    var new_pass = crypt.encrypt(req.body.confirm_password);

      var sql = `update stockuser set password='${new_pass}' where username='${enrollment}'`;

      db.query(sql, function (err, result) {
        if (err) {
        
         req.flash("message", "some error occured ");
         res.redirect(`/api/auth/reset-password/${id}/${token}`);
       
        } else {
         
         req.flash("message", "password changed successfully ");
       res.redirect("/api/loginauth/login")
       
        }
      });
    
    } catch (error) {
      
      console.log(error.message);
      res.send(error.message);
    }
});

module.exports = router;