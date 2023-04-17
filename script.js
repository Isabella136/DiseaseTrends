const oracledb = require('oracledb');
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
            user    : "gperezcolon",
            password : "yPl6ViBu7PezXHilFbn5Jpxp",
            connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
        });
    }

    catch (err)
    {
        console.error('Whoops!');
        console.error(err);
        process.exit(1);
    }

}
fun();

try {
    const result = await con.execute(
        'SELECT cases.year FROM NBONIN.Cases WHERE cases.year > 1999'
    );
    console.log(data.rows)
}
catch (err)
{
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
}
