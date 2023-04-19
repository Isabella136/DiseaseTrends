import express from 'express';
import bodyParser from 'body-parser';
import oracledb from 'oracledb';
import * as data from './variables.js';
import { username, pw } from '../javascr/logininfo.js';

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

app.get('/', (req, res) => {
    console.log("REFRESHED!");
    res.render('index'); //Renders EJS 
});


app.post('/total', (req, res) => {
  const query =
    `SELECT ( SELECT COUNT(*) FROM NBONIN.Country ) 
    + ( SELECT COUNT(*) FROM NBONIN.Cases ) 
    + ( SELECT COUNT(*) FROM NBONIN.Deaths )
    + ( SELECT COUNT(*) FROM NBONIN.DisabilityAdjustedLifeYears ) 
    + ( SELECT COUNT(*) FROM NBONIN.DiseaseInfo )
    + ( SELECT COUNT(*) FROM NBONIN.Vaccines ) as TupleCount
    FROM dual`;
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
          const tupleTotal = JSON.stringify(result.rows[0].TUPLECOUNT);
          console.log("Total: " + tupleTotal);
          res.send(tupleTotal);
      });
    });
});


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
            const data = result.rows.map(row => {
                const obj = {};
                for (let key in row) {
                  obj[key.toLowerCase()] = row[key];
                }
                return obj;
              });
              

            const columns = result.metaData.map(column => column.name);

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
