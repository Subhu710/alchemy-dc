'use strict';
var watson = require('watson-developer-cloud');
var fs = require('fs');
var async = require('async');

var document_conversion = watson.document_conversion({
  username:     process.env.DC_USER_NAME || '4a827f90-fda8-4cbe-a758-cb61b24d8857',
  password:     process.env.DC_PASSWORD || '7MzxEagcOibX',
  version:      'v1',
  version_date: '2016-06-30'
});

// if bluemix credentials exists, then override local
var alchemyLanguage = watson.alchemy_language({
  api_key: process.env.API_KEY || '0e16fa6ac3a6fb720e2470f3cbe41af6a885dcdb'
});

function removeDuplicates(originalArray, prop) {
     var newArray = [];
     var lookupObject  = {};

     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }

     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
 }



function convert_document(req) {

}

module.exports.entities = function(req, res, next) {

  if (!req.file  && !req.file.path) {
    return next({ error: 'Missing required parameter: file', code: 400 });
  }
  // convert a single document
  document_conversion.convert({
    // (JSON) ANSWER_UNITS, NORMALIZED_HTML, or NORMALIZED_TEXT
    file: fs.createReadStream(req.file.path),
    conversion_target: document_conversion.conversion_target.ANSWER_UNITS,
    // Add custom configuration properties or omit for defaults
    pdf: {
      heading: {
        fonts: [
          { level: 1, min_size: 25 },
          { level: 2, min_size: 12, max_size: 12, bold: true },
          { level: 3, min_size: 9, max_size: 10, bold: true }
        ]
      }
    }
  }, function (err, response) {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      console.log("Document converted successfully. # of sections = "+ response.answer_units.length);
      getEntities(getSections(response), res);
    }
  });
};

function getEntities(sections, res) {

  var allEntities = [];
  async.each(sections, function(section, callback) {
      // Perform operation on section here.
      alchemyLanguage.entities({
        text: section.title + "\n" + section.text,
        model: process.env.MODEL_ID || "18b1610e-4a95-4299-b730-80e3988ba347"
      }, function(err, response) {
        if (err) {
          console.log('error', err);
          callback();
        } else {
          /*console.log("==========================");
          console.log("Section title:: " + section.title);
          console.log(JSON.stringify(response.entities));
          console.log("==========================");*/
          if (response.entities.length > 0) {
            response.entities.forEach(function(entity) {
              allEntities.push(entity);
            });
          }
          callback();
        }
      });
  }, function(err) {
      // if any of the sections produced an error, err would equal that error
      if( err ) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A section failed to process');
        res.send(allEntities);
      } else {
        console.log('All sections have been processed successfully');
        console.log(JSON.stringify(allEntities));
        var x = allEntities;

        var data = [];

        for(var i=0;i<x.length;i++){


          if((x[i]["type"]=="IAS_Officer")||(x[i]["type"]=="Leave_Start_Date")||(x[i]["type"]=="Leave_End_Date"))
          {
            if(x[i]["text"]!="Member of Service"){
            var tmp_var = {"type":x[i]["type"].replace(new RegExp('_','g'), ' '),"text":x[i]["text"]};
            data.push(tmp_var);
          }


          }

          var uniqueArray = removeDuplicates(data, "text"); 


        }

        var line = "";
        
        console.log(uniqueArray.length);
        for(var i=0;i<uniqueArray.length;i++){
        console.log(uniqueArray[i]["type"],uniqueArray[i]["text"]);

        line += "<b>"+String(uniqueArray[i]["type"])+"</b>" + ":" + String(uniqueArray[i]["text"]+"<br>");
      }

      console.log("line",line,allEntities);
      console.log("unique",uniqueArray)
       

      /*  var tmp = [];
        for(var i = 0; i < data.length; i++){
            if(tmp.indexOf(data[i]) == -1){
            tmp.push(data[i]);
            }
        }

        console.log("unique data",tmp.toString());

      */

      // document.getElementById("result").innerHTML = line;
      var html = "<!DOCTYPE html><html><head><title>Get 'Entities' in a PDF document</title><meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width, initial-scale=1'><link rel='stylesheet' href='stylesheets/style.css'></head><body background='/images/backg.jpg'><img class='logo' src='/images/aplogo.png' height='80' width='70'><div class='mainy'><h1>Government of Andhra Pradesh</h1></div><form class='fm' action='/'entities' method='post' enctype='multipart/form-data'><div class='fcontent'><center><span>Select PDF document to upload:</span><br><br><input id='file' type='file' name='file' accept='application/pdf', title='Choose a PDF document to upload' /><input type='submit' value='Upload Document' name='submit'><div id='entities' style='margin-top:10%;border: 1px solid black;'>"+line+"</div></div><!--  --></form></center></body></html>"
      res.send(html);

        
      }
  });
}

function getSections(response) {
  var sections = [];
  for (var i in response.answer_units) {
    var answer = response.answer_units[i];
    var title = answer.title;
    var section = {};
    var text = "";
    for (var j in answer.content) {
      if (answer.content[j].media_type == "text/plain") {
        text = answer.content[j].text;
      }
    }
    section["title"] = title;
    section["text"] = text;
    if (section.text.trim().length > 0) {
      sections.push(section);
    }
  }
  return sections;
}
