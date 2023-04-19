/*
import oracledb from 'oracledb';
//const { oracledb } = pkg;
import {username, pw} from "./logininfo.js";
import * as data from './variables.js';
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

async function fun()
{
    try {
        con = await oracledb.getConnection({
            user    : username,
            password : pw,
            connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
        });


        const result = await con.execute(
            data.key_select + data.key_distinct + data.atr_DiseaseInfo_DiseaseName + data.key_from + data.key_NBONIN + data.table_DiseaseInfo
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

export {fun};
*/