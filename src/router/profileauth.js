const express = require("express");
var db = require("../database/db");
const jwt = require("jsonwebtoken");
const middlewares = require("../utils/verifyUser.js");
const router = express.Router();
router.get("/profileView", async (req, res, next) => {
  res.render("profileView");
});

///transaction history
router.get('/transactionHistory',(req,res)=>{
  //take data fron transactionHistory
  var sql=`select * from transactionHistory where username='yasir@arafat'`;
  // console.log(req.user.username);
  db.query(sql,(error,result)=>{
    res.render('transactionHistory',{result});
  })
  
})
/////
//autosellview
router.get('/autoSellView',(req,res)=>{
  //take data fron autoselltable
  var sql=`select * from autoSell where username='yasir@arafat'`;
  // console.log(req.user.username);
  db.query(sql,(error,result)=>{
    res.render('autoSellView',{result});
  })
  
})
router.get('/deleteAutoBuy',(req,res)=>{
  var username=req.query.username;
  var id=req.query.id;
  var selected_price=req.query.selected_price;
  console.log(username)
  console.log("id: "+id)
  console.log(selected_price)

  var sql=`delete from autoBuy where id='${id}' and username='${username}' and selected_price=${selected_price}`;
  db.query(sql,(error,result)=>{
    if(error){
      console.log(error);
    }
    else{
      res.redirect('/api/profileauth/autoBuyView');
    }
  })

})
//////

////autobuyview
router.get('/autoBuyView',(req,res)=>{
  //take data fron autobuy table
  var sql=`select * from autoBuy where username='yasir@arafat'`;
  // console.log(req.user.username);
  db.query(sql,(error,result)=>{
    res.render('autoBuyView',{result});
  })
  
})
router.get('/deleteAutoSell',(req,res)=>{
  var username=req.query.username;
  var id=req.query.id;
  var selected_price=req.query.selected_price;
  console.log(username)
  console.log("id: "+id)
  console.log(selected_price)

  var sql=`delete from autoSell where id='${id}' and username='${username}' and selected_price=${selected_price}`;
  db.query(sql,(error,result)=>{
    if(error){
      console.log(error);
    }
    else{
      res.redirect('/api/profileauth/autoSellView');
    }
  })

})
////


module.exports=router;