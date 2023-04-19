var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
const oracle = require('oracledb');
app.use(express.static('public'));


const PORT=3000; 

app.listen(PORT);









/*
fs.readFile('./test.html', function (err, html) {

    if (err) throw err;    

    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        var fileContents = fs.readFileSync('./css/style.css');
        response.write(html); 
        response.write(fileContents);
        response.end();  
    }).listen(PORT);
    http
});
*/
//x = { oracledb };