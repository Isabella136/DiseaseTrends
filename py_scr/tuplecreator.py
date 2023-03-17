import csv, os

# {[CountryCode, Year] : [CountryName, TotalPopulation, ParentRegion, ParentRegionCode]}
country_tuples = dict()

# {[CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup] : 
#  [IndicatorName, EstimatedvsReported, IsLastYear, SpecificSpecies, DiseaseName, PopulationGroup]}
disease_info_tuples = dict()

# {[CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup] : 
#  [LikelyValue, LowerValue, HigherValue]}
disability_adjusted_life_years_tuples = dict()

# {[CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup] : 
#  [PerExpressionValue, IncidenceVsPrevalence, LikelyValue_Prefix, LowerValue_Prefix, HigherValue_Prefix,
#   LikelyValue_Numeric, LowerValue_Numeric, HigherValue_Numeric]}
cases_tuples = dict()

# {[CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup] : 
#  [PerExpressionValue, LikelyValue_Prefix, LowerValue_Prefix, HigherValue_Prefix,
#   LikelyValue_Numeric, LowerValue_Numeric, HigherValue_Numeric]}
deaths_tuples = dict()

# {[CountryCode, Year, IndicatorCode, Sex, Causes, Severity, AgeGroup] : [Rates]}
vaccines_tuples = dict()

