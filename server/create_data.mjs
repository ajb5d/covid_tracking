#!/usr/bin/env node
'use strict';

import * as path from 'path';
import fetch from 'node-fetch';
import { stat, readFile } from 'fs/promises'
import * as d3 from 'd3';
import url from 'url';

const populations = {"51000":85.35519,"51001":0.32316,"51003":1.0933,"51005":0.1486,"51007":0.13145,"51009":0.31605,"51011":0.15911,"51013":2.36842,"51015":0.75558,"51017":0.04147,"51019":0.78997,"51021":0.0628,"51023":0.33419,"51025":0.16231,"51027":0.21004,"51029":0.17148,"51031":0.54885,"51033":0.30725,"51035":0.29791,"51036":0.06963,"51037":0.1188,"51041":3.52802,"51043":0.14619,"51045":0.05131,"51047":0.52605,"51049":0.09932,"51051":0.14318,"51053":0.28544,"51057":0.10953,"51059":11.47532,"51061":0.71222,"51063":0.15749,"51065":0.2727,"51067":0.56042,"51069":0.89313,"51071":0.1672,"51073":0.37348,"51075":0.23753,"51077":0.1555,"51079":0.19819,"51081":0.11336,"51083":0.33911,"51085":1.07766,"51087":3.30818,"51089":0.50557,"51091":0.0219,"51093":0.37109,"51095":0.76523,"51097":0.07025,"51099":0.26836,"51101":0.17148,"51103":0.10603,"51105":0.23423,"51107":4.13538,"51109":0.37591,"51111":0.12196,"51113":0.13261,"51115":0.08834,"51117":0.30587,"51119":0.10582,"51121":0.98535,"51125":0.1493,"51127":0.23091,"51131":0.1171,"51133":0.12095,"51135":0.15232,"51137":0.37051,"51139":0.23902,"51141":0.17608,"51143":0.60354,"51145":0.29652,"51147":0.22802,"51149":0.38353,"51153":4.70335,"51155":0.34027,"51157":0.0737,"51159":0.09023,"51161":0.94186,"51163":0.22573,"51165":0.81948,"51167":0.26586,"51169":0.21566,"51171":0.43616,"51173":0.30104,"51175":0.17631,"51177":1.36215,"51179":1.52882,"51181":0.06422,"51183":0.11159,"51185":0.40595,"51187":0.40164,"51191":0.5374,"51193":0.18015,"51195":0.37383,"51197":0.28684,"51199":0.6828,"51510":1.59428,"51520":0.16762,"51530":0.06478,"51540":0.47266,"51550":2.44835,"51570":0.1737,"51580":0.05538,"51590":0.40044,"51595":0.05346,"51600":0.24019,"51610":0.14617,"51620":0.07967,"51630":0.29036,"51640":0.06347,"51650":1.3451,"51660":0.53016,"51670":0.22529,"51678":0.07446,"51680":0.82168,"51683":0.41085,"51685":0.17478,"51690":0.12554,"51700":1.79225,"51710":2.42742,"51720":0.03981,"51730":0.31346,"51735":0.12271,"51740":0.94398,"51750":0.18249,"51760":2.30436,"51770":0.99143,"51775":0.25301,"51790":0.24932,"51800":0.92108,"51810":4.49974,"51820":0.2263,"51830":0.14954,"51840":0.28078};

async function getFileUpdateTime(path) {
    return stat(path)
        .then((result) => result.mtime)
        .catch(() => new Date(0));
}

async function getRemoteUpdate(URL) {
    return fetch(URL, { method: "Get"})
        .then(response => response.json())
        .then(metadata => new Date(metadata.dataUpdatedAt));
}

async function callIfTargetStale(target, sourceMetadata, callback) {
    Promise.all([target, sourceMetadata]).then((values) => {
        console.log(values)
        if (values[0] < values[1]) {
            console.log("Should Update")
            callback();
        } else {
            console.log("Won't update")
        }
    });
}

function pathForTarget(file) {
    return path.join(".", file)
}

// callIfTargetStale(
//     getFileUpdateTime(pathForTarget("output.json")),
//     getRemoteUpdate("https://data.virginia.gov/api/views/metadata/v1/bre9-aqqr"),
//     () => {
//         console.log("UPDATE FUNC");
// });

// readFile('data.csv').then(data => {
//     const dateParser = d3.utcParse("%m/%d/%Y");
    
//     const csvData = d3.csvParseRows(data.toString(), (data,index) => {
//         if (index == 0) {
//             return undefined;
//         }
//         return {
//             reportDate: dateParser(data[0]) ?? data[0],
//             fips: data[1],
//             locality: data[2],
//             healthDistrict: data[3],
//             totalCases: +data[4]
//         };
//     });

//     const fips_map = d3.rollup(csvData, records => {
//         return {
//             locality: records[records.length - 1].locality,
//             healthDistrict: records[records.length -1].healthDistrict,
//       }}, d => d.fips)


//     csvData.forEach(obj => {
//         delete obj['locality'];
//         delete obj['healthDistrict'];
//         return obj;
//     });

//     const thresholdDate = d3.utcDay.offset(new Date(), -45);

//     const groupedData = d3.flatRollup(csvData.filter(d => d.reportDate >= thresholdDate),
//         records => d3.sum(records.map(r => r.totalCases)),
//         d => fips_map.get(d.fips).healthDistrict,
//         d => d.reportDate);

//     const newData = d3.rollup(groupedData, records => {
//         const runningTotals = records.map(d => d[2]).reverse()
//         return {
//             dates: records.map(d => d[1]).reverse(),
//             totalCases: runningTotals,
//             newCases: d3.pairs(runningTotals).map(([x,y]) => x - y),
//             weeklyCases: d3.range(0, runningTotals.length - 8).map(idx => runningTotals[idx] - runningTotals[idx + 7])
//         }
//     }, d => d[0]);


//     console.log(newData);

   
// })

// const thresholdDate = d3.utcDay.offset(new Date(), -45);
// const dateFormat = d3.timeFormat("%Y-%m-%d")
// const resourceURL = new url.URL('https://data.virginia.gov/resource/bre9-aqqr.json');
// resourceURL.searchParams.set('$where', `report_date > '${dateFormat(thresholdDate)}'`)
// resourceURL.searchParams.set('$select', 'report_date,fips,total_cases')

readFile('data.json')
    .then(d => {
        console.log(JSON.parse(d))
    })