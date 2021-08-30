#!/usr/bin/env python
from os import path
import pathlib
import pandas as pd


population_data = pd.read_csv("data/population_data.csv", encoding = "ISO-8859-1")
population_data['FIPS'] = population_data['STATE'].map(lambda x: f"{x:02}") + population_data['COUNTY'].map(lambda x: f"{x:03}")
population_data['population'] =  population_data['POPESTIMATE2019'] / 100000
population_data = population_data[['FIPS', 'population']]

#URL = 'https://data.virginia.gov/api/views/bre9-aqqr/rows.csv?accessType=DOWNLOAD'
URL = 'rows.csv'
covid_data = pd.read_csv(URL, dtype = {'FIPS': 'str'}, parse_dates= ['Report Date'])

covid_data = covid_data.merge(population_data)

covid_data.loc[covid_data['VDH Health District'] == "Thomas Jefferson", "VDH Health District"] = "Blue Ridge"

average_data = covid_data.sort_values(['Report Date']).groupby(['VDH Health District', 'Report Date'], as_index=False).sum()

for column in ['Total Cases', 'Hospitalizations', 'Deaths']:
    average_data[f"{column} Lag"] = average_data.groupby(['VDH Health District'])[column].shift(7)

threshold_date = sorted(average_data['Report Date'].unique())[-90]
average_data = average_data[average_data['Report Date'] > threshold_date]

average_data['Case Average'] = (average_data['Total Cases'] - average_data['Total Cases Lag']) / average_data['population']

json_result = average_data[['VDH Health District', 'Report Date', 'Case Average']].to_json(orient='records')

pathlib.Path('./output.json').write_text(json_result)