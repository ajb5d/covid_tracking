import requests
import sys
from datetime import datetime
import pytz

req = requests.get('https://data.virginia.gov/api/views/metadata/v1/bre9-aqqr')
TZ = pytz.timezone('America/New_York')

try:
    dat = req.json()

    updatedAt = datetime.strptime(dat['updatedAt'],"%Y-%m-%dT%H:%M:%S%z")
    threshold = datetime.now(TZ).replace(hour = 8, minute = 0, second = 0)

    if updatedAt < threshold:
        sys.exit(0)
except Exception as e:
    sys.exit(0)

sys.exit(1)