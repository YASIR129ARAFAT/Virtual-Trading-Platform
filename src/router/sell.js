const express = require("express");
var con = require("../database/db");
const router = express.Router();
const middlewares = require("../utils/verifyUser.js");
const fetch = require("node-fetch");
const {
  use
} = require("passport");

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
router.get("/sellStocks", async (req, res) => {
  var id = req.query.id;
  var message = req.query.error;

  res.render("sellStocks", {
    id,
    message
  });
});

const getPriceNew = async (row) => {
  try {
    row += "EQN";
    const apiKey = "62bd052f8cmsh23bc0917e49ac99p114e72jsn0d060908d7c5";
    const index = "NIFTY 200";
    const response = await fetch(
      `https://latest-stock-price.p.rapidapi.com/price?Indices=${index}&Identifier=${row}`, {
        headers: {
          "x-rapidapi-host": "latest-stock-price.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      }
    );

    const data = await response.json();
    // console.log(data)
    return data[0].lastPrice;
  } catch (err) {
    console.error(err);
    //  res.status(500).send("Server Error");
  }
};
router.post("/sellStock", async (req, res) => {
  var unit = req.body.units;
  var stockId = req.body.stockid;
  var username = req.body.username;

  var password = req.body.password;
  var total_amount_invested_in_that_stock = 0;
  var net_profit = 0;
  var net_loss = 0;
  var units_in_database = 0;
  var original_amount_in_stockuser;
  var orginalprofit = 0;
  var originalloss = 0;

  const sql = `select * from  userStocks where username='${username}' and id='${stockId}'`;

  con.query(sql, async (error, result) => {
    if (error) {
      console.log(error);
      res.redirect(
        `/api/sell/sellStocks?id=${stockId}&error=` +
        encodeURIComponent("Unexpected-error")
      );
      //   return;
    } else {
      if (result[0]) {
        if (result[0].units >= unit) {
          units_in_database = result[0].units;
          total_amount_invested_in_that_stock = result[0].amt_invested;

          const sql1 = `select * from  stockuser where username='${username}'`;
          con.query(sql1, async (error, result) => {
            if (error) {
              res.redirect(
                `/api/sell/sellStocks?id=${stockId}&error=` +
                encodeURIComponent("Invalid-Credential")
              );

            } else {
              originalloss = result[0].loss;
              orginalprofit = result[0].profit;

              // console.log(result[0]);
              let gg = crypt.decrypt(result[0].password);
              if (gg.localeCompare(password) == 0) {
                original_amount_in_stockuser = result[0].amount;

                if (units_in_database == unit) {
                  var currentPrice = await getPriceNew(stockId);
                  var currentValue = unit * currentPrice;

                  if (currentValue >= total_amount_invested_in_that_stock) {
                    net_profit =
                      net_profit +
                      currentValue -
                      total_amount_invested_in_that_stock;
                  } else {
                    net_loss =
                      net_loss +
                      total_amount_invested_in_that_stock -
                      currentValue;
                  }
                  if (net_profit >= 0) {
                    orginalprofit = orginalprofit + net_profit;
                  }
                  if (net_loss >= 0) {
                    originalloss = originalloss + net_loss;
                  }

                  original_amount_in_stockuser =
                    original_amount_in_stockuser + currentValue;

                  const sql3 = `update stockuser set amount=${original_amount_in_stockuser}, profit=${orginalprofit}, loss=${originalloss} where username="${username}"`;
                  con.query(sql3, async (error, result) => {
                    if (error) {
                      console.log(error);
                    } else {
                      res.redirect(
                        `/api/sell/sellStocks?id=${stockId}&error=` +
                        encodeURIComponent("Successfully sold")
                      );
                    }
                  });

                  const sql5 = `delete from userStocks where id='${stockId}'`;
                  con.query(sql5, async (error, result) => {
                    if (error) {
                      console.log(error);
                      //    res.send("unsuccessfully");
                    } else {
                      console.log("succeffuly deleted")
                    }
                  });
                } else {
                  var currentPrice = await getPriceNew(stockId);
                  var currentValue = unit * currentPrice;
                  var new_units = units_in_database - unit;
                  var totalamount_investifor_entered_unit =
                    (total_amount_invested_in_that_stock * unit) /
                    units_in_database;
                  var new_total_amount_invested =
                    total_amount_invested_in_that_stock -
                    (total_amount_invested_in_that_stock * unit) /
                    units_in_database;
                  //console.log(new_total_amount_invested);

                  if (currentValue >= totalamount_investifor_entered_unit) {
                    net_profit =
                      net_profit +
                      currentValue -
                      totalamount_investifor_entered_unit;
                  } else {
                    net_loss =
                      net_loss +
                      totalamount_investifor_entered_unit -
                      currentValue;
                  }
                  // console.log(net_loss);

                  if (net_profit >= 0) {
                    orginalprofit = orginalprofit + net_profit;
                  }
                  if (net_loss >= 0) {
                    originalloss = originalloss + net_loss;
                  }

                  original_amount_in_stockuser =
                    original_amount_in_stockuser + currentValue;

                  const sql2 = `update userStocks set units=${new_units}, amt_invested=${new_total_amount_invested} where username="${username}" and id="${stockId}"`;
                  con.query(sql2, async (error, result) => {
                    if (error) {
                      console.log("eroor");
                    } else {
                      const sql3 = `update stockuser set amount=${original_amount_in_stockuser},  profit=${orginalprofit}, loss=${originalloss} where username="${username}"`;
                      con.query(sql3, async (error, result) => {
                        if (error) {
                          console.log(error);
                        } else {
                          res.redirect(
                            `/api/sell/sellStocks?id=${stockId}&error=` +
                            encodeURIComponent("succeffully sold")
                          );
                        }
                      });
                    }
                  });
                }
              } else {
                res.redirect(
                  `/api/sell/sellStocks?id=${stockId}&error=` +
                  encodeURIComponent("Invalid passwrod")
                );
              }
            }
          });
        } else {
          res.redirect(
            `/api/sell/sellStocks?id=${stockId}&error=` +
            encodeURIComponent("Invalid-creadential")
          );
        }
      } else {
        res.redirect(
          `/api/sell/sellStocks?id=${stockId}&error=` +
          encodeURIComponent("Invalid-creadential")
        );
      }
    }
  });
});


//user review


///auto buy
router.get('/autoBuy', (req, res) => {
  var id = req.query.id;
  var error = req.query.error;
  console.log('id from get auto buy' + id);
  res.render('autoBuy', {
    id,
    error
  });
})

router.post('/autoBuyStock', (req, res) => {
  var symbol2 = req.body.stockid
  let symbol = symbol2.substring(0, symbol2.length - 3);
  console.log(symbol);
  var username = req.body.username;
  var password = req.body.password;
  var units = parseInt(req.body.units);
  var selected_price = parseFloat(req.body.targetPrice);

  //verify user id and password
  var sql = `select * from stockuser where username='${username}'`;

  con.query(sql, (error, result) => {
    if (error) {
      console.log(error, 'eroor in finding username')

    } else {
      if (result[0]) {
        //verify password
        let gg = crypt.decrypt(result[0].password);
        if (gg.localeCompare(password) == 0) {
          //password matches with username
          //check for sufficient balance
          var amount_req = units * selected_price;
          if (result[0].amount < amount_req) {
            console.log('insufficient balance')
            console.log('symbol: ' + symbol)
            res.redirect(
              `/api/sell/autoBuy?id=${symbol2}&error=Insufficient balance`
            );
          } else {
            //balance is sufficient
            //now enter in the table autoBuy
            var sql = `select * from autoBuy where id='${symbol}' and username='${username}' and selected_price=${selected_price}`;

            con.query(sql, (error, result) => {
              if (error) {
                console.log(error)
              } else {
                if (result[0]) {
                  //if stock already in autoBuy
                  var newUnits = units + result[0].units;
                  var sql = `update autoBuy set units=${newUnits},selected_price=${selected_price} where id='${symbol}'`;
                  con.query(sql, (error, result) => {
                    if (error) {
                      console.log(error)
                    } else {
                      console.log('sucess in autoBuy')
                      console.log('symbol: ' + symbol)
                      res.redirect(
                        `/api/sell/autoBuy?id=${symbol2}&error=sucessfully added`
                      );
                    }
                  })
                } else {
                  var sql = `INSERT INTO autoBuy VALUES ('${symbol}', ${units}, '${username}', ${selected_price})`;
                  con.query(sql, (error, result) => {
                    if (error) {
                      console.log(error)
                    } else {
                      console.log('sucess in autoBuy')
                      console.log('symbol: ' + symbol)
                      res.redirect(
                        `/api/sell/autoBuy?id=${symbol2}&error=sucessfully added`
                      );
                    }
                  })
                }
              }
            })
          }
        } else {
          console.log('symbol: ' + symbol)
          res.redirect(
            `/api/sell/autoBuy?id=${symbol2}&error=wrong password`
          );
        }
      } else {
        console.log('symbol: ' + symbol)
        res.redirect(
          `/api/sell/autoBuy?id=${symbol2}&error=invalid credentials`
        );
      }
    }
  })

})

////auto sell
router.get('/autoSell', (req, res) => {
  var id = req.query.id;

  var error = req.query.error;
  console.log('id from get sell' + id);
  res.render('autoSell', {
    id,
    error
  });
})

////
router.post('/autoSellStock', (req, res) => {
  var symbol2 = req.body.stockid
  let symbol = symbol2.substring(0, symbol2.length - 3);
  console.log(symbol);
  var username = req.body.username;
  var password = req.body.password;
  var units = parseInt(req.body.units);
  var selected_price = parseFloat(req.body.targetPrice);

  //verify user id and password
  var sql = `select * from stockuser where username='${username}'`;

  con.query(sql, (error, result) => {
    if (error) {
      console.log(error, 'error in finding username during auto sell')

    } else {
      if (result[0]) {
        //verify password
        let gg = crypt.decrypt(result[0].password);
        if (gg.localeCompare(password) == 0) {
          //password matches with username
          //check for sufficient balance

          if (result[0].units >= units) {
            console.log('insufficient balance')
            res.redirect(
              `/api/sell/autoSell?id=${symbol2}&error=Insufficient units`
            );
          } else {
            //balance is sufficient
            //now enter in the table autoBuy
            var sql = `select * from autoSell where id='${symbol}' and username='${username}' and selected_price=${selected_price}`;

            con.query(sql, (error, result) => {
              if (error) {
                console.log(error)
              } else {
                if (result[0]) {
                  //if stock already in autoSell
                  var newUnits = result[0].units + units;
                  var sql = `update autoSell set units=${newUnits},selected_price=${selected_price} where id='${symbol}'`;
                  con.query(sql, (error, result) => {
                    if (error) {
                      console.log(error)
                    } else {
                      console.log('sucess in autoSell')
                      res.redirect(
                        `/api/sell/autoSell?id=${symbol2}&error=sucessfully added`
                      );
                    }
                  })
                } else {
                  var sql = `INSERT INTO autoSell VALUES ('${symbol}', ${units}, '${username}', ${selected_price})`;
                  con.query(sql, (error, result) => {
                    if (error) {
                      console.log(error)
                    } else {
                      console.log('sucess in autoSell')
                      res.redirect(
                        `/api/sell/autoSell?id=${symbol2}&error=sucessfully added`
                      );
                    }
                  })
                }
              }
            })
          }
        } else {
          res.redirect(
            `/api/sell/autoSell?id=${symbol2}&error=wrong password`
          );
        }
      } else {
        res.redirect(
          `/api/sell/autoSell?id=${symbol2}&error=invalid credentials`
        );
      }
    }
  })

})
///

///




module.exports = router;