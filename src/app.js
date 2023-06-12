const express = require("express");

const app = express();
const hbs = require("hbs");
const path = require("path");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "parwez";
//const cookieParser = require("cookie-parser");
const transport = require("../src/mailer/mailsend");
var db = require("../src/database/db");
require("./auth");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
var userkiId;
var genereted_account_no;
var password_from_database;
var email_from_database;
var enrollment;

var session = require("express-session");
var flush = require("connect-flash");
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({
  extended: true
}));
const dotenv = require("dotenv");
dotenv.config({
  path: ".env"
});
const {
  constants
} = require("buffer");
const passport = require("passport");
const {
  profile
} = require("console");

//path set up
const staticpath = path.join(__dirname, "../public");
const partialpath = path.join(__dirname, "../templates/partials");
const templatepath = path.join(__dirname, "../templates/views");
app.set("view engine", "hbs");
app.set("views", templatepath);
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticpath));
hbs.registerPartials(partialpath);
var global_enroll;

app.use(
  session({
    secret: "secret",
    cookie: {
      maxAge: 60000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flush());
const port = 80; //IF PROCESS.ENV NOT AVAILABLE THEN GOES ON 3000

app.use(session({
  secret: "cats"
}));
app.use(passport.initialize());
app.use(passport.session());

//////////////////////////////////////////////////////////////
//google authentication
function isloggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

//google authenticate
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"]
  })
);
app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/student_profile",
    failureRedirect: "/auth/failure",
  })
);
//github authenticate
app.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["email", "profile"]
  })
);
app.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/homepage",
    failureRedirect: "/auth/failure",
  })
);

// facebook authenticate

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "profile"]
  })
);
app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/homepage",
    failureRedirect: "/auth/failure",
  })
);

app.get("/auth/failure", (req, res) => {
  res.send("something went wrong");
});
app.get("/protected", isloggedIn, (req, res) => {
  res.send(`hello ${req.user.email}`);
});
app.get("/logout", (req, res) => {
  req.logOut();
  req.session.destroy();
  res.render("homepage");
});

///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////

// student personal details

//render login page

app.get("/stock_display", (req, res) => {
  res.render("stock_display");
});
app.get("/homepage", isloggedIn, (req, res) => {
  var profile_pic;
  if (req.user.picture == null) {
    profile_pic = req.user.photos[0].value;
  } else {
    profile_pic = req.user.picture;
  }
  console.log(profile_pic);

  res.render("homepage", {
    email: req.user.email,
    picture: profile_pic
  });
});
app.get("/home2", (req, res) => {
  res.render("home2", {
    message: req.flash("message")
  });
});
app.get("/congrats_message", (req, res) => {
  res.render("congrats_message", {
    genereted_account_no: genereted_account_no,
  });
});




// forgot passwords
//using router file
// app.use("/api/projectauth", require("./router/projectauth"));
app.use("/api/auth", require("./router/auth"));
app.use("/api/registerauth", require("./router/registerauth"));
app.use("/api/profileauth", require("./router/profileauth"));
app.use("/api/showUserStocks", require("./router/showUserStocks"));
app.use("/api/loginauth", require("./router/loginauth"));
app.use("/api/sell", require("./router/sell"));
var request = require("request");
app.get("/get_data", async (req, res) => {
  var url =
    "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=9Q7QICP9RWAT4SAS";

  await request.get({
      url: url,
      json: true,
      headers: {
        "User-Agent": "request"
      },
    },
    (err, ress, data) => {
      if (err) {
        console.log("Error:", err);
      } else if (ress.statusCode !== 200) {
        console.log("Status:", ress.statusCode);
      } else {

        const arrayOfObj = Object.entries(data).map((e) => ({
          [e[0]]: e[1],
        }));
        console.log(arrayOfObj[1]);
        //    console.log(arrayOfObj[0]);

        let data2 = arrayOfObj[0]["Meta Data"];
        // data  = data.json();
        const newData = {};
        for (const key in data2) {
          let newKey = key;
          newKey = newKey.split(" ")[1];
          //console.log(newKey);
          newData[newKey] = data2[key];
        }
        console.log(newData)
        res.status(200).json(newData);


      }

    }
  );
});

app.get("/landing", (req, res) => {
  res.render("landing");
});



