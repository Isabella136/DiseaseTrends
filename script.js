import {username, pw} from "./javascr/logininfo.js";
import oracledb from 'oracledb';
//const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let con;
try {
    oracledb.initOracleClient({libDir: 'node_modules\\oracledb\\build\\Release\\instantclient_21_9'});
}
catch (err) {
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
}

const key_select = 'SELECT ';
const key_from = 'FROM ';
const key_where = 'WHERE ';
const key_countAll = 'COUNT(*) ';
const key_NBONIN = 'NBONIN.';
const table_Cases = 'Cases ';
async function fun()
{
    try {
        con = await oracledb.getConnection({
            user    : username,
            password : pw,
            connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
        });


        const result = await con.execute(
            key_select + 'cases.year ' + key_from + 'NBONIN.Cases ' + key_where + 'cases.year > 1999'
        );
        console.log(result.rows)
    }

    catch (err)
    {
        console.error('Whoops!');
        console.error(err);
        process.exit(1);
    }

}
fun();