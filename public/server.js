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
    res.render('index', { employees: employees });
});

/*
app.get('/query', function(req, res) {
    oracledb.getConnection(connectionProperties, function (err, con) {
      if (err) {
        console.error(err.message);
        res.status(500).send("Error connecting to DB");
        return;
      }
      con.execute("SELECT DISTINCT Country.CountryName FROM NBONIN.Country",{},  
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          res.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        //console.log("RESULTSET:" + JSON.stringify(result));
        const data = result.rows.map(function(element) {
            return { id: element.COUNTRYNAME };
          });
        //res.json(data);
      });
    });
});
*/
  
app.post('/query1', (req, res) => {
    const query = req.body.query;
    console.log('Query received from client:', query);
    oracledb.getConnection(connectionProperties, function (err, con) {
        if (err) {
          console.error(err.message);
          res.status(500).send("Error connecting to DB");
          return;
        }
        con.execute(query,{},  
        { outFormat: oracledb.OBJECT },
        function (err, result) {
            if (err) {
                console.error(err.message);
                res.status(500).send("Error getting data from DB");
                doRelease(con);
                return;
            }
            console.log("RESULTSET:" + JSON.stringify(result));
            const data = result.rows.map(row => {
                const obj = {};
                for (let key in row) {
                  obj[key.toLowerCase()] = row[key];
                }
                return obj;
              });
              
            console.log("PARSED DATA:" + JSON.stringify(data));

            const columns = result.metaData.map(column => column.name);

            const data3 = result.rows.map(function(row) {
                const obj = {};
                columns.forEach((column, index) => {
                  const value = JSON.stringify(row[index]);
                  obj[column] = value;
                  //console.log(`column: ${column}, value: ${JSON.stringify(value)}`);
                });
                return obj;
              });

            //console.log("dataSET:" + JSON.stringify(data.map(obj => obj)));
            const tableHeaders = columns.map(column => `<th>${column}</th>`).join('');
            const tableRows = data.map(row => {
                const rowCells = Object.values(row).map(value => `<td>${(JSON.stringify(value, (key, val) => (val === null ? 'null' : val)).replace(/^"(.+(?="$))"$/, '$1'))}</td>`).join('');
                return `<tr>${rowCells}</tr>`;
            }).join('');
            const tableHtml = `<table><thead><tr>${tableHeaders}</tr></thead><tbody>${tableRows}</tbody></table>`;
            res.status(200).send(tableHtml);
        });
      });
  });

app.use(express.static('public'));
app.use('/', router);
app.listen(PORT);

export {query};