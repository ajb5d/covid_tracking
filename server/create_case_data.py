#!/usr/bin/env python
from os import path
import pathlib
import pandas as pd

## This is the averaging window in days for the moving case average
SHIFT_COUNT = 7

population_data = pd.read_csv("../data/population_data.csv", encoding = "ISO-8859-1")
population_data['fips'] = population_data['STATE'].map(lambda x: f"{x:02}") + population_data['COUNTY'].map(lambda x: f"{x:03}")
population_data['population'] =  population_data['POPESTIMATE2019'] / 100000
population_data = population_data[['fips', 'population']]


URL = 'https://data.virginia.gov/api/views/bre9-aqqr/rows.csv?accessType=DOWNLOAD'
covid_data = pd.read_csv(URL, dtype = {'FIPS': 'str'}, parse_dates= ['Report Date'])
covid_data.columns = covid_data.columns.map(lambda x: x.lower().replace(" ", "_"))
covid_data = covid_data.merge(population_data)

covid_data.loc[covid_data['vdh_health_district'] == "Thomas Jefferson", "vdh_health_district"] = "Blue Ridge"

average_data = covid_data.sort_values(['report_date']).groupby(['vdh_health_district', 'report_date'], as_index=False).sum()

for column in ['total_cases', 'hospitalizations', 'deaths']:
    average_data[f"{column}_lag"] = average_data.groupby(['vdh_health_district'])[column].shift(SHIFT_COUNT)
    average_data[f"{column}_previous"] = average_data.groupby(['vdh_health_district'])[column].shift(1)

threshold_date = sorted(average_data['report_date'].unique())[-90]
average_data = average_data[average_data['report_date'] > threshold_date]

average_data['total_cases_average'] = (average_data['total_cases'] - average_data['total_cases_lag']) / (SHIFT_COUNT * average_data['population'])
average_data['total_cases_daily'] = (average_data['total_cases'] - average_data['total_cases_previous']) / (average_data['population'])

json_result = average_data[['vdh_health_district', 'report_date', 'total_cases_average', 'total_cases_daily']].to_json(orient='records')

pathlib.Path('../public/rates_by_hd.json').write_text(json_result)