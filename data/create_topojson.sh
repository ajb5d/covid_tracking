#!/usr/bin/env bash

cat data/gz_2010_us_050_00_500k.json |
    jq '{type: .type , features: [ .features[]| select( .properties.STATE == "51") ] }' |
    npx geoproject 'd3.geoConicConformal().parallels([39, 40 + 15 / 60]).rotate([79 + 30 / 60, 0]).fitSize([960, 960], d)' |
    npx geo2topo |
    npx toposimplify -p1 -f |
    npx topoquantize 1e5 > public/va_counties.topojson