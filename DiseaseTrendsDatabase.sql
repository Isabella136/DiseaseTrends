create table Country(
    CountryCode char(3),
    Year int,
    CountryName varchar(255) unique,
    TotalPopulation int,
    ParentRegion varchar(255),
    ParentRegionCode char(3),
    primary key(CountryCode, Year));
select * from Country;

create table DiseaseInfo(
    CountryCode char(3),
    Year int,
    IndicatorCode varchar (255),
    Sex varchar(6),
    Causes varchar(23),
    Severity varchar(8),
    AgeGroup varchar(14),
    IndicatorName varchar(255) not null,
    IsLastYear char(1),
    SpecificStrain varchar(255),
    DiseaseName varchar(255),
    PopulationGroup varchar(255),
    primary key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    foreign key(CountryCode, Year) references Country(CountryCode, Year));
select * from DiseaseInfo;

create table DisabilityAdjustedLifeYears(
    CountryCode char(3),
    Year int,
    IndicatorCode varchar (255),
    Sex varchar(6),
    Causes varchar(23),
    Severity varchar(8),
    AgeGroup varchar(14),
    LikelyValue int,
    LowerValue int, 
    HigherValue int,
    primary key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    foreign key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    references DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));
select * from DisabilityAdjustedLifeYears;

create table Cases(
    CountryCode char(3),
    Year int,
    IndicatorCode varchar (255),
    Sex varchar(6),
    Causes varchar(23),
    Severity varchar(8),
    AgeGroup varchar(14),
    PerExpressionValue int default 1,
    IncidenceVsPrevalence varchar(10) default 'Unknown',
    LikelyValue_Prefix char(1),
    LowerValue_Prefix char(1), 
    HigherValue_Prefix char(1),
    LikelyValue_Numeric real,
    LowerValue_Numeric real, 
    HigherValue_Numeric real,
    primary key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    foreign key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    references DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));
select * from Cases;

create table Deaths(
    CountryCode char(3),
    Year int,
    IndicatorCode varchar (255),
    Sex varchar(6),
    Causes varchar(23),
    Severity varchar(8),
    AgeGroup varchar(14),
    PerExpressionValue int default 1,
    LikelyValue_Prefix char(1),
    LowerValue_Prefix char(1), 
    HigherValue_Prefix char(1),
    LikelyValue_Numeric real,
    LowerValue_Numeric real, 
    HigherValue_Numeric real,
    primary key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    foreign key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    references DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));
select * from Deaths;

create table Vaccines(
    CountryCode char(3),
    Year int,
    IndicatorCode varchar (255),
    Sex varchar(6),
    Causes varchar(23),
    Severity varchar(8),
    AgeGroup varchar(14),
    Rates int,
    primary key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup),
    foreign key(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup) 
    references DiseaseInfo(CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup));
select * from Vaccines;