country_to_region_dict = dict()
WHO_datasets = os.listdir("datasets/WHO")
for dataset in WHO_datasets:
    with open("datasets/WHO/" + dataset) as dataset_file:
        dataset_reader = csv.reader(dataset_file)
        for row_num, row in enumerate(dataset_reader):
            if row_num == 0:
                continue
            if row[6] not in country_to_region_dict:
                country_to_region_dict.update({row[6]:[row[4], row[3]]})

            sex = "NA"
            causes = "NA"
            severity = "NA"
            agegroup = "NA"
            per_expression_value = "1"
            incidence_vs_prevalence = "Prevalence" if "with" in row[1] else "Incidence"
            estimated_vs_reported = "Estimated" if ("Estimated" in row[1]) or ("estimated" in row[1]) else "Reported"
            species = "NULL"
            disease = None
            population_group = "NULL"

            if row[10] == "Sex":    sex = row[11].split(' ')[0]
            elif row[13] == "Sex":  sex = row[14].split(' ')[0]
            elif row[16] == "Sex":  sex = row[17].split(' ')[0]
            
            if row[10] == "Causes":    causes = row[11]
            elif row[13] == "Causes":  causes = row[14]
            elif row[16] == "Causes":  causes = row[17]

            if row[10] == "Severity":    severity = row[11]
            elif row[13] == "Severity":  severity = row[14]
            elif row[16] == "Severity":  severity = row[17]

            if row[10] == "Age Group":    agegroup = row[11].split(' (')[0]
            elif row[13] == "Age Group":  agegroup = row[14].split(' (')[0]
            elif row[16] == "Age Group":  agegroup = row[17].split(' (')[0]

            if ("per 1000" in row[1]) or ("thousands" in row[1]):   per_expression_value = "1000"
            elif "per 100 000" in row[1]:                           per_expression_value = "100000"

            if "P. falciparum" in row[1]:   strain = "P. falciparum"
            elif "P. vivax" in row[1]:      strain = "P. vivax"
            elif "poliovirus" in row[1]:    strain = "poliovirus"

            if ("tuberculosis" in row[1]) or ("TB" in row[1]):  disease = "Tuberculosis"
            elif "Congenital Rubella Syndrome" in row[1]:       disease = "Congenital Rubella Syndrome"
            elif "Congenital syphilis" in row[1]:               disease = "Congenital syphilis"
            elif "Diphtheria" in row[1]:                        disease = "Diphtheria"
            elif "imported" in row[1]:                          disease = "Imported malaria"
            elif "indigenous" in row[1]:                        disease = "Indigenous malaria"
            elif "malaria" in row[1]:                           disease = "Malaria"
            elif "HIV" in row[1]:                               disease = "HIV"
            elif "Japanese encephalitis" in row[1]:             disease = "Japanese encephalitis"
            elif "leprosy" in row[1]:                           disease = "Leprosy"
            elif "Measles" in row[1]:                           disease = "Measles"
            elif "Mumps" in row[1]:                             disease = "Mumps"
            elif "Neonatal tetanus" in row[1]:                  disease = "Neonatal tetanus"
            elif "anaemia" in row[1]:                           disease = "Anaemia"
            elif "non-communicable diseases" in row[1]:         disease = "Non-communicable diseases"
            elif "diarrhoea" in row[1]:                         disease = "Diarrhoea"
            elif "cholera" in row[1]:                           disease = "Cholera"
            elif "human African trypanosomiasis" in row[1]:     disease = "Human African trypanosomiasis"
            elif "poliomyelitis" in row[1]:                     disease = "Polio"
            elif "Poliomyelitis" in row[1]:                     disease = "Polio"
            elif "meningitis" in row[1]:                        disease = "Meningitis"
            elif "Pertussis" in row[1]:                         disease = "Pertussis"
            elif "Rubella" in row[1]:                           disease = "Rubella"
            elif "tetanus" in row[1]:                           disease = "Tetanus"
            elif "Yellow fever" in row[1]:                      disease = "Yellow fever"
            else: print(row[1])

            if "HIV positive" in row[1]:                                population_group = "HIV positive"
            elif "children aged 0 - 14" in row[1]:                      population_group = "Children < 15"
            elif "children less than 15" in row[1]:                     population_group = "Children < 15"
            elif "1 year olds" in row[1]:                               population_group = "1 year olds (first dose)"
            elif "nationally recommended age" in row[1]:                population_group = "Nationally recommended age (second dose)"
            elif "children aged 6 to 59 months" in row[1]:              population_group = "Children aged 6 to 59 months"
            elif "inadequate water, sanitation and hygiene" in row[1]:  population_group = "Inadequate water, sanitation and hygiene"
            elif "excluding HIV" in row[1]:                             population_group = "Excluding HIV"
            elif "non pregnant women aged 15 to 45" in row[1]:          population_group = "Non pregnant women aged 15 to 45"
            elif "pregnant women aged 15 to 45" in row[1]:              population_group = "Pregnant women aged 15 to 45"
            elif "at risk" in row[1]:                                   population_group = "At risk"

            if ("death" in row[1]) or ("dying" in row[1]):
                deaths_tuples.update({(row[6], row[9], row[0], sex, causes, severity, agegroup) :
                                      [per_expression_value, row[22], row[25], row[27], row[23], row[26], row[28]]})
            elif "disability_adjusted_life_years" in row[1]:
                disability_adjusted_life_years_tuples.update({(row[6], row[9], row[0], sex, causes, severity, agegroup) :
                                                              [per_expression_value, incidence_vs_prevalence, 
                                                               row[23], row[26], row[28]]})
            elif "vaccination" in row[1]:
                vaccines_tuples.update({(row[6], row[9], row[0], sex, causes, severity, agegroup) : [row[23]]})
            else:
                cases_tuples.update({(row[6], row[9], row[0], sex, causes, severity, agegroup) :
                                     [per_expression_value, incidence_vs_prevalence, 
                                      row[22], row[25], row[27], row[23], row[26], row[28]]})
            disease_info_tuples.update({(row[6], row[9], row[0], sex, causes, severity, agegroup) :
                                        [row[0], estimated_vs_reported, row[10], species, disease, population_group]})

with open("datasets/Country_Population.csv",'r') as country_pop_file:
    country_pop_reader = csv.reader(country_pop_file)
    year_list = list()
    for row_num, row in enumerate(country_pop_reader):
        if row_num < 4:
            continue
        if row_num == 4:
            year_list = row[4:]
            continue
        if row[1] in country_to_region_dict.keys():
            for index, year in enumerate(year_list):
                country_tuples.update({(row[1], year) : 
                                       [row[0], row[4+index], country_to_region_dict[row[1]][0],  
                                        country_to_region_dict[row[1]][1]]})      

country_tuples