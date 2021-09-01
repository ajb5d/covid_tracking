import shapefile
from json import dumps

def create_geojson(input : str , output : str):
# read the shapefile
    reader = shapefile.Reader(input)
    fields = reader.fields[1:]
    field_names = [field[0] for field in fields]
    buffer = []
    for sr in reader.shapeRecords():
        atr = dict(zip(field_names, sr.record))
        geom = sr.shape.__geo_interface__
        buffer.append(dict(type="Feature", \
        geometry=geom, properties=atr)) 
    
    # write the GeoJSON file
    
    geojson = open(output, "w")
    geojson.write(dumps({"type": "FeatureCollection", "features": buffer}, indent=2) + "\n")
    geojson.close()

FILES = {
    "vdh_health_districts/geo_export_ede290cb-5737-433c-89a8-963e9f314650.shp": "va_vdh.json",
    "cb_2018_us_county_20m/cb_2018_us_county_20m.shp": "counties.json"
}

for file in FILES:
    create_geojson(file, FILES[file])