#!/usr/bin/env bash

OUTPUT_PATH=/home/ajb/www/uglyhack.org/covid
REFRESH_OUTPUT=0

if [ -f "$OUTPUT_PATH/output.pdf" ]
then
    DATA_UPDATE_TIME_RAW=$(curl -s 'https://data.virginia.gov/api/views/metadata/v1/bre9-aqqr' | jq -r '.updatedAt')
    DATA_UPDATE_TIME=$(date --date "$DATA_UPDATE_TIME_RAW" +%s)
    OUTPUT_UPDATE_TIME=$(date -r "$OUTPUT_PATH/output.pdf" +%s)

    if [ "$DATA_UPDATE_TIME" -gt "$OUTPUT_UPDATE_TIME" ]
    then
            REFRESH_OUTPUT=1
    fi
else
    REFRESH_OUTPUT=1
fi

if [ "$REFRESH_OUTPUT" -eq 1 ]
then
    docker run -v /home/ajb/www/uglyhack.org/covid:/output covid_graph
fi