//////////////////
// for auto buy
var autoBuy = async function () {
  // console.log('autobuy starts')
  //traverse through databases and buy if condition is true
  var sql = 'select * from autoBuy';
  db.query(sql, async (error, result_data) => {
    if (error) {
      console.log(error);
    } else {
      // console.log("result length: " + result_data.length);
      //take out the current price of stock from API
      for (const element of result_data) {
        var ident = element.id + "EQN";
        // console.log('ident: ' + ident);

        const getPriceNew = async (ident) => {
          try {
            const apiKey = "62bd052f8cmsh23bc0917e49ac99p114e72jsn0d060908d7c5";
            const index = "NIFTY 200";
            const response = await fetch(
              `https://latest-stock-price.p.rapidapi.com/price?Indices=${index}&Identifier=${ident}`, {
                headers: {
                  "x-rapidapi-host": "latest-stock-price.p.rapidapi.com",
                  "x-rapidapi-key": apiKey,
                },
              }
            );

            const data = await response.json();
            // console.log('data', data)
            return data[0].lastPrice;

          } catch (err) {
            console.log('error occurred: ' + err);
            
          }
        };

        async function getPriceAndDoOperations() {
          try {
            const price = await getPriceNew(ident);
            // console.log("latest price: " + price);

            //if price is lower buy it
            if (price < element.selected_price) {

              // console.log('stock: ' + element.id)
              // console.log('selected_price: ' + element.selected_price)
              var units = element.units;
              // console.log('units to buy: ' + units);

              //check for sufficient balance
              // console.log('username: ' + element.username);
              var sql = `select * from stockuser where username='${element.username}'`;
              db.query(sql, (error, result) => {
                if (error) {
                  console.log(error);
                } else {

                  var newPr = price * units;
                  var old_bal = result[0].amount;
                  // console.log('user balance: ' + result[0].amount)
                  // console.log('new price: ' + newPr)
                  // console.log('price: ' + price)
                  // console.log('units: ' + units)
                  //if balance is sufficient
                  if (result[0].amount >= newPr) {
                    //buy it
                    var p = `'` + element.id + `'`;
                    // console.log('new value of id:' + p);
                    var sql = `select * from userStocks where username='${element.username}' and id='${element.id}'`;
                    db.query(sql, (error, result) => {
                      if (error) {
                        console.log(error);
                      } else {
                        if (result[0]) {
                          //if stock is already present in user invested stock then update
                          var newUnits = units + result[0].units;
                          console.log('newUnits: ' + newUnits);
                          var newAmtInvested = (units * price) + result[0].amt_invested;
                          console.log('newAmtInvested: ' + newAmtInvested);

                          var sql = `update userStocks set units=${newUnits}, amt_invested=${newAmtInvested} where id='${element.id}' and username='${element.username}'`
                          db.query(sql, (error, result) => {
                            if (error) {
                              console.log(error);
                            } else {
                              //updated in userstocks table now delete it from auto buy
                              var sql = `delete from autoBuy where id='${element.id}' and username='${element.username}' and selected_price='${element.selected_price}'`;
                              db.query(sql, (error, result) => {
                                if (error) {
                                  console.log(error);
                                } else {
                                  //deleted
                                  //update the amount in stockUser
                                  var newBal = old_bal - newPr;
                                  var sql = `update stockuser set amount=${newBal} where username='${element.username}'`;
                                  db.query(sql, (error, result) => {
                                    console.log('balance updated');
                                    // console.log('bought');

                                    //get todays date and time
                                    const currentDate = new Date();

                                    const year = currentDate.getFullYear();
                                    const month = currentDate.getMonth() + 1;
                                    const day = currentDate.getDate();

                                    const hours = currentDate.getHours();
                                    const minutes = currentDate.getMinutes();
                                    const seconds = currentDate.getSeconds();

                                    const formattedDate = `${day}-${month}-${year}`;
                                    const formattedTime = `${hours}:${minutes}:${seconds}`;
                                    ////////
                                    //put the value in transaction history
                                    var sql = `insert into transactionHistory values('${element.id}',${element.units},${-1*newPr},'${formattedDate}','${formattedTime}','${element.username}')`;
                                    db.query(sql, (error, result) => {
                                      if (error) {
                                        console.log(error)
                                      } else {
                                        console.log('bought finally')
                                        console.log('')
                                      }
                                    })


                                  })
                                }
                              })

                            }
                          })

                        } else {
                          //stock is not present
                          var AmtInvested = (units * price);

                          var sql = `insert into userStocks values('${element.id}','${ident}',${units},${AmtInvested},'${element.username}')`;
                          db.query(sql, (error, result) => {
                            if (error) {
                              console.log(error);
                            } else {
                              //updated in userstocks table
                              //get todays date and time
                              const currentDate = new Date();

                              const year = currentDate.getFullYear();
                              const month = currentDate.getMonth() + 1;
                              const day = currentDate.getDate();

                              const hours = currentDate.getHours();
                              const minutes = currentDate.getMinutes();
                              const seconds = currentDate.getSeconds();

                              const formattedDate = `${day}-${month}-${year}`;
                              const formattedTime = `${hours}:${minutes}:${seconds}`;
                              ////////
                              //put the value in transaction history
                              var sql = `insert into transactionHistory values('${element.id}',${element.units},${-1*newPr},'${formattedDate}','${formattedTime}','${element.username}')`;
                              db.query(sql, (error, result) => {
                                if (error) {
                                  console.log(error)
                                } else {
                                  console.log('bought finally')
                                  console.log('')
                                }
                              })

                            }
                          })
                        }
                      }
                    })
                  } else {
                    //insufficient balance
                  }
                }
              })

            } else {
              ///move to next array element
            }
          } catch (err) {
            console.error(err);
          }
        }

        await getPriceAndDoOperations();
      }
    }
  });
};
// autoBuy();
setInterval(() => {
  autoBuy();
}, 1500);
/////////
///for auto sell
var autoSell = async function () {
  // console.log('start auto sell')
  //traverse through databases and buy if condition is true
  var sql = 'select * from autoSell';
  db.query(sql, async (error, result_data) => {
    if (error) {
      console.log(error);
    } else {
      // console.log(1);

      // console.log("result length: " + result_data.length);
      //take out the current price of stock from API
      for (const element of result_data) {
        var ident = element.id + "EQN";
        // console.log('ident: ' + ident);

        const getPriceNew = async (ident) => {
          try {
            const apiKey = "62bd052f8cmsh23bc0917e49ac99p114e72jsn0d060908d7c5";
            const index = "NIFTY 200";
            const response = await fetch(
              `https://latest-stock-price.p.rapidapi.com/price?Indices=${index}&Identifier=${ident}`, {
                headers: {
                  "x-rapidapi-host": "latest-stock-price.p.rapidapi.com",
                  "x-rapidapi-key": apiKey,
                },
              }
            );

            const data = await response.json();
            // console.log('data', data)
            return data[0].lastPrice;

          } catch (err) {
            console.log('error occurred: ' + err);

          }
        };
        // console.log('hhhhh')
        async function getPriceAndDoOperations() {
          try {
            // console.log(2);
            const price = await getPriceNew(ident);
            // console.log("latest price: " + price);

            //if price is higher sell it
            // console.log('target price:' + element.selected_price)
            if (price >= element.selected_price) {
              // console.log(3);
              // console.log('stockid: ' + element.id)
              // console.log('selected_price: ' + element.selected_price)
              var units = element.units;
              // console.log('units to buy: ' + units);

              //check for sufficient units
              // console.log('username: ' + element.username);
              var sql = `select * from userStocks where username='${element.username}' and id='${element.id}'`;
              db.query(sql, (error, result) => {
                if (error) {
                  console.log(error);
                } else {
                  // console.log(result[0]);
                  if (result[0]) {
                    // console.log(4);
                    var avlUnits = result[0].units;
                    // console.log('avlUnits: ' + result[0].units)
                    // console.log('new price: ' +newPr)
                    // console.log('price: ' + price)
                    // console.log('units: ' + units)
                    //if units are sufficient
                    if (element.units <= avlUnits) {
                      // console.log(5);
                      //sell it update in userStocks
                      var p = `'` + element.id + `'`;

                      var newUnits = avlUnits - element.units;
                      var amount_gained = element.units * price;
                      var newAmtInvested = result[0].amt_invested - amount_gained;
                      if (newAmtInvested < 0) {
                        newAmtInvested = 0;
                      }
                      //updating userStocks
                      var sql = `update userStocks set units=${newUnits}, amt_invested=${newAmtInvested} where id='${element.id}' and username='${element.username}'`;

                      db.query(sql, (error, result) => {
                        if (error) {
                          console.log(error);
                        } else {
                          // console.log(6);
                          //get the balance current from stockuser

                          var sql = `select * from stockuser where username='${element.username}'`;
                          db.query(sql, (error, result) => {
                            if (error) {
                              console.log(error);
                            } else {
                              // console.log(7);

                              //update the balance in stockuser
                              var newBal = result[0].amount + amount_gained;
                              var sql = `update stockuser set amount=${newBal} where username='${element.username}'`;
                              db.query(sql, (error, result) => {
                                if (error) {
                                  console.log(error);
                                } else {
                                  // console.log(8);
                                  //delete those stock from userStocks whose units are 0;
                                  var sql = `delete from userStocks where units=0`;
                                  db.query(sql, (error, result) => {
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      //
                                      // console.log(9);
                                      //delete from autosell
                                      var sql = `delete from autoSell where id='${element.id}' and username='${element.username}' and selected_price='${element.selected_price}'`;
                                      db.query(sql, (error, result) => {
                                        if (error) {
                                          console.log(error)
                                        } else {
                                          // console.log(10);



                                          //get todays date and time
                                          const currentDate = new Date();

                                          const year = currentDate.getFullYear();
                                          const month = currentDate.getMonth() + 1;
                                          const day = currentDate.getDate();

                                          const hours = currentDate.getHours();
                                          const minutes = currentDate.getMinutes();
                                          const seconds = currentDate.getSeconds();

                                          const formattedDate = `${day}-${month}-${year}`;
                                          const formattedTime = `${hours}:${minutes}:${seconds}`;
                                          ////////
                                          //put the value in transaction history
                                          var sql = `insert into transactionHistory values('${element.id}',${element.units},${amount_gained},'${formattedDate}','${formattedTime}','${element.username}')`;
                                          db.query(sql, (error, result) => {
                                            if (error) {
                                              console.log(error)
                                            } else {
                                              console.log('sold finalyy');
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
                      //insufficient units
                    }
                  } else {
                    //stock not in myStocks list
                  }
                }

              })

            } else {
              ///move to next array element
            }
          } catch (err) {
            console.error(err);
          }
        }

        await getPriceAndDoOperations();
      }
    }
  });
};

// autoSell();
setInterval(() => {
  autoSell();
}, 1500);
/////

////////////
//////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`listening to ${port} `);
});