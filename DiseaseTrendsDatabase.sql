create table Country(
    CountryCode char(3),
    Year int,
    CountryName varchar(255),
    TotalPopulation int,
    ParentRegion varchar(255),
    ParentRegionCode char(3),
    primary key(CountryCode, Year));
select * from Country;