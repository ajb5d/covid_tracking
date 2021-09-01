#!/usr/bin/env python
from os import path
import pathlib

import pandas as pd
import numpy as np

FIX_KEYS = {
    "Blue Ridge": "Thomas Jefferson",
    "Rappahannock Rapidan": "Rappahannock/Rapidan",
    "Roanoke": "Roanoke City",
    "Rappahannock": "Rappahannock Area",
    "Pittsylvania-Danville": "Pittsylvania/Danville"
}

URL = "https://data.virginia.gov/api/views/3u5k-c2gr/rows.csv?accessType=DOWNLOAD"
covid_data = pd.read_csv(URL)
covid_data.columns = covid_data.columns.map(lambda x: x.lower().replace(" ", "_"))

covid_data['lab_report_date'] = pd.to_datetime(covid_data['lab_report_date'], errors='coerce')

covid_data.loc[covid_data['health_district'] == "Thomas Jefferson", "health_district"] = "Blue Ridge"
covid_data.drop(covid_data[covid_data.lab_report_date.isna()].index, inplace=True)

max_date = sorted(covid_data['lab_report_date'].unique())[-1]
threshold_date = max_date - np.timedelta64(7, 'D')

summary_data = covid_data[covid_data.lab_report_date >= threshold_date].groupby('health_district').agg(sum)
summary_data['pcr_rate'] = summary_data['number_of_positive_pcr_testing_encounters'] / summary_data['number_of_pcr_testing_encounters'] 
summary_data['vdh_hd'] = summary_data.index.map(lambda x: FIX_KEYS[x] if x in FIX_KEYS else x)

json_result = summary_data[['vdh_hd', 'pcr_rate']].to_json(orient='records')
pathlib.Path('../public/pcr_positive_by_hd.json').write_text(json_result)