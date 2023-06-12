const express = require("express");
var con = require("../database/db");
const router = express.Router();
var global_enrollment;

const jwt = require("jsonwebtoken");

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

const middlewares = require("../utils/verifyUser.js");
var flash = require("connect-flash");
router.get("/login", (req, res) => {
  res.render("login", {
    message: req.flash("message")
  });
});

// for rendering the main login page after user sign in (user landing page)
router.get("/user_land", middlewares.verifyUser, async (req, res) => {
  try {
    var sql = `SELECT * FROM student_data where enroll_no="${req.user.enroll_no}" `;
    con.query(sql, (error, result) => {
      if (error) console.log(error);
      else {
        res.render("user_land", {
          results: result,
        });
      }
    });
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
});

// for getting data of name, dept, description, links of user for user_landing_page
router.get("/get_data2", middlewares.verifyUser, (req, res, next) => {
  try {
    var id = req.query.id;
    var sql = `select * from student_data t1, description t2, links t3 where t1.enroll_no = t2.enroll_no and t2.enroll_no = t3.enroll_no and t1.enroll_no = "${req.user.enroll_no}";`;
    con.query(sql, [id], (error, result) => {
      if (error) console.log(error);
      else {
        //console.log("i m in ");

        console.log(result);
        res.json(result);
      }
    });
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
});

router.post("/login", (req, res) => {
  //  console.log(userkiId);

  var user = req.body.custid;
  var name;

  if (user.length == 0) {
    req.flash("message", "please enter  custid");
    res.redirect("login");
  } else {
    var pass = req.body.password;

    var sql = `select * from stockuser where  username="${user}"`;

    con.query(sql, function (err, result) {
      if (err) {
        console.log(err);
        console.log("username password doesnot matched");
        req.flash("message", "username and password does not match");
        res.redirect("login");
      } else {
        if (result[0]) {
          name = result[0].name
          if (result.length == 0) {
            req.flash("message", "please enter  valid enroll no");
            res.redirect("login");
          } else {

            let gg = crypt.decrypt(result[0].password);
            console.log(gg);
            if (gg.localeCompare(pass) == 0) {

              let token = jwt.sign(result[0], "parwez");
              res
                .cookie("access_token", token, {
                  httpOnly: true
                })
                .redirect("/api/showUserStocks/stockHome");
              // console.log("login successful");
              // res.send("successfully registered");
            } else {
              console.log("username or password doesnot matched");
              global_enroll = user;
              req.flash("message", "please enter valid password");
              res.redirect("login");
            }
          }
        }
        else{
        console.log("username does not exist");
        req.flash("message", "username does not exist");
        res.redirect("login");
        }
      }
    });
  }
});

router.get('/deleteAccountForm', (req, res) => {
  var errorMessage = req.query.errorMessage;
  res.render('delete', {
    errorMessage
  });
})

router.post('/deleteUserAccount', (req, res) => {
  var username = req.body.userId;
  var password = req.body.password;
  //check if user id exist
  var sql = `select * from stockuser where username='${username}'`;
  con.query(sql, (error, result) => {
    if (error) {
      console.log(error)
    } else {
      if (result[0]) {
        //if user id exist then check if password is correct
        let gg = crypt.decrypt(result[0].password);
        if (gg.localeCompare(password) == 0) {
          //remove every thing of this user from database
          //remove from wishlist
          var sql = `delete from wishlist where username='${username}'`;
          con.query(sql, (error, result) => {
            if (error) {
              console.log(error)
            } else {
              //remove from autoSell
              var sql = `delete from autoSell where username='${username}'`;
              con.query(sql, (error, result) => {
                if (error) {
                  console.log(error)
                } else {
                  //remove from reviews
                  var sql = `delete from reviews where username='${username}'`;
                  con.query(sql, (error, result) => {
                    if (error) {
                      console.log(error)
                    } else {
                      //remove from transactionHistory
                      var sql = `delete from transactionHistory where username='${username}'`;
                      con.query(sql, (error, result) => {
                        if (error) {
                          console.log(error)
                        } else {
                          //remove from userStocks
                          var sql = `delete from userStocks where username='${username}'`;
                          con.query(sql, (error, result) => {
                            if (error) {
                              console.log(error)
                            } else {
                              //remove from autoBuy
                              var sql = `delete from autoBuy where username='${username}'`;
                              con.query(sql, (error, result) => {
                                if (error) {
                                  console.log(error)
                                } else {
                                  //remove from stockuser
                                  var sql = `delete from stockuser where username='${username}'`;
                                  con.query(sql, (error, result) => {
                                    if (error) {
                                      console.log(error)
                                    } else {
                                      //removed finally
                                      res.redirect('/api/loginauth/deleteAccountForm?errorMessage=sucesfully deleted');
                                      console.log('acoount deleted')

                                    }
                                  })
                                }
                              })


                            }
                          })

                        }
                      })

                    }
                  })
                }
              })
            }
          })
        } else {
          //password is wrong
          res.redirect('/api/loginauth/deleteAccountForm?errorMessage=Incorrect password');
        }

      } else {
        res.redirect('/api/loginauth/deleteAccountForm?errorMessage=userId does not exist');
      }
    }
  })
})

module.exports = router;