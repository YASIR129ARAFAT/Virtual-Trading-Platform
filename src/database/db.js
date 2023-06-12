var mysql = require("mysql2");
var db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Nasir@21",
  database: "software_engg",
});

    db.connect(function (err) {
      if (err) {
        console.log("Error in db connectivity");
      } else {
        console.log("connected to database");
      }
    });



module.exports=db;

