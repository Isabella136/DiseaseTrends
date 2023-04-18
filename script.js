import {username, pw} from ("./javascr/logininfo.js");
import oracledb from ('oracledb');
import { key_select,
    key_from,
    key_distinct,
    key_where,
    key_countAll,
    key_All,
    key_NBONIN,
    table_Cases,
    table_Country,
    table_DiseaseInfo,
    table_DisabilityAdjustedLifeYears,
    table_Deaths,
    table_Vaccines,
    atr_Cases_Year,
    atr_DiseaseInfo_DiseaseName
} from ('variables.js');
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
            key_select + key_distinct + atr_DiseaseInfo_DiseaseName + key_from + key_NBONIN + table_DiseaseInfo
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