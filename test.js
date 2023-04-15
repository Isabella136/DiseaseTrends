import {username, pw} from "./javascr/logininfo.js";

import oracledb from 'oracledb';

try {
    oracledb.initOracleClient({libDir: 'node_modules\\oracledb\\build\\Release\\instantclient_21_9'});
  } catch (err) {
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
  }

async function run() {

    let connection;
    try {
        connection = await oracledb.getConnection(
        {
            user          : username,
            password      : pw,  // mypw contains the hr schema password
            connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SID=ORCL)))"
        }
        );

        const tuple_count = await connection.execute(
            `SELECT ( SELECT COUNT(*) FROM NBONIN.Country ) 
                + ( SELECT COUNT(*) FROM NBONIN.Cases ) 
                + ( SELECT COUNT(*) FROM NBONIN.Deaths )
                + ( SELECT COUNT(*) FROM NBONIN.DisabilityAdjustedLifeYears ) 
                + ( SELECT COUNT(*) FROM NBONIN.DiseaseInfo )
                + ( SELECT COUNT(*) FROM NBONIN.Vaccines ) as TupleCount
            FROM dual`,
        );
        console.log(tuple_count.rows);

        const complex_one = await connection.execute(
            `SELECT Country.CountryName as Country, Country.year, SUM(Deaths.LikelyValue_numeric / (Country.TotalPopulation / 1000) ) as Deaths_Per_1000_In_Last_Decade
            FROM NBONIN.DiseaseInfo
                JOIN NBONIN.Deaths
                    ON DiseaseInfo.CountryCode = Deaths.CountryCode AND Deaths.Year = DiseaseInfo.Year AND Deaths.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Deaths.Sex AND DiseaseInfo.Causes = Deaths.Causes AND DiseaseInfo.Severity = Deaths.severity AND DiseaseInfo.AgeGroup = Deaths.AgeGroup
                JOIN NBONIN.Country
                    ON DiseaseInfo.CountryCode = Country.CountryCode AND DiseaseInfo.Year = Country.Year
            WHERE DiseaseInfo.DiseaseName = 'HIV' AND Deaths.Year >=2012 AND Deaths.LikelyValue_numeric IS NOT NULL
            GROUP BY Country.CountryName, Country.year
            ORDER BY Country.CountryName, Country.year`,
        );
        console.log(complex_one.rows);

        const complex_two = await connection.execute(
            `WITH CholeraPerRegion(parentregioncode, year, cases) AS (
                SELECT Country.parentregioncode, Cases.year as Year, SUM(Cases.LikelyValue_numeric)
                FROM NBONIN.Cases
                    JOIN NBONIN.DiseaseInfo
                        ON DiseaseInfo.CountryCode = Cases.CountryCode AND Cases.Year = DiseaseInfo.Year AND Cases.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Cases.Sex AND DiseaseInfo.Causes = Cases.Causes AND DiseaseInfo.Severity = Cases.severity AND DiseaseInfo.AgeGroup = Cases.AgeGroup
                    JOIN NBONIN.Country
                        ON Cases.countrycode = Country.countrycode AND Cases.year = Country.year
                WHERE DiseaseInfo.DiseaseName = 'Cholera'
                GROUP BY Cases.year, Country.parentregioncode)
            SELECT UNIQUE Country.parentregion, IncreaseList.Year, IncreaseList.Increase as Increase_In_Cholera_Per_Year
            FROM (
                SELECT CholeraPerRegion.parentregioncode, CholeraPerRegion.year, CholeraPerRegion.cases - CholeraPerRegionLastYear.cases AS Increase
                FROM CholeraPerRegion JOIN (SELECT * FROM CholeraPerRegion) CholeraPerRegionLastYear
                    ON CholeraPerRegion.parentregioncode = CholeraPerRegionLastYear.parentregioncode AND CholeraPerRegion.year = CholeraPerRegionLastYear.year + 1
                WHERE CholeraPerRegion.cases IS NOT NULL AND CholeraPerRegionLastYear.cases IS NOT NULL)IncreaseList
                JOIN Country ON IncreaseList.parentregioncode = Country.parentregioncode AND IncreaseList.year = Country.year
            WHERE IncreaseList.Year >=1995 AND IncreaseList.Year <= 2015
            ORDER BY Country.parentregion, IncreaseList.Year
            `,
        );
        console.log(complex_two.rows);

        const complex_three = await connection.execute(
            `WITH KenyaStats(countryname, Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients, Differences_With_Kenya) AS (
                SELECT Country.CountryName, AVG(Cases.LikelyValue_numeric) AS Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients, NULL AS Differences_With_Kenya
                FROM NBONIN.Cases
                    JOIN NBONIN.Country
                        ON Cases.CountryCode = Country.CountryCode AND Cases.year = Country.year
                    JOIN NBONIN.DiseaseInfo
                        ON DiseaseInfo.CountryCode = Cases.CountryCode AND Cases.Year = DiseaseInfo.Year AND Cases.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Cases.Sex AND DiseaseInfo.Causes = Cases.Causes AND DiseaseInfo.Severity = Cases.severity AND DiseaseInfo.AgeGroup = Cases.AgeGroup
                WHERE Cases.Year >=2002 AND DiseaseInfo.IndicatorName = 'Tested TB patients HIV-positive (%)' AND Country.CountryName = 'Kenya'
                GROUP BY Country.CountryName)
            SELECT countryname, Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients, Differences_With_Kenya
            FROM (
                SELECT countryname, Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients, Differences_With_Kenya, 1 AS orderpriority FROM KenyaStats
                UNION
                SELECT AllCountriesStats.countryname, AllCountriesStats.Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients, AllCountriesStats.Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients - KenyaStats.Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients AS Differences_With_Kenya, 2 AS orderpriority
                FROM (
                        SELECT Country.countryname AS countryname, AVG(Cases.LikelyValue_numeric) AS Percentage_Of_Tuberculosis_Cases_Among_HIV_Patients
                        FROM NBONIN.Cases
                            JOIN NBONIN.Country
                                ON Cases.CountryCode = Country.CountryCode AND Cases.year = Country.year
                            JOIN NBONIN.DiseaseInfo
                                ON DiseaseInfo.CountryCode = Cases.CountryCode AND Cases.Year = DiseaseInfo.Year AND Cases.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Cases.Sex AND DiseaseInfo.Causes = Cases.Causes AND DiseaseInfo.Severity = Cases.severity AND DiseaseInfo.AgeGroup = Cases.AgeGroup
                        WHERE Cases.Year >=2002 AND DiseaseInfo.IndicatorName = 'Tested TB patients HIV-positive (%)' AND Country.CountryName != 'Kenya'
                        GROUP BY Country.CountryName) AllCountriesStats
                    JOIN KenyaStats ON AllCountriesStats.countryname != KenyaStats.countryname)
            ORDER BY orderpriority, countryname
            `,
        );
        console.log(complex_three.rows);

        const complex_four = await connection.execute(
            `SELECT totalList.CountryName as Country, totalList.Year, (Cases.LikelyValue_numeric/totalList.totalCases)*100 as Percentage_Of_Total_Malaria_Cases_Confirmed
            FROM NBONIN.DiseaseInfo
                JOIN NBONIN.Cases
                    ON DiseaseInfo.CountryCode = Cases.CountryCode AND Cases.Year = DiseaseInfo.Year AND Cases.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Cases.Sex AND DiseaseInfo.Causes = Cases.Causes AND DiseaseInfo.Severity = Cases.severity AND DiseaseInfo.AgeGroup = Cases.AgeGroup
                JOIN NBONIN.Country
                    ON Cases.CountryCode = Country.CountryCode AND Cases.year = Country.year
                JOIN(
                    SELECT Country.CountryName, Cases.Year, Cases.LikelyValue_numeric as totalCases
                    FROM NBONIN.DiseaseInfo
                    JOIN NBONIN.Cases
                    ON DiseaseInfo.CountryCode = Cases.CountryCode AND Cases.Year = DiseaseInfo.Year AND Cases.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Cases.Sex AND DiseaseInfo.Causes = Cases.Causes AND DiseaseInfo.Severity = Cases.severity AND DiseaseInfo.AgeGroup = Cases.AgeGroup
                    JOIN NBONIN.Country
                    ON Cases.CountryCode = Country.CountryCode AND Cases.year = Country.year
                    WHERE DiseaseInfo.IndicatorCode = 'MALARIA_TOTAL_CASES' AND Cases.LikelyValue_numeric != 0
                ) totalList
                    ON Country.CountryName = totalList.CountryName AND Cases.Year = totalList.Year
            WHERE DiseaseInfo.IndicatorCode = 'MALARIA_CONF_CASES' AND Cases.Year<=2020 AND Cases.Year>=2000
            ORDER BY Country, Year
            `,
        );
        console.log(complex_four.rows);

        const complex_five = await connection.execute(
            `WITH VaccineInfo(countrycode, year, VaccineRates) AS (
                SELECT Vaccines.CountryCode, Vaccines.Year, Vaccines.rates
                FROM NBONIN.Vaccines
                    JOIN NBONIN.DiseaseInfo
                        ON DiseaseInfo.CountryCode = Vaccines.CountryCode AND Vaccines.Year = DiseaseInfo.Year AND Vaccines.IndicatorCode = DiseaseInfo.IndicatorCode AND DiseaseInfo.Sex = Vaccines.Sex AND DiseaseInfo.Causes = Vaccines.Causes AND DiseaseInfo.Severity = Vaccines.severity AND DiseaseInfo.AgeGroup = Vaccines.AgeGroup
                WHERE DiseaseInfo.diseaseName = 'Measles' AND DiseaseInfo.populationgroup = 'Nationally recommended age (second dose)'
                ORDER BY Vaccines.CountryCode, Vaccines.Year)
            SELECT Country.countryname, VaccineInfo.year, VaccineInfo.VaccineRates, (Cases.likelyvalue_numeric*100/Country.totalpopulation) AS MeaslesCasePercentageInPopulation
            FROM VaccineInfo JOIN Cases ON VaccineInfo.countrycode = Cases.countrycode AND VaccineInfo.year = Cases.year
                JOIN DiseaseInfo ON VaccineInfo.countrycode = DiseaseInfo.countrycode AND VaccineInfo.year = DiseaseInfo.year AND Cases.IndicatorCode = DiseaseInfo.IndicatorCode
                    AND Cases.Sex = DiseaseInfo.Sex AND DiseaseInfo.Causes = Cases.Causes AND DiseaseInfo.Severity = Cases.severity AND DiseaseInfo.AgeGroup = Cases.AgeGroup
                JOIN Country ON VaccineInfo.countrycode = Country.countrycode AND VaccineInfo.year = Country.year
            WHERE DiseaseInfo.DiseaseName = 'Measles'
            ORDER BY VaccineInfo.countrycode, VaccineInfo.year
            `,
        );
        console.log(complex_five.rows);

    } catch (err) {
        console.error('Whoops again!');
        console.error(err);
        process.exit(1);
    } finally {
    if (connection) {
        try {
        await connection.close();
        } catch (err) {
            console.error('Can\'t escape the Whoops!');
            console.error(err);
            process.exit(1);
        }
    }
    }
}

run();