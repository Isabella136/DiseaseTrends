DROP TABLE Cases;
DROP TABLE Vaccines;
DROP TABLE Deaths;
DROP TABLE DisabilityAdjustedLifeYears;
DROP TABLE DiseaseInfo;
DROP TABLE Country;

CREATE TABLE Country(
    CountryCode CHAR(3),
    Year INT,
    CountryName VARCHAR(255),
    TotalPopulation INT,
    ParentRegion VARCHAR(255),
    ParentRegionCode CHAR(4),
    PRIMARY KEY(CountryCode, Year));

CREATE TABLE DiseaseInfo(
    CountryCode CHAR(3),
    Year INT,
    IndicatorCode VARCHAR(255),
    Sex VARCHAR(6),
    Causes VARCHAR(23),
    Severity VARCHAR(8),
    AgeGroup VARCHAR(14),
    IndicatorName VARCHAR(255) NOT NULL,
    EstimatedvsReported VARCHAR(9),
    IsLastYear CHAR(1),
    SpecificSpecies VARCHAR(255),
    DiseaseName VARCHAR(255),
    PopulationGroup VARCHAR(255),
    PRIMARY KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    FOREIGN KEY(CountryCode, Year) REFERENCES Country(CountryCode, Year));

CREATE TABLE DisabilityAdjustedLifeYears(
    CountryCode CHAR(3),
    Year INT,
    IndicatorCode VARCHAR(255),
    Sex VARCHAR(6),
    Causes VARCHAR(23),
    Severity VARCHAR(8),
    AgeGroup VARCHAR(14),
    LikelyValue INT,
    LowerValue INT, 
    HigherValue INT,
    PRIMARY KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    FOREIGN KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    REFERENCES DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));

CREATE TABLE Cases(
    CountryCode CHAR(3),
    Year INT,
    IndicatorCode VARCHAR(255),
    Sex VARCHAR(6),
    Causes VARCHAR(23),
    Severity VARCHAR(8),
    AgeGroup VARCHAR(14),
    PerExpressionValue INT default 1,
    IncidenceVsPrevalence VARCHAR(10) default 'Unknown',
    LikelyValue_Prefix CHAR(1),
    LowerValue_Prefix CHAR(1), 
    HigherValue_Prefix CHAR(1),
    LikelyValue_Numeric real,
    LowerValue_Numeric real, 
    HigherValue_Numeric real,
    PRIMARY KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    FOREIGN KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    REFERENCES DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));

CREATE TABLE Deaths(
    CountryCode CHAR(3),
    Year INT,
    IndicatorCode VARCHAR(255),
    Sex VARCHAR(6),
    Causes VARCHAR(23),
    Severity VARCHAR(8),
    AgeGroup VARCHAR(14),
    PerExpressionValue INT default 1,
    LikelyValue_Prefix CHAR(1),
    LowerValue_Prefix CHAR(1), 
    HigherValue_Prefix CHAR(1),
    LikelyValue_Numeric real,
    LowerValue_Numeric real, 
    HigherValue_Numeric real,
    PRIMARY KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    FOREIGN KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    REFERENCES DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));

CREATE TABLE Vaccines(
    CountryCode CHAR(3),
    Year INT,
    IndicatorCode VARCHAR(255),
    Sex VARCHAR(6),
    Causes VARCHAR(23),
    Severity VARCHAR(8),
    AgeGroup VARCHAR(14),
    Rates INT,
    PRIMARY KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    FOREIGN KEY(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    REFERENCES DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));
