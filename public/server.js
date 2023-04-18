/*
var express = require('express');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
const {username, pw} = require("./logininfo.js");
*/

/*
async function loadModule() {
    const express = await import('express');
    const bodyParser = await import('body-parser');
    const oracledb = await import('oracledb');
    const { username, pw } = await import('./logininfo.js');
    // Use the imported module...
  }
  
loadModule();
*/
import express from 'express';
import bodyParser from 'body-parser';
import oracledb from 'oracledb';
import * as data from './variables.js';
import { username, pw } from './logininfo.js';

//JSON.stringify(employees);

var PORT = process.env.PORT || 3000;

var app = express();
app.set('view engine', 'ejs');

var connectionProperties = 
{
    user: username,
    password: pw,
    connectionString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
}

function doRelease(con) {
    con.release(function (err) {
      if (err) {
        console.error(err.message);
      }
    });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

var router = express.Router();


router.use(function (request, response, next) {
    console.log("REQUEST:" + request.method + "   " + request.url);
    console.log("BODY:" + JSON.stringify(request.body));
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var employees = [];
var userQuery = "";
async function query()
{
    oracledb.getConnection(connectionProperties, function (err, con) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error connecting to DB");
          return;
        }
        con.execute("SELECT DISTINCT DiseaseInfo.DiseaseName FROM NBONIN.DiseaseInfo",{},  
        { outFormat: oracledb.OBJECT },
        function (err, result) {
            if (err) {
                console.error(err.message);
                response.status(500).send("Error getting data from DB");
                doRelease(connection);
                return;
            }
            console.log("RESULTSET:" + JSON.stringify(result));
            employees = [];
            result.rows.forEach(function (element) {
                employees.push(JSON.stringify(element.DISEASENAME).slice(1, -1));
                console.log(JSON.stringify(element.DISEASENAME).slice(1, -1));
            }, this);
        });
    });
}



app.get('/', (req, res) => {
    console.log("REFRESHED!");
    query();
    res.render('index', { employees: employees });
});

app.use(express.static('public'));
app.use('/', router);
app.listen(PORT);