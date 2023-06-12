const json = require("body-parser/lib/types/json");

function get_details(str){
    if(str!==" "){
        $.ajax({
          url: "/student_project",
          method: "post",
          contentType: "application/json",
          data: json.stringify({ choice: str }),
          success: function (result) {

          },
        });
    }

}